
import fs from "fs";

const IPFS = require("ipfs-only-hash");

export const getIpfsHash = async (filePath: string) => {
  const fileContent = fs.readFileSync(filePath);
  const hash = await IPFS.of(fileContent);
  return hash;
}
