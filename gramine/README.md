# zkSnark Execution using Gramine

## Introduction

This project demonstrates how to verify the zkSnark proof of the phase1 of the Groth16.

## Prerequisites

- Operating System: Ubuntu 20.04 (other Linux distributions might work but I haven't tested)

## Getting Started

### Copy SSH key to WSL (Windows Subsystem for Linux)

```bash
cp ./.ssh/gramine-vm_key.pem ~/gramine-vm_key.pem
```

### Grant access to SSH key

This command makes the file readable by the owner of the file only.

```bash
chmod 400 ~/gramine-vm_key.pem
```

### Connect to the SGX-enabled machine using SSH

```bash
ssh -i ~/gramine-vm_key.pem azureuser@172.190.7.62
```

### Copy files

If you want to copy files from your local machine to the remote machine, you can use the following command:

```bash
scp -i ~/gramine-vm_key.pem /mnt/d/projects/hac/repos/bazk/gramine azureuser@172.190.7.62~/gramine
```

#### With SGX Support

Note: This requires the hardare support SGX and properly configured, and the intel aesmd service need to be installed.

To execute your code application within an SGX enclave, utilize the following command:

```bash
sudo make run SGX=1 --always-make
./gramine-sgx phase1-verify
```

#### Without SGX (Direct Mode)

If you prefer to run your application without SGX, you can use:

```bash
sudo make run SGX=0 --always-make
./gramine-direct phase1-verify
```

## Direct execution

### Create a new cerimony

```bash
./phase1-new/phase1-new --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --proving-system groth16 new --challenge-fname ./phase1-new/challenge
```

### Contribute to the ceremony

```bash
SEED=`tr -dc 'A-F0-9' < /dev/urandom | head -c32`
echo $SEED > ./phase1-contribute/seed1

./phase1-contribute/phase1-contribute --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --seed ./phase1-contribute/seed1 --proving-system groth16 contribute --challenge-fname ./phase1-new/challenge --response-fname ./phase1-contribute/response
```

### Verify the contribution

```bash
./phase1-verify/phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --proving-system groth16 verify-and-transform-pok-and-correctness --challenge-fname ./phase1-new/challenge --response-fname ./phase1-contribute/response --new-challenge-fname challenge
```
