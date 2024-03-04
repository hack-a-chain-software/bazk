# BAZK

## What is BAZK?

BAZK is a zkSNARK library for Phala Network. It is based on [gramine]. It is designed to be used in the following scenarios:

- **Secure Computation**: BAZK can be used to perform secure computation on sensitive data, ensuring that the data and computation results remain confidential and have not been tampered with.

## What is a Pod?

A Pod is a secure enclave that runs a program within an Intel SGX (Software Guard Extensions) environment and is attested by the Phala Phat Contract. It provides a trusted execution environment for sensitive computations, ensuring that data and code remain confidential.

### Typical Pod Operation

- **Key Generation**: The Pod generates a public-private key pair. The private key remains securely stored within the SGX enclave.

- **Remote Attestation**: The Pod undergoes SGX remote attestation, a process that verifies the integrity of the enclave and ensures it is running on a genuine SGX-enabled platform.

- **Key Validation**: The validator Phat Contract validates the Pod's identity and attestation results. Upon successful validation, the contract signs the Pod's public key, endorsing its authenticity.

- **Secure Computation and Signing**: The Pod executes sensitive computations within the SGX enclave, leveraging the enclave's secure environment to protect data confidentiality and integrity. The Pod can then use its private key to sign the computation results, providing a verifiable proof of execution.

- **Result Verification and Signature Validation**: The user receives the computation results and the corresponding signature generated by the Pod. Than it can verify the results with the following steps:
  - The user obtains the Validator contract's public key from the contract itself.
  - The user verifies the Pod's public key against the Validator contract's public key. This ensures that the Pod's public key has been endorsed by the Validator contract and is associated with a legitimate Pod.
  - The user verifies the Pod's signature on the computation results using the Pod's public key. This confirms that the results were indeed generated by the Pod and have not been tampered with.
    By performing both of these verification steps, the user can establish confidence in the authenticity and integrity of the computation results provided by the Pod.

## What's in this repo?

There are four subdirectories in this repo:

- `gramine-image/`: Dockerfile for the gramine build tools that is used to build measured pod app.
- `pod-validator/`: The source code of the validator contract.
- `ra-report/`: The js source code of the npm package used to generate attestation report and communicate with the validator contract.
- `nodejs-app-template/`: A template for pod app with attestation example.

## Getting Started

### Prerequirements

