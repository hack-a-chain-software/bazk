(globalThis as any).WebAssembly = undefined;
import "@polkadot/wasm-crypto/initOnlyAsm";
import { Keyring } from "@polkadot/keyring";

import * as ra from "@phala/ra-report";

const IPFS = require("ipfs-only-hash");

import { cryptoWaitReady } from "@polkadot/util-crypto";

import { execFile as execFileCallback } from "child_process";
import { promisify } from "util";

const execFile = promisify(execFileCallback);
const sgxEnabled = process.env.SGX_ENABLED === "true" || false;

async function main(args?: string[]) {
  console.log("[Enclave] Welcome to PoC Enclave, fasten your seat belt!");
  console.log("[Enclave] Starting...");
  console.log("[Enclave] SGX enabled: ", sgxEnabled);
  console.log("[Enclave] Args provided: ", args);
  console.log("[Enclave] Waiting for crypto...");

  await cryptoWaitReady();

  console.log("[Enclave] Getting key pair...");

  console.log("[Phala] Connecting to validator contract...");

  const pair = generateKeyPair();
  const publicKey = pair.publicKey;

  console.log('process.env.IAS_API_KEY', process.env.IAS_API_KEY)

  if (sgxEnabled) {
    console.log("Getting report...");
    const report = await ra.createRemoteAttestationReport({
      userReportData: Buffer.from(publicKey),
      iasKey: process.env.IAS_API_KEY ?? "",
    });
    console.log("Report: ", report);
  }

  let firstArgument = args?.shift() as number | string;
  let commandfileName = "";

  console.log("[Enclave] Looking for the ceremony Id...");

  const fileArgs = args as string[];

  console.log("[Enclave] File name: ", commandfileName);
  console.log("[Enclave] File args: ", fileArgs);

  let phase = 0;

  let deadline = "";
  let description = "";
  let name = "";
  const timestamp = Math.floor(Date.now() / 1000);

  console.log(
    "[Enclave] Ceremony id not provided, generating new ceremony..."
  );

  commandfileName = firstArgument as string;
  phase = 1;
  deadline = args?.pop() as string;
  description = args?.pop() as string;
  name = args?.pop() as string;

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

  console.log("[Enclave] Phase: ", phase);

  console.log("[Enclave] Getting validator public key...");

  try {
    console.log("[Enclave] Running command...: ", commandfileName, fileArgs);

    const { stdout, stderr } = await execFile(commandfileName, fileArgs);

    console.log("[Enclave] Command executed");
    console.log("[Enclave] Command stdout: \n");
    console.log(stdout);

    if (stderr) {
      console.error("stderr:", stderr);
      return;
    }

    console.log("[Enclave] Everything done, enjoy!");
  } catch (error) {
    console.error("[Enclave] Error:", error);
  }
}

function generateKeyPair(): any {
  const keyring = new Keyring({ type: "sr25519" });
  const mnemonic = process.env.ACCOUNT_MNEMONIC;

  if (mnemonic == null) {
    throw new Error("ACCOUNT_MNEMONIC env var not set");
  }

  return keyring.addFromMnemonic(mnemonic);
}

main(process.argv.slice(2)).catch(console.error);
