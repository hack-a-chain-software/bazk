(globalThis as any).WebAssembly = undefined;
import "@polkadot/wasm-crypto/initOnlyAsm";
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { cryptoWaitReady, signatureVerify } from "@polkadot/util-crypto";
import * as ra from "@phala/ra-report";
import { getClient, getContract, signCertificate } from "@phala/sdk";
import fs from "fs";

const IPFS = require("ipfs-only-hash");

import { execFile as execFileCallback } from "child_process";
import { promisify } from "util";
import { iasApiKey, mnemonic, pinataKey, pinataSecret, sgxEnabled } from "./constants/env";
import { VALIDATOR_ABI, VALIDATOR_CONTRACT_ADDRESS } from "./constants/contract";
import { PORT } from "./constants/server";
import { RPC } from "./constants/phala";
import { uploadToPinata } from "./utils/pinata";

const http = require('http');
const { StringDecoder } = require('string_decoder');

const execFile = promisify(execFileCallback);

let isCommandExecuting = false

async function main(args?: string[]) {
  console.log("[Enclave] Welcome to PoC Enclave, fasten your seat belt!");
  console.log("[Enclave] Starting...");
  console.log("[Enclave] SGX enabled: ", sgxEnabled);
  console.log("[Enclave] Args provided: ", args);
  console.log("[Enclave] Waiting for crypto...");

  await cryptoWaitReady();

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
      iasKey: iasApiKey,
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

  // console.log("Validator public key: ", validatorPubkey);

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
  } catch (error) {
    console.error("[Enclave] Error:", error);

    return {
      value: error
    }
  }
}

async function getMetadatas(
  commandfileName: string,
  power: number,
  bash: number,
  fileArgs: string[]
) {
  let metadataArray: Metadata[] = [];

  console.log("[Enclave] Getting metadatas...");
  console.log("[Enclave] Command file name: ", commandfileName);

  if (
    commandfileName.endsWith("new_constrained") ||
    commandfileName.endsWith("new")
  ) {
    metadataArray.push(createMetadata("power", power.toString()));

    console.log("[Enclave] Power: ", power);

    metadataArray.push(createMetadata("bash", bash.toString()));

    console.log("[Enclave] Bash: ", bash);
  }

  if (commandfileName.endsWith("new")) {
    var inputFileName = getInputFilename(commandfileName, fileArgs);

    console.log(`[Enclave] Reading input file ${inputFileName}...`);

    const json = JSON.parse(fs.readFileSync(inputFileName as string, "utf8"));

    console.log("[Enclave] Input file read successfully");

    const nPrvInputs = json.nPrvInputs;

    console.log("[Enclave] nPrvInputs: ", nPrvInputs);

    const nPubInputs = json.nPubInputs;

    console.log("[Enclave] nPubInputs: ", nPubInputs);

    const nInputs = json.nInputs;

    console.log("[Enclave] nInputs: ", nInputs);

    const nOutputs = json.nOutputs;

    console.log("[Enclave] nOutputs: ", nOutputs);

    const nVars = json.nVars;

    console.log("[Enclave] nVars: ", nVars);

    const nConstants = json.nConstants;

    console.log("[Enclave] nConstants: ", nConstants);

    const nSignals = json.nSignals;

    console.log("[Enclave] nSignals: ", nSignals);

    metadataArray.push(createMetadata("nPrvInputs", nPrvInputs.toString()));
    metadataArray.push(createMetadata("nPubInputs", nPubInputs.toString()));
    metadataArray.push(createMetadata("nInputs", nInputs.toString()));
    metadataArray.push(createMetadata("nOutputs", nOutputs.toString()));
    metadataArray.push(createMetadata("nVars", nVars.toString()));
    metadataArray.push(createMetadata("nConstants", nConstants.toString()));
    metadataArray.push(createMetadata("nSignals", nSignals.toString()));
  }

  return metadataArray;
}

