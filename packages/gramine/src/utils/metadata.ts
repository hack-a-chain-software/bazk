import fs from "fs";
import { getInputFilename } from "./file";

interface Metadata {
  name: string;
  value: string;
}

export const createMetadata = (name: string, value: string): Metadata => {
  return { name, value };
}

export const getMetadatas = async (
  commandfileName: string,
  power: number,
  bash: number,
  fileArgs: string[]
) => {
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
