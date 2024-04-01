# Gramine
This repository is based on the [pod validator](https://github.com/Phala-Network/phat-pod-tools) repository of the Phala Network and gramine package.

The code is responsible for managing a Node.js server integrated with Gramine that offers commands for the creation of ceremonies, generation of contributions, and verification of contributions.

### Directory Structure
-----------------
In our project, we used the phat-pod-tools template from Phala Network to generate the build of our Node.js server compatible with Gramine.

Here's a brief overview of the structure:

```bash
.
├── bazk-build    # Gramine build template
├── ceremonies    # Phase1 ceremonies
├── docker        # Docker images
├── scripts       # Scripts to setup
├── src           # Nodejs server
```

We have the Node.js server and a complete setup to be able to run it inside the Gramine SGX.

### Dependencies
-----------------
- [Docker](https://docs.docker.com/get-docker/) installed and the docker daemon is running.
- Current user is in the `docker` group.
- [Node.js](https://nodejs.org/en/download/) installed. (Tested version : `v16.17.1`)
- Intel IAS API key and SPID. (You can get it from [here](https://api.portal.trustedservices.intel.com/products#product=dev-intel-software-guard-extensions-attestation-service-linkable). can subscribe to get immediate access to the development environment)

### Installation
-----------------
1) Clone the repository:
```bash
$ gh repo clone hack-a-chain-software/bazk
$ cd bazk
```

2) Check all packages and copy the .env.example file and edit it with your environment config:
```bash
$ cp ./packages/gramine/.env.example ./packages/gramine/.env
```

3) Install frontend dependencies via PNPM
```bash
$ yarn install
```

### Environments
-----------------
```bash
# Required variables
IAS_SPID="YOUR_INTEL_IAS_SPID"
IAS_API_KEY="YOUR_INTEL_IAS_API_KEY"
PINATA_API_KEY="YOUR_PINATA_API_KEY"
PINATA_API_SECRET="YOUR_PINATA_SECRET"
ACCOUNT_MNEMONIC="VALIDATOR_CONTRACT_ACCOUNT"

# Variables with defaults
SGX_ENABLED=true
TEST_MODE=false
```

### Build
-----------------
```bash
yarn gramine build
```

### Run development
-----------------
After building the app and create the **env file**, you can run the server in development mode with the following steps:

```bash
## Development mode requires
SGX_ENABLED=false
TEST_MODE=true

yarn gramine start
```

### Run production
-----------------
After building the app and create the **env file**, you can run the server in production mode inside in gramine with the following steps:

```bash
## Production mode requires
SGX_ENABLED=true
TEST_MODE=false

yarn gramine start
```

### API Specs
In the current version, our server can receive commands for you to create a new phase 2 ceremony, generate contributions for ceremonies, and also verify contributions.

For both modes, development and production, the API listens on port 3000, and you can perform the following commands:

```bash
# --------------------------------
# Notes
# --------------------------------
# 1) New phase2 ceremony
# Send a POST request with the command key as 'create' and a data object with the command arguments
# --------------------------------
curl -X POST http://{IP OR LOCALHOST}:3000/execute \
     -H "Content-Type: application/json" \
     -d '{"key":"create","data":{"power":"10","name":"1 New Era", "description":"my ceremony description","deadline":1712712496}}'

# --------------------------------
# Notes
# --------------------------------
# 2) Contribute to the ceremony
# Send a POST request with the command key as 'contribute' and a data object with the command arguments
# --------------------------------
curl -X POST http://{IP OR LOCALHOST}:3000/execute \
     -H "Content-Type: application/json" \
     -d '{"key":"contribute","data":{"ceremonyId":1710878188}}'

# --------------------------------
# Notes
# --------------------------------
# 3) Verify the contribution
# Send a POST request with the command key as 'verify' and a data object with the command arguments
# --------------------------------
curl -X POST http://{IP OR LOCALHOST}:3000/execute \
     -H "Content-Type: application/json" \
     -d '{"key":"verify","data":{"hashes":["QmcE8DfXtNKrg4R5nQNkb9qoKNw1u8QyBhKfhmR3YpmBY8","QmRJWTjM4HNncaWDQhs9RHF3LRZ19Aamu66vwpBgnRBKiA"]}}'
```
