#!/bin/sh
(cd bazk-build && rm -f *.manifest *.sgx *.sig && rm -rf cruntime app dist)

cp -r dist bazk-build/app
cp -L $(which curl) bazk-build/
cp -L $(which node) bazk-build/

# Run Docker without TTY in a non-interactive environment
sudo docker run \
    -u $(id -u ${USER}):$(id -g ${USER}) \
    --rm \
    -v $(pwd)/bazk-build:/bazk-build \
    --env .env \
    kvin/gramine:1.0 \
    "make dist -C /bazk-build"
