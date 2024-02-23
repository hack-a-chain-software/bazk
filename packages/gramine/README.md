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
scp -r -i ~/gramine-vm_key.pem /mnt/d/projects/hac/repos/bazk/gramine azureuser@172.190.7.62:~/


scp -r -i ~/gramine-vm_key.pem /mnt/d/projects/hac/repos/bazk/gramine/phase1-build/phase1.manifest.template azureuser@172.190.7.62:~/gramine/phase1-build/

scp -r -i ~/gramine-vm_key.pem /mnt/d/projects/hac/repos/bazk/gramine/phase1-build/Makefile azureuser@172.190.7.62:~/gramine/phase1-build/
```

### Copy files and compile snark-setup inside the vm

```bash
# Local host
scp -r -i ~/gramine-vm_key.pem /mnt/d/Projects/HAC/Repos/snark-setup/phase1 azureuser@172.190.7.62:~/snark-setup/
scp -r -i ~/gramine-vm_key.pem /mnt/d/Projects/HAC/Repos/snark-setup/phase1-cli azureuser@172.190.7.62:~/snark-setup/

# VM host
cargo run --release --bin phase1 --features cli
cp ~/snark-setup/target/release/phase1 ~/gramine/phase1-verify/phase1-verify
cd ~/gramine/
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
# HOST
./phase1-verify/phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --proving-system groth16 new --challenge-fname ./data/challenge_pot10_0001.ptau --challenge-hash-fname ./data/challenge_pot10_0001.ptau.hash

# SGX
./gramine-sgx phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --proving-system groth16 new --challenge-fname challenge --challenge-hash-fname challenge.verified.hash

### Contribute to the ceremony

```bash
SEED=`tr -dc 'A-F0-9' < /dev/urandom | head -c32`
echo $SEED > ./data/seed1

# First contribution - Step 1 - Contribute to the ceremony and generate a response file
# HOST
./phase1-verify/phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --seed ./data/seed1 --proving-system groth16 contribute --challenge-fname ./data/challenge_pot10_0001.ptau --challenge-hash-fname ./data/challenge_pot10_0001.ptau.hash --response-fname ./data/response_pot10_0001.ptau --response-hash-fname ./data/response_pot10_0001.ptau.hash

# SGX
./gramine-sgx phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --seed seed1 --proving-system groth16 contribute --challenge-fname challenge --challenge-hash-fname challenge.verified.hash --response-fname response --response-hash-fname response.verified.hash

# First contribution - Step 2 - Verify the contribution and generate a new challenge file
# HOST 
./phase1-verify/phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --proving-system groth16 verify-and-transform-pok-and-correctness --challenge-fname ./data/challenge_pot10_0001.ptau --challenge-hash-fname ./data/challenge_pot10_0001.ptau.hash --response-fname ./data/response_pot10_0001.ptau --response-hash-fname ./data/response_pot10_0001.ptau.hash --new-challenge-fname ./data/challenge_pot10_0002.ptau --new-challenge-hash-fname ./data/challenge_pot10_0002.ptau.hash

# SGX
./gramine-sgx phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --proving-system groth16 verify-and-transform-pok-and-correctness --challenge-fname challenge --challenge-hash-fname challenge.verified.hash --response-fname response --response-hash-fname response.verified.hash --new-challenge-fname challenge --new-challenge-hash-fname challenge.verified.hash


# Second contribution
# HOST
./phase1-verify/phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --seed ./data/seed1 --proving-system groth16 contribute --challenge-fname ./data/challenge_pot10_0002.ptau --challenge-hash-fname ./data/challenge_pot10_0002.ptau.hash --response-fname ./data/response_pot10_0002.ptau --response-hash-fname ./data/response_pot10_0002.ptau.hash

# SGX
./gramine-sgx phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --seed seed1 --proving-system groth16 contribute --challenge-fname challenge --challenge-hash-fname challenge.verified.hash --response-fname response --response-hash-fname response.verified.hash

# HOST
./phase1-verify/phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --proving-system groth16 verify-and-transform-pok-and-correctness --challenge-fname ./data/challenge_pot10_0002.ptau --challenge-hash-fname ./data/challenge_pot10_0002.ptau.hash --response-fname ./data/response_pot10_0002.ptau --response-hash-fname ./data/response_pot10_0002.ptau.hash --new-challenge-fname ./data/challenge_pot10_0003.ptau --new-challenge-hash-fname ./data/challenge_pot10_0003.ptau.hash

# SGX
./gramine-sgx phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --proving-system groth16 verify-and-transform-pok-and-correctness --challenge-fname challenge --challenge-hash-fname challenge.verified.hash --response-fname response --response-hash-fname response.verified.hash --new-challenge-fname challenge --new-challenge-hash-fname challenge.verified.hash
````

### Verify the contribution

```bash
# HOST
./phase1-verify/phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --proving-system groth16 verify-and-transform-ratios --response-fname ./data/challenge_pot10_0002.ptau

