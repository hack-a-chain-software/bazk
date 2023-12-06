SGX_SIGNER_KEY ?= ./private.dev.pem
SGX ?= 1
BUILD ?= release

ARCH_LIBDIR ?= /lib/$(shell $(CC) -dumpmachine)

CFLAGS = -Wall -Wextra

USE_MUSL ?= 0

BIN_NAME = bazk
RA_METHOD ?= epid

GRAMINE_DIR ?= $(shell ./gramine-dir libs)
GRAMINE_LIBOS ?= $(shell ./gramine-dir libos)
GRAMINE_RUNTIME_DIR ?= $(shell ./gramine-dir runtime)

RUNTIME_DIR = cruntime
LIBOS_BASENAME ?= $(shell basename ${GRAMINE_LIBOS})
LIBOS ?= ${RUNTIME_DIR}/${LIBOS_BASENAME}

ifeq ($(USE_MUSL),1)
CARGO_ARGS = --target x86_64-unknown-linux-musl
HOST_LIBC_DIR = /lib/x86_64-linux-musl
else
CARGO_ARGS =
HOST_LIBC_DIR = /lib/x86_64-linux-gnu
endif

ifeq ($(V),1)
CARGO_ARGS += -vv
endif

PREFIX ?= ./dist
PRUNTIME_DATA_DIR ?= data
PRUNTIME_SEAL_DIR ?= ${PRUNTIME_DATA_DIR}/protected_files
PRUNTIME_STORAGE_DIR ?= ${PRUNTIME_DATA_DIR}/storage_files

.PHONY: all
all: ${BIN_NAME} ${LIBOS}

.PHONY: signed-sgx-artifacts
signed-sgx-artifacts: ${BIN_NAME}.manifest ${BIN_NAME}.manifest.sgx ${BIN_NAME}.sig

${BIN_NAME}.manifest: ${BIN_NAME}.manifest.template
	echo "IAS_SPID=${IAS_SPID}"
	gramine-manifest \
		-Dra_client_spid=${IAS_SPID} \
		-Dlibdir=${RUNTIME_DIR}/lib/ \
		-Dlibos=${LIBOS} \
		-Dra_method=${RA_METHOD} \
		-Dappname=${BIN_NAME} \
		$< $@

${BIN_NAME}.manifest.sgx: ${BIN_NAME}.manifest ${BIN_NAME} ${LIBOS}
	@test -s $(SGX_SIGNER_KEY) || \
	    { echo "SGX signer private key was not found, please specify SGX_SIGNER_KEY!"; exit 1; }
	gramine-sgx-sign \
		--key $(SGX_SIGNER_KEY) \
		--manifest $< \
		--output $@

${LIBOS}:
	mkdir -p ${RUNTIME_DIR}
	rsync -r --no-links ${GRAMINE_RUNTIME_DIR}/ ${RUNTIME_DIR}/lib
	cp -rfL ${HOST_LIBC_DIR}/libstdc++.so.6 ${RUNTIME_DIR}/lib/
ifeq ($(USE_MUSL),0)
	cp -rfL ${HOST_LIBC_DIR}/libgcc_s.so.1 ${RUNTIME_DIR}/lib/
endif
ifeq ($(SGX),1)
	cp -rfL ${GRAMINE_DIR}/sgx ${RUNTIME_DIR}/
endif
	cp -rfL ${GRAMINE_DIR}/direct ${RUNTIME_DIR}/
	cp -rfL ${GRAMINE_LIBOS} ${RUNTIME_DIR}/

${BIN_NAME}.sig: ${BIN_NAME}.manifest.sgx

${BIN_NAME}.token: ${BIN_NAME}.sig
	gramine-sgx-get-token \
		--output $@ --sig $<

.PHONY: token
token: ${BIN_NAME}.token

.PHONY: clean
clean:
	$(RM) *.token *.sig *.manifest.sgx *.manifest ${BIN_NAME}.o
	$(RM) -rf ../target
	$(RM) -rf data
	$(RM) -rf ${RUNTIME_DIR}

.PHONY: distclean
distclean: clean

.PHONY: pre-dist
pre-dist: all
	mkdir -p ${PREFIX}/data
	cp ${BIN_NAME} ${PREFIX}/
	cp -rf bin ${PREFIX}/
	cp node ${PREFIX}/
	cp -rfL ${RUNTIME_DIR} ${PREFIX}/

.PHONY: dist
ifeq ($(SGX),1)
dist: pre-dist ${BIN_NAME}.manifest signed-sgx-artifacts
	cp ${BIN_NAME}.manifest ${PREFIX}/
	cp ${BIN_NAME}.manifest.sgx ${PREFIX}/
	cp ${BIN_NAME}.sig ${PREFIX}/
	cp gramine-sgx ${PREFIX}/
else
dist: pre-dist ${BIN_NAME}.manifest
	cp ${BIN_NAME}.manifest ${PREFIX}/
endif
	cp gramine-direct ${PREFIX}/
	cp -r app ${PREFIX}/

token-dist: token dist
	cp ${BIN_NAME}.token ${PREFIX}/

.PHONY: run
run: all token
	make dirs
ifeq ($(SGX),1)
	./gramine-sgx ${BIN_NAME}
else
	./gramine-direct ${BIN_NAME}
endif