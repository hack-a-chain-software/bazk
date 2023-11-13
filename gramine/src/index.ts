(globalThis as any).WebAssembly = undefined;
import '@polkadot/wasm-crypto/initOnlyAsm';
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { mnemonicGenerate, cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';

import * as ra from "@phala/ra-report"
import * as fs from 'fs';

import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

const VALIDATOR_CONTRACT_ADDRESS = "0x111020f17d7d9347a6c18e77080b5ab18834cf1cd85d8948881a0bca342c5017";

async function main(args?: string[]) {

    console.log("Starting...");
    console.log("Args: ", args);
    console.log("Waiting for crypto...");
    await cryptoWaitReady();
    console.log("Generating key pair...");
    const pair = generateKeyPair();
    const publicKey = pair.publicKey;

    // Works only on SGX
    console.log("Getting report...");
    const report = await ra.createRemoteAttestationReport({
        userReportData: Buffer.from(publicKey),
        iasKey: process.env.IAS_API_KEY ?? "",
    });
    console.log("Report: ", report);

    console.log("Connecting to validator contract...");
    const validatorContract = await ra.Contract.connect({
        rpc: "wss://poc6.phala.network/ws",
        contractId: VALIDATOR_CONTRACT_ADDRESS,
        pair,
        abi: ra.DEFAULT_VALIDATOR_ABI,
    });
    console.log("validatorContract", validatorContract);

    // Works only on SGX
    console.log("Signing report...");
    const validateResult = await validatorContract.call('sign', report) as any;
    if (validateResult?.isErr) {
        throw new Error(`Failed to sign the report: ${validateResult.asErr}`);
    }
    const sigOfPubkey = validateResult.asOk.toHex();
    console.log("Signature of public key: ", sigOfPubkey);

    console.log("Running phase1...");

    const command_phase1 = "./phase1 " + args?.join(" ");
    console.log("Command: ", command_phase1);

    try {
        const { stdout, stderr } = await exec(command_phase1);
        console.log(stdout);
        if (stderr) {
            console.error('stderr:', stderr);
            return;
        }

        console.log("Checking if challenge.verified.hash exists...");
        await fs.promises.access('challenge.verified.hash', fs.constants.F_OK);

        console.log("Reading challenge.verified.hash...");
        let computedOutput = await fs.promises.readFile('challenge.verified.hash', 'hex');
        console.log("Computed output hash: ", computedOutput);

        console.log("Signing computed result...");
        const sigOfComputedResult = pair.sign(computedOutput);

        console.log("Getting validator public key...");
        const validatorPubkey = await validatorContract.call('publicKey') as any;
        
        // Works only on SGX
        console.log("Verifying if enclave valid...");
        const publicKeyValid = signatureVerify(pad64(publicKey), sigOfPubkey, validatorPubkey).isValid;
        console.log("Public key valid: ", publicKeyValid);

        console.log("Verifying if computed result is valid...");
        const computedResultValid = signatureVerify(computedOutput, sigOfComputedResult, publicKey).isValid;
        console.log("Computed result valid: ", computedResultValid);
    } catch (error) {
        console.error('Error:', error);
    }
}

function generateKeyPair(): KeyringPair {
    const keyring = new Keyring({ type: 'sr25519' })
    return keyring.addFromUri(mnemonicGenerate());
}

function pad64(data: Uint8Array): Uint8Array {
    const result = new Uint8Array(64);
    result.set(data);
    return result;
}

main(process.argv.slice(2)).catch(console.error);