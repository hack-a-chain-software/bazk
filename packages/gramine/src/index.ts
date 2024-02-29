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

const http = require('http');
const { StringDecoder } = require('string_decoder');

const PORT = 3000;

const execFile = promisify(execFileCallback);
const sgxEnabled = false;

const VALIDATOR_CONTRACT_ADDRESS =
  "0xeb6ba2385f46ec1904a97b08cee844ed903d336f9d3b2fb405e0651f7f06f85b";

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

  const VALIDATOR_ABI =
    '{"contract":{"authors":["Kevin Wang <wy721@qq.com>"],"name":"pod_validator","version":"0.1.0"},"source":{"build_info":{"build_mode":"Release","cargo_contract_version":"3.2.0","rust_toolchain":"stable-x86_64-unknown-linux-gnu","wasm_opt_settings":{"keep_debug_symbols":false,"optimization_passes":"Z"}},"compiler":"rustc 1.72.1","hash":"0xfb0533c6fe00f080203216faa08a7dfb3a116c0ca6b3601cb23d70a05b695980","language":"ink! 4.2.0"},"spec":{"constructors":[{"args":[],"default":false,"docs":[],"label":"default","payable":false,"returnType":{"displayName":["ink_primitives","ConstructorResult"],"type":16},"selector":"0xed4b9d1b"}],"docs":[],"environment":{"accountId":{"displayName":["AccountId"],"type":0},"balance":{"displayName":["Balance"],"type":43},"blockNumber":{"displayName":["BlockNumber"],"type":6},"chainExtension":{"displayName":["ChainExtension"],"type":46},"hash":{"displayName":["Hash"],"type":44},"maxEventTopics":4,"timestamp":{"displayName":["Timestamp"],"type":45}},"events":[{"args":[{"docs":[],"indexed":false,"label":"mr_enclave","type":{"displayName":[],"type":1}}],"docs":["A new pod mr_enclave is added."],"label":"PodAdded"},{"args":[{"docs":[],"indexed":false,"label":"ceremony_id","type":{"displayName":["u32"],"type":6}},{"docs":[],"indexed":false,"label":"phase","type":{"displayName":["u32"],"type":6}},{"docs":[],"indexed":false,"label":"name","type":{"displayName":["String"],"type":9}},{"docs":[],"indexed":false,"label":"description","type":{"displayName":["String"],"type":9}},{"docs":[],"indexed":false,"label":"deadline","type":{"displayName":["u32"],"type":6}},{"docs":[],"indexed":false,"label":"timestamp","type":{"displayName":["u32"],"type":6}}],"docs":[],"label":"CeremonyAdded"},{"args":[{"docs":[],"indexed":false,"label":"ceremony_id","type":{"displayName":["u32"],"type":6}},{"docs":[],"indexed":false,"label":"name","type":{"displayName":["String"],"type":9}},{"docs":[],"indexed":false,"label":"value","type":{"displayName":["String"],"type":9}}],"docs":[],"label":"MetadataAdded"}],"lang_error":{"displayName":["ink","LangError"],"type":18},"messages":[{"args":[],"default":false,"docs":[" Returns the public key."],"label":"public_key","mutates":false,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":19},"selector":"0x52061d7d"},{"args":[{"label":"pod","type":{"displayName":[],"type":1}}],"default":false,"docs":[],"label":"allow","mutates":true,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":21},"selector":"0xaef3befe"},{"args":[{"label":"report","type":{"displayName":["SignedReport"],"type":24}}],"default":false,"docs":[" Validates the given RA report and signs the inner user_report_data."],"label":"sign","mutates":false,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":25},"selector":"0x81ca8fa1"},{"args":[{"label":"ceremony_id","type":{"displayName":["u32"],"type":6}},{"label":"ipfs_hash","type":{"displayName":["String"],"type":9}}],"default":false,"docs":[" Checks if the given IPFS hash is the last hash in the ceremony."],"label":"is_last_hash","mutates":false,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":27},"selector":"0xd3d7b2d4"},{"args":[{"label":"ceremony_id","type":{"displayName":["u32"],"type":6}}],"default":false,"docs":[" Gets the IPFS hashes associated with the given ceremony."],"label":"get_ceremony_hashes","mutates":false,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":30},"selector":"0xb12eab37"},{"args":[{"label":"ceremony_id","type":{"displayName":["u32"],"type":6}}],"default":false,"docs":[" Gets the number of IPFS hashes associated with the given ceremony."],"label":"get_ceremony_hashes_count","mutates":false,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":32},"selector":"0x002d1e5f"},{"args":[{"label":"ceremony_id","type":{"displayName":["u32"],"type":6}}],"default":false,"docs":[" Gets the deadline for the given ceremony."],"label":"get_ceremony_deadline","mutates":false,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":32},"selector":"0x4d0e10e7"},{"args":[{"label":"ceremony_id","type":{"displayName":["u32"],"type":6}},{"label":"phase","type":{"displayName":["u32"],"type":6}},{"label":"name","type":{"displayName":["String"],"type":9}},{"label":"description","type":{"displayName":["String"],"type":9}},{"label":"deadline","type":{"displayName":["u32"],"type":6}},{"label":"timestamp","type":{"displayName":["u32"],"type":6}},{"label":"metadatas","type":{"displayName":["Vec"],"type":12}},{"label":"hashes","type":{"displayName":["Vec"],"type":7}}],"default":false,"docs":[" Adds a new contribution to the ceremony."],"label":"add_contribution","mutates":true,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":21},"selector":"0xd1ea658b"},{"args":[],"default":false,"docs":[" Gets all ceremonies, including the number of IPFS hashes associated with each."],"label":"get_cerimonies","mutates":false,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":34},"selector":"0xd101eea9"},{"args":[{"label":"ceremony_id","type":{"displayName":["u32"],"type":6}}],"default":false,"docs":[" Gets the ceremony with the given id, including IPFS hashes and metadata."],"label":"get_ceremony","mutates":false,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":38},"selector":"0xad9b0765"},{"args":[{"label":"ceremony_id","type":{"displayName":["u32"],"type":6}}],"default":false,"docs":[" Gets the metadata for the given ceremony."],"label":"get_ceremony_metadata","mutates":false,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":41},"selector":"0x9ec8a573"}]},"storage":{"root":{"layout":{"struct":{"fields":[{"layout":{"leaf":{"key":"0x00000000","ty":0}},"name":"owner"},{"layout":{"leaf":{"key":"0x00000000","ty":3}},"name":"allowlist"},{"layout":{"leaf":{"key":"0x00000000","ty":4}},"name":"ceremony_hashes"},{"layout":{"leaf":{"key":"0x00000000","ty":10}},"name":"ceremony_metadatas"},{"layout":{"leaf":{"key":"0x00000000","ty":14}},"name":"ceremonies"}],"name":"Validator"}},"root_key":"0x00000000"}},"types":[{"id":0,"type":{"def":{"composite":{"fields":[{"type":1,"typeName":"[u8; 32]"}]}},"path":["ink_primitives","types","AccountId"]}},{"id":1,"type":{"def":{"array":{"len":32,"type":2}}}},{"id":2,"type":{"def":{"primitive":"u8"}}},{"id":3,"type":{"def":{"sequence":{"type":1}}}},{"id":4,"type":{"def":{"sequence":{"type":5}}}},{"id":5,"type":{"def":{"tuple":[6,7]}}},{"id":6,"type":{"def":{"primitive":"u32"}}},{"id":7,"type":{"def":{"sequence":{"type":8}}}},{"id":8,"type":{"def":{"composite":{"fields":[{"name":"hash","type":9,"typeName":"String"},{"name":"name","type":9,"typeName":"String"},{"name":"timestamp","type":6,"typeName":"u32"}]}},"path":["pod_validator","pod_validator","File"]}},{"id":9,"type":{"def":{"primitive":"str"}}},{"id":10,"type":{"def":{"sequence":{"type":11}}}},{"id":11,"type":{"def":{"tuple":[6,12]}}},{"id":12,"type":{"def":{"sequence":{"type":13}}}},{"id":13,"type":{"def":{"composite":{"fields":[{"name":"name","type":9,"typeName":"String"},{"name":"value","type":9,"typeName":"String"}]}},"path":["pod_validator","pod_validator","Metadata"]}},{"id":14,"type":{"def":{"sequence":{"type":15}}}},{"id":15,"type":{"def":{"composite":{"fields":[{"name":"ceremony_id","type":6,"typeName":"u32"},{"name":"phase","type":6,"typeName":"u32"},{"name":"name","type":9,"typeName":"String"},{"name":"description","type":9,"typeName":"String"},{"name":"deadline","type":6,"typeName":"u32"},{"name":"timestamp","type":6,"typeName":"u32"}]}},"path":["pod_validator","pod_validator","Ceremony"]}},{"id":16,"type":{"def":{"variant":{"variants":[{"fields":[{"type":17}],"index":0,"name":"Ok"},{"fields":[{"type":18}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":17},{"name":"E","type":18}],"path":["Result"]}},{"id":17,"type":{"def":{"tuple":[]}}},{"id":18,"type":{"def":{"variant":{"variants":[{"index":1,"name":"CouldNotReadInput"}]}},"path":["ink_primitives","LangError"]}},{"id":19,"type":{"def":{"variant":{"variants":[{"fields":[{"type":20}],"index":0,"name":"Ok"},{"fields":[{"type":18}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":20},{"name":"E","type":18}],"path":["Result"]}},{"id":20,"type":{"def":{"sequence":{"type":2}}}},{"id":21,"type":{"def":{"variant":{"variants":[{"fields":[{"type":22}],"index":0,"name":"Ok"},{"fields":[{"type":18}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":22},{"name":"E","type":18}],"path":["Result"]}},{"id":22,"type":{"def":{"variant":{"variants":[{"fields":[{"type":17}],"index":0,"name":"Ok"},{"fields":[{"type":23}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":17},{"name":"E","type":23}],"path":["Result"]}},{"id":23,"type":{"def":{"variant":{"variants":[{"index":0,"name":"BadOrigin"},{"index":1,"name":"InvalidReport"},{"index":2,"name":"PodNotAllowed"},{"index":3,"name":"CeremonyNotFound"}]}},"path":["pod_validator","pod_validator","Error"]}},{"id":24,"type":{"def":{"composite":{"fields":[{"name":"report","type":9,"typeName":"String"},{"name":"signature","type":9,"typeName":"String"},{"name":"certificate","type":9,"typeName":"String"}]}},"path":["pod_validator","pod_validator","SignedReport"]}},{"id":25,"type":{"def":{"variant":{"variants":[{"fields":[{"type":26}],"index":0,"name":"Ok"},{"fields":[{"type":18}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":26},{"name":"E","type":18}],"path":["Result"]}},{"id":26,"type":{"def":{"variant":{"variants":[{"fields":[{"type":20}],"index":0,"name":"Ok"},{"fields":[{"type":23}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":20},{"name":"E","type":23}],"path":["Result"]}},{"id":27,"type":{"def":{"variant":{"variants":[{"fields":[{"type":28}],"index":0,"name":"Ok"},{"fields":[{"type":18}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":28},{"name":"E","type":18}],"path":["Result"]}},{"id":28,"type":{"def":{"variant":{"variants":[{"fields":[{"type":29}],"index":0,"name":"Ok"},{"fields":[{"type":23}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":29},{"name":"E","type":23}],"path":["Result"]}},{"id":29,"type":{"def":{"primitive":"bool"}}},{"id":30,"type":{"def":{"variant":{"variants":[{"fields":[{"type":31}],"index":0,"name":"Ok"},{"fields":[{"type":18}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":31},{"name":"E","type":18}],"path":["Result"]}},{"id":31,"type":{"def":{"variant":{"variants":[{"fields":[{"type":7}],"index":0,"name":"Ok"},{"fields":[{"type":23}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":7},{"name":"E","type":23}],"path":["Result"]}},{"id":32,"type":{"def":{"variant":{"variants":[{"fields":[{"type":33}],"index":0,"name":"Ok"},{"fields":[{"type":18}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":33},{"name":"E","type":18}],"path":["Result"]}},{"id":33,"type":{"def":{"variant":{"variants":[{"fields":[{"type":6}],"index":0,"name":"Ok"},{"fields":[{"type":23}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":6},{"name":"E","type":23}],"path":["Result"]}},{"id":34,"type":{"def":{"variant":{"variants":[{"fields":[{"type":35}],"index":0,"name":"Ok"},{"fields":[{"type":18}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":35},{"name":"E","type":18}],"path":["Result"]}},{"id":35,"type":{"def":{"variant":{"variants":[{"fields":[{"type":36}],"index":0,"name":"Ok"},{"fields":[{"type":23}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":36},{"name":"E","type":23}],"path":["Result"]}},{"id":36,"type":{"def":{"sequence":{"type":37}}}},{"id":37,"type":{"def":{"tuple":[15,6]}}},{"id":38,"type":{"def":{"variant":{"variants":[{"fields":[{"type":39}],"index":0,"name":"Ok"},{"fields":[{"type":18}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":39},{"name":"E","type":18}],"path":["Result"]}},{"id":39,"type":{"def":{"variant":{"variants":[{"fields":[{"type":40}],"index":0,"name":"Ok"},{"fields":[{"type":23}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":40},{"name":"E","type":23}],"path":["Result"]}},{"id":40,"type":{"def":{"tuple":[15,7,12]}}},{"id":41,"type":{"def":{"variant":{"variants":[{"fields":[{"type":42}],"index":0,"name":"Ok"},{"fields":[{"type":18}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":42},{"name":"E","type":18}],"path":["Result"]}},{"id":42,"type":{"def":{"variant":{"variants":[{"fields":[{"type":12}],"index":0,"name":"Ok"},{"fields":[{"type":23}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":12},{"name":"E","type":23}],"path":["Result"]}},{"id":43,"type":{"def":{"primitive":"u128"}}},{"id":44,"type":{"def":{"composite":{"fields":[{"type":1,"typeName":"[u8; 32]"}]}},"path":["ink_primitives","types","Hash"]}},{"id":45,"type":{"def":{"primitive":"u64"}}},{"id":46,"type":{"def":{"variant":{}},"path":["ink_env","types","NoChainExtension"]}}],"version":"4"}';
  const RPC = "wss://poc6.phala.network/ws";

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
      userReportData: Buffer.from(publicKey),
      iasKey: process.env.IAS_API_KEY ?? "",
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

