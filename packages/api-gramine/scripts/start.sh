#!/bin/bash

# Check server mode
if [ "$TEST_MODE" = "true" ]; then
  cd ./dist && mkdir -p ./data && chmod 777 -R . && ./node ./app/index.js
else
  cd ./dist && mkdir -p ./data && chmod 777 -R . && ./gramine-sgx bazk ./app/index.js
fi
