import fs from "fs";
import { execFile } from "../utils/exec";
import { createFileObject } from "../utils/file";
import { downloadFromPinata, uploadToPinata } from "../utils/pinata";
import { testMode } from "../constants/env";
import { validadeDeadline } from "../utils/phala";

export interface ContributeArgsInterface {
  ceremonyId: number,
}

const commandfileName = './app/bin/contribute';

const validateArgs = (args: any) => {
  if (args.ceremonyId == null) {
    throw new Error('[Enclave] Ceremony id not provided, please provide a ceremony id');
  }
};

export const contribute = async (args: ContributeArgsInterface, validatorContract: any): Promise<any> => {
  console.log('[Enclave] Contribute command dispatched');

  const timestamp = Math.floor(Date.now() / 1000);

  validateArgs(args);

  const {
    ceremonyId,
  } = args

  if (!testMode) {
    await validadeDeadline(ceremonyId, validatorContract);
  }

  const ceremony = await validatorContract.call("getCeremony", args.ceremonyId)

  const [
    _,
    contributions
  ] = ceremony.asOk.toJSON()

  const lastContribution = contributions.at(-1)

  await downloadFromPinata(lastContribution)

  console.log("[Enclave] Running contribute command...: ");

  const outputFileName = `circom${contributions.length + 1}.params`

  const { stderr } = await execFile(
    commandfileName,
    [
      lastContribution.name,
      outputFileName,
    ]
  );

  if (stderr) {
    throw new Error(stderr);
  }

  const ipfsHash = await uploadToPinata(outputFileName);

  const outputFilesArray = [
    createFileObject(
      ipfsHash,
      outputFileName,
      Math.floor(Date.now() / 1000)
    )
  ]

  fs.unlinkSync(outputFileName);
  fs.unlinkSync(lastContribution.name);

  return {
    phase: 2,

    name: "",
    deadline: "",
    description: "",

    metadataArray:[],

    timestamp,
    ceremonyId,
    outputFilesArray,
  }
};
