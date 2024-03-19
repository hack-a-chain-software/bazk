import fs from "fs";
import { execFile } from "../utils/exec";
import { createFileObject } from "../utils/file";
import { createMetadata } from "../utils/metadata";
import { uploadToPinata } from "../utils/pinata";

export interface CreateArgsInterface {
  name: string,
  power: number,
  description: string,
  deadline: string | number
}

const bash = 256

const circuitFIleName = 'circuit.json';

const commandfileName = './app/bin/new';

const outputFileName = 'circom1.params';

export const validateArgs = (args: any) => {
  if (args.name == null) {
    throw new Error('[Enclave] Name not provided, please provide a name for the ceremony');
  }

  if (args.description == null) {
    throw new Error('[Enclave] Description not provided, please provide a description for the ceremony');
  }

  if (args.deadline == null) {
    throw new Error('[Enclave] Deadline not provided, please provide a deadline for the ceremony');
  }
};

export const createCeremony = async (args: CreateArgsInterface): Promise<any> => {
  console.log('[Enclave] Create command dispatched');

  validateArgs(args);

  const {
    name,
    power,
    deadline,
    description,
  } = args;

  const ceremonyId = Math.floor(Date.now() / 1000);

  console.log("[Enclave] Running create ceremony command...: ");

  const { stderr } = await execFile(
    commandfileName,
    [
      circuitFIleName,
      'circom1.params',
      `./app/ceremonies/p${args.power}`
    ]
  );

  if (stderr) {
    throw new Error(stderr);
  }

  const {
    nVars,
    nInputs,
    nOutputs,
    nSignals,
    nConstants,
    nPrvInputs,
    nPubInputs,
  } = JSON.parse(
    fs.readFileSync(circuitFIleName as string, "utf8"),
  );

  const metadataArray = [
    createMetadata("power", power.toString()),
    createMetadata("bash", bash.toString()),
    createMetadata("nPrvInputs", nPrvInputs.toString()),
    createMetadata("nPubInputs", nPubInputs.toString()),
    createMetadata("nInputs", nInputs.toString()),
    createMetadata("nOutputs", nOutputs.toString()),
    createMetadata("nVars", nVars.toString()),
    createMetadata("nConstants", nConstants.toString()),
    createMetadata("nSignals", nSignals.toString()),
  ];

  const ipfsHash = await uploadToPinata(outputFileName);

  const outputFilesArray = [
    createFileObject(
      ipfsHash,
      outputFileName,
      Math.floor(Date.now() / 1000)
    )
  ]

  return {
    name,
    phase: 2,
    deadline,
    ceremonyId,
    description,
    metadataArray,
    outputFilesArray,
    timestamp: ceremonyId,
  }
};
