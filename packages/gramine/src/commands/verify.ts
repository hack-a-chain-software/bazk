import fs from "fs";
import { execFile } from "../utils/exec";
import { downloadFromPinata } from "../utils/pinata";

export interface CreateArgsInterface {
  hashes: string[],
}

const commandfileName = './app/bin/verify';

const validateArgs = (args: any) => {
  if (args.hashes == null || args.hashes.length < 1) {
    throw new Error('[Enclave] Hashes not provided');
  }
};

export const verify = async (args: CreateArgsInterface): Promise<any> => {
  console.log('[Enclave] Contribute command dispatched');

  validateArgs(args);

  const {
    hashes,
  } = args

  const [
    from,
    to,
  ] = hashes

  await downloadFromPinata({ hash: to, name: 'to.params' })
  await downloadFromPinata({ hash: from, name: 'from.params' })

  console.log("[Enclave] Running contribute command...: ");

  const { stderr } = await execFile(
    commandfileName,
    [
      "from.params",
      "to.params",
    ]
  );

  if (stderr) {
    throw new Error(stderr);
  }

  await fs.unlink('from.params', () => {
    console.log('from.params deleted.');
  });

  await fs.unlink('to.params', () => {
    console.log('to.params deleted.');
  });

  return {
  }
};
