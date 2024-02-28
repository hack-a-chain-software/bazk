(globalThis as any).WebAssembly = undefined;
import "@polkadot/wasm-crypto/initOnlyAsm";
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { cryptoWaitReady, signatureVerify } from "@polkadot/util-crypto";

import * as ra from "@phala/ra-report";
import { getClient, getContract, signCertificate } from "@phala/sdk";

const sgxEnabled = process.env.SGX_ENABLED === "true" || false;

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
    phase = 1;
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
      console.error(
        "[Enclave] Name not provided, please provide a name for the ceremony"
      );
      return;
    }

    if (description == null) {
      console.error(
        "[Enclave] Description not provided, please provide a description for the ceremony"
      );
      return;
    }

    if (deadline == null) {
      console.error(
        "[Enclave] Deadline not provided, please provide a deadline for the ceremony"
      );
      return;
    }

    ceremonyId = timestamp;
  } else {
    //
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

    // const { stdout, stderr } = await execFile(commandfileName, fileArgs);

    console.log("[Enclave] Command executed");
    console.log("[Enclave] Command stdout: \n");
    // console.log(stdout);

    // if (stderr) {
    //   console.error("stderr:", stderr);
    //   return;
    // }

    console.log("[Enclave] Command executed successfully");
    console.log("[Enclave] Getting input file name...");


    console.log("[Enclave] Everything done, enjoy!");
  } catch (error) {
    console.error("[Enclave] Error:", error);
  }
}

function pad64(data: Uint8Array): Uint8Array {
  const result = new Uint8Array(64);
  result.set(data);
  return result;
}

function generateKeyPair(): KeyringPair {
  const keyring = new Keyring({ type: "sr25519" });
  const mnemonic = process.env.ACCOUNT_MNEMONIC;

  if (mnemonic == null) {
    throw new Error("ACCOUNT_MNEMONIC env var not set");
  }

  return keyring.addFromMnemonic(mnemonic);
}

main(process.argv.slice(2)).catch(console.error);
