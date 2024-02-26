#!/bin/bash
echo "Starting the build"

# yarn install

# npx webpack --config webpack.config.js

# (cd ./bazk-build && rm -f *.manifest *.sgx *.sig && rm -rf cruntime app dist)

# Copia os binários construídos para o local especificado
# cp -r ./ceremonies ./dist/ceremonies

# cp -r dist bazk-build/app
# cp -L $(which curl) bazk-build/

# # Run Docker without TTY in a non-interactive environment
docker run \
    -u $(id -u ${USER}):$(id -g ${USER}) \
    --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v $(pwd)/bazk-build:/bazk-build \
    --env IAS_SPID=bdc61911b9d84b1fb0d34414f29c66b2 \
    kvin/gramine:1.0 \
    "make dist -C /bazk-build"


echo "Build and setup completed successfully. Exiting..."

exit 0
