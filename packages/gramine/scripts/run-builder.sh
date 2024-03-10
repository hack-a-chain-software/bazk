#!/bin/sh

(cd bazk-build && rm -f *.manifest *.sgx *.sig && rm -rf cruntime node app dist curl)

chmod +x -R ./bazk-build

cp -r ./core/* /bazk-build/

cp -r ./bazk-build/payload/* /bazk-build/app/

make dist -C /bazk-build

cp ./bazk-build/circuit.json bazk-build/dist

(cd bazk-build && rm -f *.manifest *.sgx *.sig && rm -rf cruntime app curl node payload)
