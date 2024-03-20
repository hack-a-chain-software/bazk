import fs from "fs";
import { execFile } from "../utils/exec";
import { downloadFromPinata } from "../utils/pinata";

interface VerifyArgsInterface {
  hashes: string[],
  power: number,
}

const commandfileName = './app/bin/verify_contribution';

const circuitFIleName = 'circuit.json';

const validateArgs = (args: any) => {
  if (!args.power) {
    throw new Error('[Enclave] Power not provided');
  }

  if (args.hashes == null || args.hashes.length < 1) {
    throw new Error('[Enclave] Hashes not provided');
  }
};

export const verify = async (args: VerifyArgsInterface): Promise<any> => {
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
      circuitFIleName,
      "from.params",
      "to.params",
      `./app/ceremonies/p${args.power}`
    ]
  );

  if (stderr) {
    throw new Error(stderr);
  }

  fs.unlinkSync('to.params');
  fs.unlinkSync('from.params');

  return {}
};
