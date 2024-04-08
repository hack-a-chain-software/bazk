import fs from "fs";
import { execFile } from "../utils/exec";
import { createFileObject } from "../utils/file";
import { createMetadata } from "../utils/metadata";
import { uploadToPinata } from "../utils/pinata";

interface CreateArgsInterface {
  name: string,
  bash: string,
  power: number,
  circuit: string,
  description: string,
  deadline: string | number
}

const circuitFileName = 'circuit.json';

const commandfileName = './app/bin/new';

const outputFileName = 'circom1.params';

const validateArgs = (args: any) => {
  if (args.name == null) {
    throw new Error('[Enclave] Name not provided, please provide a name for the ceremony');
  }

  if (args.description == null) {
    throw new Error('[Enclave] Description not provided, please provide a description for the ceremony');
  }

  if (args.deadline == null) {
    throw new Error('[Enclave] Deadline not provided, please provide a deadline for the ceremony');
  }

  if (args.circuit == null) {
    throw new Error('[Enclave] Circuit not provided, please provide a circuit for the ceremony');
  }

  if (args.bash == null) {
    throw new Error('[Enclave] Curve not provided, please provide a curve for the ceremony');
  }
};

export const create = async (args: CreateArgsInterface): Promise<any> => {
  console.log('[Enclave] Create command dispatched');

  validateArgs(args);

  const {
    name,
    bash,
    power,
    circuit,
    deadline,
    description,
  } = args;

  fs.writeFileSync(circuitFileName, circuit, 'utf8');

  const ceremonyId = Math.floor(Date.now() / 1000);

  console.log("[Enclave] Running create ceremony command...: ");

  const { stderr } = await execFile(
    commandfileName,
    [
      circuitFileName,
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
    fs.readFileSync(circuitFileName as string, "utf8"),
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

  fs.unlinkSync(outputFileName);

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
