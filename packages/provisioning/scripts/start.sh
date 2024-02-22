#!/bin/bash

# Path of the folder to check
FOLDER="./dist"

# URL of the ZIP file
URL_ZIP="https://github.com/hack-a-chain-software/bazk/releases/download/bazk-poc/dist.zip"

# Docker command to run
DOCKER_COMMAND="sudo docker run --env .env --rm --device /dev/sgx_enclave --device /dev/sgx_provision -v $(pwd)/dist:/dist -it gramineproject/gramine"

# Checks if the folder exists
if [ -d "$FOLDER" ]; then
    echo "Folder $FOLDER found. Running Docker..."
else
    echo "Folder $FOLDER not found. Downloading and extracting the file..."

    # Downloads the ZIP file
    curl -L -o dist.zip $URL_ZIP

    # Extracts the ZIP file
    unzip dist.zip -d ./

    # Removes the ZIP file after extraction
    rm dist.zip
fi

# Executes the Docker command
$DOCKER_COMMAND
