(globalThis as any).WebAssembly = undefined;
import "@polkadot/wasm-crypto/initOnlyAsm";
import { PORT } from "./constants/server";
import { dispatch } from "./command";

const http = require('http');
const { StringDecoder } = require('string_decoder');

let isCommandExecuting = false

let output: any = null

const server = http.createServer((req: any, res: any) => {
  if (req.method === 'GET' && req.url === '/output') {
    res.writeHead(200, {'Content-Type': 'application/json'});

    res.end(JSON.stringify({
      success: true,
      message: output
    }));

    return
  }

  if (isCommandExecuting) {
    res.writeHead(200, {'Content-Type': 'application/json'});

    res.end(JSON.stringify({
      success: false,
      message: "A command is already being executed. Please try again later."
    }));

    return
  }

  if (req.method === 'POST' && req.url === '/execute') {
    isCommandExecuting = true

    const decoder = new StringDecoder('utf-8');

    let buffer = '';

    req.on('data', (data: any) => {
      buffer += decoder.write(data);
    });

    req.on('end', () => {
      buffer += decoder.end();

      const args = JSON.parse(buffer);

      dispatch(args)
        .then((res: any) => output = res)
        .finally(() => {
          isCommandExecuting = false
        });


      res.writeHead(200, {'Content-Type': 'application/json'});

      res.end(JSON.stringify({
        success: true,
        message: 'Command started'
      }));
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