async function getOutputFiles(
  commandfileName: string,
  fileArgs: string[],
  power: number
) {
  console.log("[Enclave] Getting output file name...");
  var outputFileNames = getOutputFilename(commandfileName, fileArgs, power);
  var outputFileHashes = new Array<string>();
  let fileArray: File[] = [];

  if (outputFileNames != null) {
    console.log("[Enclave] Output file count: ", outputFileNames?.length);

    for (let i = 0; i < outputFileNames.length; i++) {
      let outputFileName = outputFileNames[i];
      const timestamp = Math.floor(Date.now() / 1000);
      console.log("[IPFS] Uploading output file to IPFS...", outputFileName);
      const ipfsHash = await uploadToPinata(outputFileName);
      outputFileHashes.push(ipfsHash);

      console.log(`[IPFS] Output file uploaded to IPFS with hash: `, ipfsHash);

      console.log("[Enclave] Adding file object to array...");

      fileArray.push(
        createFileObject(
          ipfsHash,
          outputFileName,
          Math.floor(Date.now() / 1000)
        )
      );
    }
  }

  return fileArray;
}

interface File {
  hash: string;
  name: string;
  timestamp: number;
}

interface Metadata {
  name: string;
  value: string;
}

function createFileObject(hash: string, name: string, timestamp: number): File {
  return { hash, name, timestamp };
}

function createMetadata(name: string, value: string): Metadata {
  return { name, value };
}

async function validateLastHash(
  ceremonyId: number,
  validatorContract: ra.Contract,
  commandfileName: string,
  fileArgs: string[] | undefined
) {
  console.log(
    "[Phala] getCeremonyHashesCount - Calling method with args:",
    ceremonyId
  );

  const txCeremonyHashesCount = (await validatorContract.call(
    "getCeremonyHashesCount",
    ceremonyId
  )) as any;

  if (txCeremonyHashesCount?.isErr) {
    throw new Error(
      `[Phala] getCeremonyHashesCount - Failed to get ceremony hashes count: ${txCeremonyHashesCount.asErr}`
    );
  }

  const ceremonyHashesCount = txCeremonyHashesCount.asOk.toNumber();

  console.log(
    "[Phala] getCeremonyHashesCount - Ceremony hashes count: ",
    ceremonyHashesCount
  );

  if (ceremonyHashesCount > 0) {
    console.log("[Enclave] Ceremony hashes found, continuing ceremony...");

    if (commandfileName.includes("new")) {
      throw new Error(
        "[Enclave] This ceremony must be continued from the last hash, but you are trying to create a new one. Please, remove the ceremony id from the command if you want to create a new ceremony."
      );
    }

    console.log(
      "[Enclave] Getting input file name with args: ",
      commandfileName,
      fileArgs
    );
    const inputfileName = getInputFilename(commandfileName, fileArgs);
    if (inputfileName != null) {
      console.log("[Enclave] Input file name found: ", inputfileName);

      console.log("[Enclave] Getting input file hash...");

      const inputFileHash = await getIpfsHash(inputfileName);

      console.log("[Enclave] Input file hash: ", inputFileHash);

      console.log(
        "[Enclave] Checking if this hash is the last hash sent to the contract..."
      );

      console.log(
        `[Phala] isLastHash - Calling method with args: ${ceremonyId}, ${inputFileHash}`
      );

      const txIsLastHash = (await validatorContract.call(
        "isLastHash",
        ceremonyId,
        inputFileHash
      )) as any;

      if (txIsLastHash?.isErr) {
        throw new Error(
          `[Phala] isLastHash - Failed to get isLastHash: ${txIsLastHash.asErr}`
        );
      }

      const lastHash = txIsLastHash.asOk.toString();

      console.log("[Phala] isLastHash - Last hash: ", lastHash);

      const isLastHash = lastHash == "true";

      console.log("[Enclave] Is last hash: ", isLastHash);

      if (!isLastHash) {
        throw new Error(
          `[Enclave] Ceremony must be continued from the last hash`
        );
      }
    }
  }
}

async function validadeDeadline(
  ceremonyId: number,
  validatorContract: ra.Contract
) {
  console.log(
    "[Phala] getCeremonyDeadline - Calling method with args:",
    ceremonyId
  );

  const txCeremonyDeadline = (await validatorContract.call(
    "getCeremonyDeadline",
    ceremonyId
  )) as any;

  if (txCeremonyDeadline?.isErr) {
    throw new Error(
      `[Phala] getCeremonyDeadline - Failed to get ceremony deadline: ${txCeremonyDeadline.asErr}`
    );
  }

  const ceremonyDeadline = txCeremonyDeadline.asOk.toNumber();

  console.log(
    "[Phala] getCeremonyDeadline - Ceremony deadline: ",
    ceremonyDeadline
  );

  const currentTime = Math.floor(Date.now() / 1000);

  console.log("[Enclave] Current time: ", currentTime);

  if (currentTime > ceremonyDeadline) {
    throw new Error(
      "[Enclave] Ceremony deadline expired, please create a new ceremony"
    );
  }
}