# SGX
./gramine-sgx phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --proving-system groth16 verify-and-transform-ratios --response-fname challenge


./phase1-verify/phase1-verify --curve-kind bls12_377 --batch-size 512 --contribution-mode full --power 10 --proving-system groth16 verify-and-transform-ratios --response-fname ./data/challenge_pot10_0003.ptau
```

## Differences between memory map (not works on sgx) and buffer writer (works on sgx)

mmap (memory map) and BufWriter in Rust serve different purposes and operate at different levels of abstraction when it comes to handling I/O operations:

### Memory Map (mmap)

- Low-Level: Memory mapping is a low-level mechanism provided by the operating system that maps a file or device into memory. It allows a program to access file data directly from memory rather than going through read and write system calls, which can be more efficient for certain operations because it avoids the overhead of the system call interface.

- File as Memory: When a file is memory-mapped, it appears to the program as a part of its virtual memory address space. This can make reading from and writing to the file as easy as accessing memory arrays, which can be very fast and convenient, especially for random access and for large files.

- Page Caching: The OS manages the memory-mapped file through its page cache. This means that changes to the mapped memory are not immediately written to the file but are cached and flushed to disk at the discretion of the OS, which can optimize I/O operations.

- Direct Access: Memory mapping is useful when you need to manipulate a file as if it were a large array, or when you want multiple processes to share access to the same file data.

### BufWriter

- High-Level: BufWriter is a high-level abstraction provided by Rust's standard library. It wraps around a Write instance and buffers the writes to it, reducing the number of write operations that actually hit the underlying writer, which is often a file or a network stream.

- Buffered I/O: The purpose of BufWriter is to reduce the number of write system calls by collecting data to be written in a memory buffer and then writing it out in larger chunks. This can greatly improve performance when many small writes are performed.

- Explicit Control: Unlike memory-mapped I/O, where the OS decides when to flush the cache to disk, with BufWriter you have more explicit control over when data is written out through the flush method.

- Simplicity and Safety: BufWriter is generally easier to use correctly than memory mapping, as it abstracts away many of the complexities and potential pitfalls of direct file memory access. It's also more idiomatic in Rust for regular file I/O operations.

### Key Differences

- Control: mmap gives you more control and potentially better performance for large files or shared memory, but it's also more complex and can introduce subtle bugs if not used carefully. BufWriter is simpler and safer for common I/O tasks.

- Use Case: mmap is often used for applications that require processing large files or implementing inter-process communication. BufWriter is typically used for writing data to files or streams where you want to minimize system call overhead.

- Operating System: mmap's behavior and performance can be highly dependent on the operating system's implementation of virtual memory and page caching. BufWriter's behavior is more consistent across platforms because it relies on Rust's standard library for buffering logic.

- In summary, whether to use mmap or BufWriter depends on the specific requirements of your application, the size of the data you're working with, the access patterns, and the level of control you need over I/O operations.