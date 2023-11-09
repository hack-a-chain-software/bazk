#!/bin/sh
set -e
(cd phase1-build && git clean -fxd)
cp -r dist phase1-build/app

win_path=$(pwd | sed 's|^/\([a-z]\)/|\U\1:/|')
linux_path=$(pwd)

docker run \
 -u $(id -u ${USER}):$(id -g ${USER}) \
 -it --rm \
 -v $win_path/phase1-build:/gramine-build \
 --env IAS_SPID \
 kvin/gramine:1.0 \
 "make dist -C /gramine-build/"