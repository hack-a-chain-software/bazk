#!/bin/sh

(cd bazk-build && rm *.manifest && rm *.sgx && rm *.sig && rm -r cruntime && rm -r app && rm -r dist)

cp -r dist bazk-build/app
# cp -L $(which node) bazk-build/

sudo docker run \
 -u $(id -u ${USER}):$(id -g ${USER}) \
 -it --rm \
 -v $(pwd)/bazk-build:/bazk-build \
 --env IAS_SPID=$IAS_SPID \
 kvin/gramine:1.0 \
 "make dist -C /bazk-build"