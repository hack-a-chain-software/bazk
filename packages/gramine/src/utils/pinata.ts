import { pinataKey, pinataSecret } from "../constants/env";
import { execFile } from "./exec";

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
