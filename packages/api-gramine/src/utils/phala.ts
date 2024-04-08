import { KeyringPair } from "@polkadot/keyring/types";
import { Keyring } from "@polkadot/keyring";
import { mnemonic } from "../constants/env";
import { getInputFilename } from "./file";
import { getIpfsHash } from "./ipfs";
import * as ra from "@phala/ra-report";

export const generateKeyPair = (): KeyringPair => {
  const keyring = new Keyring({ type: "sr25519" });

  if (mnemonic == null) {
    throw new Error("ACCOUNT_MNEMONIC env var not set");
  }

  return keyring.addFromMnemonic(mnemonic);
}

export const pad64 = (data: Uint8Array): Uint8Array => {
  const result = new Uint8Array(64);

  result.set(data);

  return result;
}

export const validateLastHash = async(
  ceremonyId: number,
  validatorContract: ra.Contract,
  commandfileName: string,
  fileArgs: string[] | undefined
) => {
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

export const validadeDeadline = async (
  ceremonyId: number,
  validatorContract: ra.Contract
) => {
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

export const getPhase = (command: string) => {
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
