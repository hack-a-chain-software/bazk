import { signatureVerify } from "@polkadot/util-crypto";
import * as ra from "@phala/ra-report";
import { getClient, getContract, signCertificate } from "@phala/sdk";
import { execFile  } from "../utils/exec";
import { iasApiKey, sgxEnabled } from "../constants/env";
import { VALIDATOR_ABI, VALIDATOR_CONTRACT_ADDRESS } from "../constants/contract";
import { RPC } from "../constants/phala";
import { generateKeyPair, getPhase, pad64, validadeDeadline, validateLastHash } from "../utils/phala";
import { getOutputFiles } from "../utils/file";
import { getMetadatas } from "../utils/metadata";

export const dispatch = async (args?: string[]): Promise<any> => {
  console.log("[Enclave] Getting key pair...");
  const pair = generateKeyPair();
  const publicKey = pair.publicKey;

  console.log("[Phala] Connecting to validator contract...");
  const validatorContract = await ra.Contract.connect({
    rpc: RPC,
    contractId: VALIDATOR_CONTRACT_ADDRESS,
    pair,
    abi: VALIDATOR_ABI,
  });

  const cert = await signCertificate({ pair });
  const phatRegistry = await getClient({ transport: RPC });
  const contract = await getContract({
    client: phatRegistry,
    contractId: VALIDATOR_CONTRACT_ADDRESS,
    abi: VALIDATOR_ABI,
  });

  let sigOfPubkey = "";
  if (sgxEnabled) {
    console.log("Getting report...");
    const report = await ra.createRemoteAttestationReport({
      iasKey: iasApiKey ?? "",
      userReportData: Buffer.from(publicKey),
    });
    console.log("Report: ", report);

    console.log("Signing report...");
    const validateResult = (await validatorContract.call(
      "sign",
      report
    )) as any;
    if (validateResult?.isErr) {
      throw new Error(`Failed to sign the report: ${validateResult.asErr}`);
    }
    sigOfPubkey = validateResult.asOk.toHex();
    console.log("Signature of public key: ", sigOfPubkey);
  }

  let ceremonyId = undefined;
  let firstArgument = args?.shift() as number | string;
  let commandfileName = "";

  console.log("[Enclave] Looking for the ceremony Id...");

  let power = 0;
  let bash = 0;

  const fileArgs = args as string[];

  console.log("[Enclave] File name: ", commandfileName);
  console.log("[Enclave] File args: ", fileArgs);

  let phase = 0;

  let deadline = "";
  let description = "";
  let name = "";
  const timestamp = Math.floor(Date.now() / 1000);
  const isCeremonyIdNotProvided = isNaN(firstArgument as number);

  if (isCeremonyIdNotProvided) {
    console.log(
      "[Enclave] Ceremony id not provided, generating new ceremony..."
    );

    commandfileName = firstArgument as string;
    phase = getPhase(commandfileName);
    deadline = args?.pop() as string;
    description = args?.pop() as string;
    name = args?.pop() as string;

    if (phase === 1) {
      bash = Number(args?.[args.length - 1]);
      power = Number(args?.[args.length - 2]);
    } else {
      bash = Number(args?.pop());
      power = Number(args?.pop());
    }

    if (name == null) {
      return {
        error: "[Enclave] Name not provided, please provide a name for the ceremony"
      };
    }

    if (description == null) {
      return {
        error: "[Enclave] Description not provided, please provide a description for the ceremony"
      };
    }

    if (deadline == null) {
      return {
        error: "[Enclave] Deadline not provided, please provide a deadline for the ceremony"
      };
    }

    ceremonyId = timestamp;
  } else {
    console.log("[Enclave] Ceremony id provided, continuing ceremony...");
    ceremonyId = firstArgument as number;
    commandfileName = args?.shift() as string;
    phase = getPhase(commandfileName);
    bash = Number(args?.[args.length - 1]);
    power = Number(args?.[args.length - 2]);

    await validadeDeadline(ceremonyId, validatorContract);
    await validateLastHash(
      ceremonyId,
      validatorContract,
      commandfileName,
      fileArgs
    );
  }

  console.log("[Enclave] Phase: ", phase);

  console.log("[Enclave] Getting validator public key...");

  const validatorPubkey = (await validatorContract.call("publicKey")) as any;

  if (sgxEnabled) {
    console.log("Verifying if enclave valid...");
    const publicKeyValid = signatureVerify(
      pad64(publicKey),
      sigOfPubkey,
      validatorPubkey
    ).isValid;
    console.log("Public key valid: ", publicKeyValid);
  }

  try {
    console.log("[Enclave] Running command...: ", commandfileName, fileArgs);

    const { stdout, stderr } = await execFile(commandfileName, fileArgs);

    console.log("[Enclave] Command executed");
    console.log("[Enclave] Command stdout: \n");
    console.log(stdout);
    console.log("[Enclave] Command stderr: \n");
    console.log(stderr);

    if (stderr) {
      return {
        error: stderr
      };
    }

    console.log("[Enclave] Command executed successfully");
    console.log("[Enclave] Getting input file name...");

    const metadataArray = await getMetadatas(
      commandfileName,
      power,
      bash,
      fileArgs
    );

    const outputFilesArray = await getOutputFiles(
      commandfileName,
      fileArgs,
      power
    );

    if (outputFilesArray.length > 0) {
      let computedOutput = outputFilesArray[outputFilesArray.length - 1].hash;

      console.log("[Enclave] Computed output hash:", computedOutput);

      console.log("[Enclave] Signing computed result...");
      const sigOfComputedResult = pair.sign(computedOutput);

      console.log("[Enclave] Verifying if computed result is valid...");
      const computedResultValid = signatureVerify(
        computedOutput,
        sigOfComputedResult,
        publicKey
      ).isValid;

      console.log("[Enclave] Computed result valid: ", computedResultValid);

      console.log("[Enclave] Adding to contract...");

      console.log(
        "[Phala] Calling method addContribution with args:",
        ceremonyId,
        phase,
        name,
        description,
        deadline,
        timestamp,
        metadataArray,
        outputFilesArray
      );

      const result = await contract.send.addContribution(
        { pair, cert, address: cert.address },
        ceremonyId,
        phase,
        name,
        description,
        deadline,
        timestamp,
        metadataArray,
        outputFilesArray
      );

      await result.waitFinalized(
        async () => {
          if (result.status.isFinalized || result.status.isInBlock) {
            console.log("Transaction finalized");
            return true;
          }
          console.log("Transaction not finalized");
          return false;
        },
        {
          timeout: 1000 * 60 * 5, // 5 minutes
          blocks: 50,
        }
      );

      return {
        data: {
          phase,
          name,
          deadline,
          timestamp,
          ceremonyId,
          description,
          metadataArray,
          outputFilesArray,
        }
      }
    }

    console.log("[Enclave] Everything done, enjoy!");
  } catch (error: any) {
    console.error("[Enclave] Error:", error);

    return {
      error: error.message
    }
  }
}