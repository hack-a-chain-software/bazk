import https from 'https';
import fs from 'fs';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { pinataKey, pinataSecret } from "../constants/env";
import stream from 'stream';

const pipeline = promisify(stream.pipeline);

export const uploadToPinata = async (filePath: string): Promise<string> => {
  if (pinataKey == null) {
    throw new Error("PINATA_API_KEY env var not set");
  }

  if (pinataSecret == null) {
    throw new Error("PINATA_API_SECRET env var not set");
  }

  const boundary = `--------------------------${Date.now().toString(16)}`;
  const fileContent = await readFile(filePath);

  const filename = filePath.split('/').pop();
  const payload = `--${boundary}\r\n` +
                  `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
                  `Content-Type: application/octet-stream\r\n\r\n` +
                  fileContent + `\r\n` +
                  `--${boundary}--`;

  const options = {
      hostname: 'api.pinata.cloud',
      path: '/pinning/pinFileToIPFS',
      method: 'POST',
      headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'pinata_api_key': pinataKey,
          'pinata_secret_api_key': pinataSecret,
          'Content-Length': Buffer.byteLength(payload)
      }
  };

  return new Promise((resolve, reject) => {
      const req = https.request(options, res => {
          let response = '';
          res.on('data', (chunk) => {
              response += chunk;
          });
          res.on('end', () => {
              if (res.statusCode === 200) {
                  resolve(JSON.parse(response).IpfsHash);
              } else {
                  reject(new Error(`Server responded with status code: ${res.statusCode}`));
              }
          });
      });

      req.on('error', (e) => {
          reject(new Error(`Problem with request: ${e.message}`));
      });

      req.write(payload);
      req.end();
  });
}


export const downloadFromPinata = async (contribution: any): Promise<any> => {
  if (!contribution || !contribution.hash || !contribution.name) {
    throw new Error("Invalid contribution: missing hash or name.");
  }

    const url = `https://ipfs.io/ipfs/${contribution.hash}/`;
    const outputPath = `./${contribution.name}`;

    console.log(`Downloading file from IPFS: ${url}`);

  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        pipeline(response, fs.createWriteStream(outputPath))
          .then(() => resolve(`Download completed: ${outputPath}`))
          .catch((error) => reject(new Error(`Stream pipeline failed: ${error}`)));
      } else {
        reject(new Error(`Failed to download file: Server responded with ${response.statusCode}`));
      }
    });

    request.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
  });
};