- [Docker](https://docs.docker.com/get-docker/) installed and the docker daemon is running.
- Current user is in the `docker` group.
- [Node.js](https://nodejs.org/en/download/) installed. (Tested version : `v16.17.1`)
- [Act](https://github.com/nektos/act) installed. (Tested version : `0.2.9`)
- Intel IAS API key and SPID. (You can get it from [here](https://api.portal.trustedservices.intel.com/products#product=dev-intel-software-guard-extensions-attestation-service-linkable). can subscribe to get immediate access to the development environment)

#### Initialize submodules

```bash
git submodule update --init --recursive
```

#### Install the dependencies

```bash
yarn gramine
```

### Build and deploy the validator contract

First you can build the validator contract by running the following command in the root directory of this repo:

```bash
cd pod-validator/
patron build

# When build successfully, you would get an HTTP URL like this:
# https://patron.works/codeHash/7298c937d5a638271892eaa35fda08ee931bcf5b197ff3a8a602e978243443f4
```

That requires you to have [patron](https://patron.works/getting-started) installed. If you don't want to install it and the Rust toolchain, you can use the compiled contract from [here](https://patron.works/codeHash/7298c937d5a638271892eaa35fda08ee931bcf5b197ff3a8a602e978243443f4).

Goto the contract link on patron, click the `Deploy with Phala` button and follow the instructions to deploy the contract.
If everything goes well, you would get a contract address, that would be used in the next step, and a web page to operation with the contract.

### Build the pod app

You can clone this repo and develop your pod app based on the template in `nodejs-app-template/` directory.

Edit the ` index.ts` to replace the value of `VALIDATOR_CONTRACT_ADDRESS` with the address you got from the previous step.
And maybe replace the rpc endpoint if you deployed it on a different testnet.

To build the template app, run the following command in the root directory of this repo:

```bash [Local | Ubuntu-20.04 (WSL)]
cd gramine/
cp -L $(which node) bazk-build/
export IAS_SPID=YOUR_IAS_SPID
yarn gramine build
```

You would get a measurement result in the log like this:

```
    0000000000010000-00000001ff463000 [REG:RWX] (free)
Measurement:
    fc7f4aab5436670d2f4b26c71441cdc420a0d7537b68d4d06c1d6b907cf35d57
```

### Add the measurement result to the validator contract

Goto the contract web page and click the `allow` button, paste the measurement result(don't forget to add the prefix `0x`) you got from the previous step click the [Run] button.
You will see a line of log in the log panel like this:

```
[#638695][2023-10-20T04:16:42.157Z] Added: 0xfc7f4aab5436670d2f4b26c71441cdc420a0d7537b68d4d06c1d6b907cf35d57
```

### Deploy on Azure with SGX

- Go to portal.azure.com
- Create a new virtual machine: Standard DC2s v2 (2 vcpus, 8 GiB memory)

- Copy the `dist` folder from local machine to the VM

```bash [Local | Ubuntu-20.04 (WSL)]
export AZURE_SSH_PATH=~/YOUR_VM_SSH_KEY_FILE.pem
export AZURE_HOST_IP=YOUR_VM_IP
yarn gramine deploy-azure
```

- Connect with SSH

```bash [Remote]
ssh -i ~/gramine-vm_key.pem azureuser@172.190.7.62
```

### Run the pod app

When you initialize our pod, whether on an Azure virtual machine or locally in dev mode, our pod launches an API. This API is designed to receive a request on the /execute route, and can receive any base commands
To run the pod app, you need a machine with at least Linux kernel v5.13 and SGX enabled.

Run to production:
```bash
cd bazk-build/
sudo docker run --rm --device /dev/sgx_enclave --device /dev/sgx_provision -v`pwd`/dist:/dist -it gramineproject/gramine
cd /dist
```

Run dev:
```bash
yarn gramine dev
```

#### Apply the environment variables

```bash
export ACCOUNT_MNEMONIC=YOUR_ACCOUNT_MNEMONIC_WITH_ENOUGH_BALANCE
export PINATA_API_KEY=YOUR_PINATA_API_KEY
export PINATA_API_SECRET=YOUR_PINATA_API_SECRET
export SGX_ENABLED=true
export IAS_API_KEY=YOUR_IAS_API_KEY_GOT_FROM_INTEL
```

####  Run Phase 1 using SGX (KZG) or Node

```bash
curl -X POST http://<YOUR_MACHINE_PUBLIC_IP>:3000/execute \
     -H "Content-Type: application/json" \
     -d '["./app/bin/new_constrained", "challenge", 10, 256, "my ceremony name", "my ceremony description", 1709221725]'

curl -X POST http://<YOUR_MACHINE_PUBLIC_IP>:3000/execute \
     -H "Content-Type: application/json" \
     -d '["./app/bin/compute_constrained", "challenge1", "response1", 10, 256]'

curl -X POST http://<YOUR_MACHINE_PUBLIC_IP>:3000/execute \
     -H "Content-Type: application/json" \
     -d '["./app/bin/verify_transform_constrained", "challenge1", "response1", "challenge2", 10, 256]'

curl -X POST http://<YOUR_MACHINE_PUBLIC_IP>:3000/execute \
     -H "Content-Type: application/json" \
     -d '["./app/bin/compute_constrained", "challenge2", "response2", 10, 256]'

curl -X POST http://<YOUR_MACHINE_PUBLIC_IP>:3000/execute \
     -H "Content-Type: application/json" \
     -d '["./app/bin/prepare_phase2", "response2", 10, 256]'
```

** For this version of the API, we have temporarily copied a circom.json so that anyone can test the commands. This will be updated in the next versions

#### Run Phase 1 using Node directly

```bash
# --------------------------------
# Notes
# --------------------------------
# 1) New ceremony with new challenge
# index.js ./app/bin/new_constrained challenge <power> <bash> <ceremony name> <ceremony description> <deadline timestamp>
#
# 2) Contribute to the ceremony
# index.js <ceremony id> ./app/bin/compute_constrained <challenge> <response> <power> <bash>
#
# 3) Verify the ceremony and create new challange
# index.js <ceremony id> ./app/bin/verify_transform_constrained <existing challenge> <response> <new challenge> <power> <bash>
#
# 4) Finalize the ceremony and prepare for phase 2
# index.js <ceremony id> ./app/bin/prepare_phase2 <response> <power> <bash>
# --------------------------------

## Env file
SGX_ENABLED=false

./node ./app/index.js ./app/bin/new_constrained challenge 10 256 "my ceremony name" "my ceremony description" 1709221725
./node ./app/index.js 1707244846 ./app/bin/compute_constrained challenge response 10 256
./node ./app/index.js 1707244846 ./app/bin/verify_transform_constrained challenge response challenge2 10 256
./node ./app/index.js 1707244846 ./app/bin/compute_constrained challenge2 response2 10 256
./node ./app/index.js 1707244846 ./app/bin/prepare_phase2 response2 10 256
```	

#### Run Phase 2 using SGX (Groth16)

```bash
curl -X POST http://<YOUR_MACHINE_PUBLIC_IP>:3000/execute \
     -H "Content-Type: application/json" \
     -d '["./app/bin/new", "circuit.json", "circom1.params", "./app/ceremonies/p12", 12, 256, "my ceremony name", "my ceremony description", 1709221725]'

curl -X POST http://<YOUR_MACHINE_PUBLIC_IP>:3000/execute \
     -H "Content-Type: application/json" \
     -d '["./app/bin/contribute", "circom1.params", "circom2.params"]'

curl -X POST http://<YOUR_MACHINE_PUBLIC_IP>:3000/execute \
     -H "Content-Type: application/json" \
     -d '["./app/bin/verify_contribution", "circuit.json", "circom1.params", "circom2.params", "./"]'
```

** For this version of the API, we have temporarily copied a circom.json so that anyone can test the commands. This will be updated in the next versions

#### Run Phase 2 using Node directly

```bash
./node ./app/index.js ./app/bin/new circuit.json circom1.params ./app/ceremonies/p12 12 256 "my ceremony name" "my ceremony description" 1709221725
./node ./app/index.js 1706736894 ./app/bin/contribute circom1.params circom2.params
./node ./app/index.js 1706736894 ./app/bin/contribute circom2.params circom3.params
./node ./app/index.js 1706736894 ./app/bin/verify_contribution circuit.json circom2.params circom3.params ./
./node ./app/index.js 1706736894 ./app/bin/contribute circom3.params circom4.params
```

## Generate circuit files

```bash
circom circuit.circom --r1cs
snarkjs rej circuit.r1cs circuit.json
```

#### Run App using dev mode

1) Build the app:
```bash
$ pnpm gramine build
```

2) Check the gramine package and copy the .env.example file and edit it with your environment config:
```bash
$ cp ./packages/gramine/.env.example ./packages/gramine/.env
```
** Don't forget to update the SGX ENABLED variable to **false**

4) Run the app using a initial command
```bash
# --------------------------------
# Notes to use the app commands
# --------------------------------
# 1) New ceremony with new challenge
# yarn gramine dev ./app/bin/new_constrained <challenge> <power> <bash> <ceremony name> <ceremony description> <deadline timestamp>
#
# 2) Contribute to the ceremony
# yarn gramine dev <ceremony id> ./app/bin/compute_constrained <challenge> <response> <power> <bash>
#
# 3) Verify the ceremony and create new challange
# yarn gramine dev <ceremony id> ./app/bin/verify_transform_constrained <existing challenge> <response> <new challenge> <power> <bash>
#
# 4) Finalize the ceremony and prepare for phase 2
# yarn gramine dev <ceremony id> ./app/bin/prepare_phase2 <response> <power> <bash>
# --------------------------------

## Base example to create a new ceremony
$ yarn gramine dev ./app/bin/new_constrained challenge 10 256 "my ceremony name" "my ceremony description" 1709221725
$ yarn gramine dev 1708608454 ./app/bin/compute_constrained challenge response 10 256
$ yarn gramine dev 1707244846 ./app/bin/verify_transform_constrained challenge response challenge2 10 256
$ yarn gramine dev 1707244846 ./app/bin/compute_constrained challenge2 response2 10 256
$ yarn gramine dev 1707244846 ./app/bin/prepare_phase2 response2 10 256
```	

## Workflows

In order to test the workflows locally, you need to install [act](https://github.com/nektos/act).

After install, you can the workflow using the following command:

```bash
act -W .github/workflows/build-and-release.yml --artifact-server-path ./.github/workflows/.artifacts/ --secret-file ./packages/gramine/.env --job build
```

If you want to run in your own environment, you can use the following command:

```bash
act -W .github/workflows/build-and-release.yml --artifact-server-path ./.github/workflows/.artifacts/ --secret-file ./packages/gramine/.env -P ubuntu-latest=-self-hosted --job build
```
