(globalThis as any).WebAssembly = undefined;
import '@polkadot/wasm-crypto/initOnlyAsm';
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { mnemonicGenerate, cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';

import * as ra from "@phala/ra-report"

const VALIDATOR_CONTRACT_ADDRESS = "0x111020f17d7d9347a6c18e77080b5ab18834cf1cd85d8948881a0bca342c5017";

async function main() {
    console.log("Waiting for crypto...");
    await cryptoWaitReady();
    console.log("Generating key pair...");
    const pair = generateKeyPair();
    const publicKey = pair.publicKey;
    console.log("Getting report...");
    const report = await ra.createRemoteAttestationReport({
        userReportData: Buffer.from(publicKey),
        iasKey: process.env.IAS_API_KEY ?? "",
    });
    console.log("Report: ", report);

    const validatorContract = await ra.Contract.connect({
        rpc: "wss://poc6.phala.network/ws",
        contractId: VALIDATOR_CONTRACT_ADDRESS,
        pair,
        abi: ra.DEFAULT_VALIDATOR_ABI,
    });
    const validateResult = await validatorContract.call('sign', report) as any;
    if (validateResult?.isErr) {
        throw new Error(`Failed to sign the report: ${validateResult.asErr}`);
    }
    const sigOfPubkey = validateResult.asOk.toHex();
    console.log("Signature of public key: ", sigOfPubkey);

    const computedOutput = "foo";
    
    const sigOfComputedResult = pair.sign(computedOutput);

    // User verifies the result
    const validatorPubkey = await validatorContract.call('publicKey') as any;
    const publicKeyValid = signatureVerify(pad64(publicKey), sigOfPubkey, validatorPubkey).isValid;
    console.log("Public key valid: ", publicKeyValid);
    const computedResultValid = signatureVerify(computedOutput, sigOfComputedResult, publicKey).isValid;
    console.log("Computed result valid: ", computedResultValid);
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

main().catch(console.error);