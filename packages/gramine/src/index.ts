(globalThis as any).WebAssembly = undefined;
import "@polkadot/wasm-crypto/initOnlyAsm";
import { cryptoWaitReady, signatureVerify } from "@polkadot/util-crypto";
import fs from "fs";
import { PORT } from "./constants/server";
import { dispatch } from "./utils/command";

const http = require('http');
const { StringDecoder } = require('string_decoder');

let isCommandExecuting = false

let output: any = null

async function main(args?: string[]) {
  await cryptoWaitReady();

  dispatch(args)
    .then(res => output = res)
    .finally(() => {
      isCommandExecuting = false
    });

  return {
    data: 'Command started'
  }
}

const server = http.createServer((req: any, res: any) => {
  if (req.method === 'GET' && req.url === '/output') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      success: true,
      message: output
    }));
  } else if (isCommandExecuting) {
    res.writeHead(429, {'Content-Type': 'application/json'});

    res.end(JSON.stringify({
      success: false,
      message: 'A command is already being executed. Please try again later.',
    }));
  } else if (req.method === 'POST' && req.url === '/execute') {
    isCommandExecuting = true

    const decoder = new StringDecoder('utf-8');

    let buffer = '';

    req.on('data', (data: any) => {
      buffer += decoder.write(data);
    });

    req.on('end', () => {
      buffer += decoder.end();

      const args = JSON.parse(buffer);

      main(args).then((result: any) => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        if (result.error) {
          res.end(JSON.stringify({
            success: false,
            error: result.error,
          }));
        } else {
          res.end(JSON.stringify({
            success: true,
            message: result.data
          }));
        }
      }).catch((error) => {
        res.writeHead(400, {'Content-Type': 'application/json'});

        res.end(JSON.stringify({ success: false, message: error.message }));
      })
    });
  } else {
    res.writeHead(404, {'Content-Type': 'application/json'});

    res.end(() => {
      return JSON.stringify({ success: false, message: 'Endpoint not found' })
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
