#!/bin/sh
docker run \
    -u $(id -u ${USER}):$(id -g ${USER}) \
    --rm -it \
    --env-file .env \
    -v $(pwd)/bazk-build:/bazk-build \
    mateus4loading/bazk-builder:latest \
