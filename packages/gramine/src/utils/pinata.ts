import { execFile } from "./exec";
import { pinataKey, pinataSecret } from "../constants/env";

export const uploadToPinata = async (filePath: string): Promise<string> => {
  if (pinataKey == null) {
    throw new Error("PINATA_API_KEY env var not set");
  }

  if (pinataSecret == null) {
    throw new Error("PINATA_API_SECRET env var not set");
  }

  const curlCommand = "./curl";

  const args = [
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    "-s",
    "-X",
    "POST",
    "-H",
    `pinata_api_key: ${pinataKey}`,
    "-H",
    `pinata_secret_api_key: ${pinataSecret}`,
    "-F",
    `file=@./${filePath}`,
  ];

  try {
    const { stdout, stderr } = await execFile(curlCommand, args);

    if (stderr) {
      throw new Error(`Error: ${stderr}`);
    }

    console.log("[IPFS] Upload successful");
    console.log("[IPFS] stdout: \n");
    console.log(stdout);
    console.log("\n");

    const response = JSON.parse(stdout);
    return response.IpfsHash;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
}

export const downloadFromPinata = async (cid: string): Promise<any> => {
  if (cid == null) {
    throw new Error("invalid CID");
  }

  const curlCommand = "./curl";

  const args = [
    `https://ipfs.io/ipfs/${cid}/`,
    "-s",
    "--output",
    `./circom1.params`
  ];

  try {
    const { stderr } = await execFile(curlCommand, args);

    if (stderr) {
      throw new Error(`Error: ${stderr}`);
    }

  } catch (error) {
    console.error("Error download file from IPFS:", error);
    throw error;
  }
}
