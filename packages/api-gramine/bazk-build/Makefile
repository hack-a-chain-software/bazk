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
all: node ${LIBOS}

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

${BIN_NAME}.manifest.sgx: ${BIN_NAME}.manifest node ${LIBOS}
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
	cp -rfL ${HOST_LIBC_DIR}/libcurl.so.4 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libz.so.1 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libssl.so.1.1 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libcrypto.so.1.1 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libnghttp2.so.14 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libidn2.so.0 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/librtmp.so.1 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libssh.so.4 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libpsl.so.5 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libgssapi_krb5.so.2 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libldap_r-2.4.so.2 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/liblber-2.4.so.2 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libbrotlidec.so.1 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libunistring.so.2 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libgnutls.so.30 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libhogweed.so.5 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libnettle.so.7 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libgmp.so.10 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libdl.so.2 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libkrb5.so.3 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libk5crypto.so.3 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libcom_err.so.2 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libkrb5support.so.0 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libresolv.so.2 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libsasl2.so.2 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libgssapi.so.3 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libbrotlicommon.so.1 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libp11-kit.so.0 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libtasn1.so.6 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libkeyutils.so.1 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libheimntlm.so.0 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libkrb5.so.26 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libasn1.so.8 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libhcrypto.so.4 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libroken.so.18 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libffi.so.7 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libwind.so.0 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libheimbase.so.1 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libhx509.so.5 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libsqlite3.so.0 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libcrypt.so.1 ${RUNTIME_DIR}/lib/
	cp -rfL ${HOST_LIBC_DIR}/libm.so.6 ${RUNTIME_DIR}/lib/
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
	cp node ${PREFIX}/
	cp curl ${PREFIX}/
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