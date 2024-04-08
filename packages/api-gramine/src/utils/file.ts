import { uploadToPinata } from "./pinata";

export const getOutputFiles = async(
  commandfileName: string,
  fileArgs: string[],
  power: number
) => {
  console.log("[Enclave] Getting output file name...");
  var outputFileNames = getOutputFilename(commandfileName, fileArgs, power);
  var outputFileHashes = new Array<string>();
  let fileArray: File[] = [];

  if (outputFileNames != null) {
    console.log("[Enclave] Output file count: ", outputFileNames?.length);

    for (let i = 0; i < outputFileNames.length; i++) {
      let outputFileName = outputFileNames[i];
      const timestamp = Math.floor(Date.now() / 1000);
      console.log("[IPFS] Uploading output file to IPFS...", outputFileName);
      const ipfsHash = await uploadToPinata(outputFileName);
      outputFileHashes.push(ipfsHash);

      console.log(`[IPFS] Output file uploaded to IPFS with hash: `, ipfsHash);

      console.log("[Enclave] Adding file object to array...");

      fileArray.push(
        createFileObject(
          ipfsHash,
          outputFileName,
          Math.floor(Date.now() / 1000)
        )
      );
    }
  }

  return fileArray;
}

export const getOutputFilename = (command: string, fileArgs: string[], power: number) => {
  let fileName = new Array<string>();
  if (command.includes("new_constrained")) {
    fileName.push(fileArgs?.[0]);
  } else if (
    command.includes("new") ||
    command.includes("contribute") ||
    command.includes("compute_constrained") ||
    command.includes("beacon_constrained")
  ) {
    fileName.push(fileArgs?.[1]);
  } else if (command.includes("verify_transform_constrained")) {
    fileName.push(fileArgs?.[2]);
  } else if (command.includes("prepare_phase2")) {
    for (let i = 0; i <= power; i++) {
      fileName.push(`phase1radix2m${i}`);
    }
  }

  return fileName;
}

interface File {
  hash: string;
  name: string;
  timestamp: number;
}

export const createFileObject = (hash: string, name: string, timestamp: number): File => {
  return { hash, name, timestamp };
}

export const getInputFilename = (command: string, fileArgs: string[] | undefined) => {
  let fileName = null;
  if (
    command.includes("compute_constrained") ||
    command.includes("prepare_phase2") ||
    command.includes("contribute") ||
    command.includes("new")
  ) {
    fileName = fileArgs?.[0];
  } else if (command.includes("verify_transform_constrained")) {
    fileName = fileArgs?.[1];
  }
  return fileName;
}