async function getIpfsHash(filePath: string) {
  const fileContent = fs.readFileSync(filePath);
  const hash = await IPFS.of(fileContent);
  return hash;
}

function getPhase(command: string) {
  if (
    command.includes("new_constrained") ||
    command.includes("compute_constrained") ||
    command.includes("verify_transform_constrained") ||
    command.includes("compute_constrained") ||
    command.includes("prepare_phase2")
  ) {
    return 1;
  } else if (
    command.includes("new") ||
    command.includes("contribute") ||
    command.includes("verify_contribution")
  ) {
    return 2;
  }
  return 0;
}

function getInputFilename(command: string, fileArgs: string[] | undefined) {
  let fileName = null;
  if (
    command.includes("compute_constrained") ||
    command.includes("prepare_phase2") ||
    command.includes("contribute") ||
    command.includes("new")
  ) {
    fileName = fileArgs?.[0];
  } else if (command.includes("verify_transform_constrained")) {
    fileName = fileArgs?.[1];
  }
  return fileName;
}

function getOutputFilename(command: string, fileArgs: string[], power: number) {
  let fileName = new Array<string>();
  if (command.includes("new_constrained")) {
    fileName.push(fileArgs?.[0]);
  } else if (
    command.includes("new") ||
    command.includes("contribute") ||
    command.includes("compute_constrained") ||
    command.includes("beacon_constrained")
  ) {
    fileName.push(fileArgs?.[1]);
  } else if (command.includes("verify_transform_constrained")) {
    fileName.push(fileArgs?.[2]);
  } else if (command.includes("prepare_phase2")) {
    for (let i = 0; i <= power; i++) {
      fileName.push(`phase1radix2m${i}`);
    }
  }

  return fileName;
}



function generateKeyPair(): KeyringPair {
  const keyring = new Keyring({ type: "sr25519" });

  if (mnemonic == null) {
    throw new Error("ACCOUNT_MNEMONIC env var not set");
  }

  return keyring.addFromMnemonic(mnemonic);
}

function pad64(data: Uint8Array): Uint8Array {
  const result = new Uint8Array(64);
  result.set(data);
  return result;
}

const server = http.createServer((req: any, res: any) => {
  if (req.method === 'POST' && req.url === '/execute') {
    if (isCommandExecuting) {
      res.writeHead(429, {'Content-Type': 'application/json'});

      res.end(JSON.stringify({
        success: false,
        message: 'A command is already being executed. Please try again later.'
      }));

      return;
    }

    isCommandExecuting = true

    const decoder = new StringDecoder('utf-8');

    let buffer = '';

    req.on('data', (data: any) => {
      buffer += decoder.write(data);
    });

    req.on('end', () => {
      buffer += decoder.end();

      try {
        const args = JSON.parse(buffer);

        main(args).then((result: any) => {
          res.writeHead(200, {'Content-Type': 'application/json'});
          if (result.error) {
            res.end(JSON.stringify({
              success: false,
              error: result.error,
            }));
          } else {
            res.end(JSON.stringify({
              success: true,
              message: result.data
            }));
          }
        }).catch((error) => {
          res.writeHead(400, {'Content-Type': 'application/json'});

          res.end(JSON.stringify({ success: false, message: error.message }));
        }).finally(() => {
          isCommandExecuting = false

          fs.unlink('/challenge', (err) => {
            if (err) {
              console.error('Erro ao deletar o arquivo:', err);
              return;
            }

            console.log('Arquivo deletado com sucesso');
          });
        });
      } catch (error) {
        isCommandExecuting = false

        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: false, message: 'Erro ao processar os dados recebidos' }));
      }
    });
  } else {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(() => {
      return JSON.stringify({ success: false, message: 'Endpoint não encontrado' })
    });
  }
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