async function uploadToPinata(filePath: string): Promise<string> {
  const PINATA_API_KEY = process.env.PINATA_API_KEY;

  if (PINATA_API_KEY == null) {
    throw new Error("PINATA_API_KEY env var not set");
  }

  const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

  if (PINATA_API_SECRET == null) {
    throw new Error("PINATA_API_SECRET env var not set");
  }

  const curlCommand = "./curl";

  const args = [
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    "-s",
    "-X",
    "POST",
    "-H",
    `pinata_api_key: ${PINATA_API_KEY}`,
    "-H",
    `pinata_secret_api_key: ${PINATA_API_SECRET}`,
    "-F",
    `file=@./${filePath}`,
  ];

  try {
    const { stdout, stderr } = await execFile(curlCommand, args);

    if (stderr) {
      throw new Error(`Error: ${stderr}`);
    }

    console.log("[IPFS] Upload successful");
    console.log("[IPFS] stdout: \n");
    console.log(stdout);
    console.log("\n");

    const response = JSON.parse(stdout);
    return response.IpfsHash;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
}

function generateKeyPair(): KeyringPair {
  const keyring = new Keyring({ type: "sr25519" });
  const mnemonic = process.env.ACCOUNT_MNEMONIC;

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
    const decoder = new StringDecoder('utf-8');

    let buffer = '';

    req.on('data', (data: any) => {
      buffer += decoder.write(data);
    });

    req.on('end', () => {
      buffer += decoder.end();

      try {
        const args = JSON.parse(buffer);

        // Chame a função principal ou outra função com os argumentos recebidos
        main(args).then((result: any) => {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(() => {
            console.log('RETURN SUCCESS', result)

            if (result.error) {
              return JSON.stringify({
                success: false,
                error: result.error,
              })
            }

            return JSON.stringify({
              success: true,
              message: result.data
            })
          });
        }).catch((error) => {
          res.writeHead(400, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ success: false, message: error.message }));
        }).finally(() => {
          fs.unlink('/challenge', (err) => {
            if (err) {
              console.error('Erro ao deletar o arquivo:', err);
              return;
            }

            console.log('Arquivo deletado com sucesso');
          });
        });

      } catch (error) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: false, message: 'Erro ao processar os dados recebidos' }));
      }
    });
  } else {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end((res: any) => {
      console.log('RETURN RES', res)


      return JSON.stringify({ success: false, message: 'Endpoint não encontrado' })
    });
  }
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
