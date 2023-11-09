#!/bin/sh
set -e
(cd phase1-verify && git clean -fxd)
cp -r dist phase1-verify/app

win_path=$(pwd | sed 's|^/\([a-z]\)/|\U\1:/|')
linux_path=$(pwd)

docker run \
 -u $(id -u ${USER}):$(id -g ${USER}) \
 -it --rm \
 -v $win_path/phase1-verify:/gramine-build \
 --env IAS_SPID \
 kvin/gramine:1.0 \
 "make dist -C /gramine-build/"

#  Measurement:
#     2695bd0f6f8352329fa547306aff8d62902b729181d68c602417186b8511ca20