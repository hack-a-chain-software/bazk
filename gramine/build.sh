#!/bin/sh
set -e
(cd bazk-build && rm *.manifest && rm *.sgx && rm *.sig && rm -r cruntime && rm -r app && rm -r dist)
(cd bazk-build && git clean -fxd)

cp -r dist bazk-build/app
cp `which node` phase1-build/

win_path=$(pwd | sed 's|^/\([a-z]\)/|\U\1:/|')
linux_path=$(pwd)

sudo docker run \
 -u $(id -u ${USER}):$(id -g ${USER}) \
 -it --rm \
 -v $linux_path/phase1-build:/gramine-build \
 --env IAS_SPID \
 kvin/gramine:1.0 \
 "make dist -C /gramine-build/"