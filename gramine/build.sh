#!/bin/sh
set -e
# (cd phase1-build && rm *.manifest && rm *.sgx && rm *.sig && rm -r cruntime && rm -r app && rm -r dist)
(cd phase1-build && git clean -fxd)

cp -r dist phase1-build/app
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