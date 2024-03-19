import * as commands from './commands'
import * as ra from "@phala/ra-report";
import { generateKeyPair, pad64 } from './utils/phala'
import { RPC } from './constants/phala';
import { VALIDATOR_ABI, VALIDATOR_CONTRACT_ADDRESS } from './constants/contract';
import { getClient, getContract, signCertificate } from '@phala/sdk';
import { iasApiKey, sgxEnabled, testMode } from './constants/env';
import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';

export type CommandKeyType = 'createCeremony' | 'verify' | 'contribute'

export const commandsKeys: CommandKeyType[] = [
  'verify',
  'contribute',
  'createCeremony',
]

export const getCommandByKey = (key: CommandKeyType) => {
  const command = commands[key]

  if (!command) {
    throw new Error("Command not found")
  }

  return command
}

export interface DispatchArgsInterface {
  key: CommandKeyType,
  data: any
}

export const dispatch = async (args: DispatchArgsInterface): Promise<any> => {
  console.log("[Enclave] Dispatch command for args: ", args)

  await cryptoWaitReady();

  const pair = generateKeyPair();
  const publicKey = pair.publicKey;

  const validatorContract = await ra.Contract.connect({
    pair,
    rpc: RPC,
    abi: VALIDATOR_ABI,
    contractId: VALIDATOR_CONTRACT_ADDRESS,
  });

  const cert = await signCertificate({ pair });

  const phatRegistry = await getClient({ transport: RPC });

  const contract = await getContract({
    client: phatRegistry,
    contractId: VALIDATOR_CONTRACT_ADDRESS,
    abi: VALIDATOR_ABI,
  });

  let sigOfPubkey = "";

  if (sgxEnabled && !testMode) {
    const report = await ra.createRemoteAttestationReport({
      iasKey: iasApiKey ?? "",
      userReportData: Buffer.from(publicKey),
    });

    const validateResult = (await validatorContract.call(
      "sign",
      report
    )) as any;

    if (validateResult?.isErr) {
      throw new Error(`Failed to sign the report: ${validateResult.asErr}`);
    }

    sigOfPubkey = validateResult.asOk.toHex();
  }

  const validatorPubkey = (await validatorContract.call("publicKey")) as any;

  if (sgxEnabled && !testMode) {
    signatureVerify(
      pad64(publicKey),
      sigOfPubkey,
      validatorPubkey
    ).isValid;
  }

  const command = getCommandByKey(args.key)

  try {
    const commandOutput = await command(args.data);

    const outputFilesArray = commandOutput?.outputFilesArray ?? [];

    if (outputFilesArray.length > 0) {
      let computedOutput = outputFilesArray[outputFilesArray.length - 1].hash;

      const sigOfComputedResult = pair.sign(computedOutput);

      signatureVerify(
        computedOutput,
        sigOfComputedResult,
        publicKey
      ).isValid;

      if (!testMode) {

        const result = await contract.send.addContribution(
          { pair, cert, address: cert.address },
          commandOutput.ceremonyId,
          commandOutput.phase,
          commandOutput.name,
          commandOutput.description,
          commandOutput.deadline,
          commandOutput.timestamp,
          commandOutput.metadataArray,
          outputFilesArray
        );

        await result.waitFinalized(
          async () => !!result.status.isFinalized || !!result.status.isInBlock,
          {
            timeout: 1000 * 60 * 5, // 5 minutes
            blocks: 50,
          }
        );
      }

      return {
        data: commandOutput
      }
    }

    console.log("Finish")
  } catch (error: any) {
    console.error("[Enclave] Error:", error);

    return {
      error: error.message
    }
  }
}
