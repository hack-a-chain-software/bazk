#!/bin/bash

# Path of the folder to check
FOLDER="./dist"

# URL of the ZIP file
URL_ZIP="https://github.com/hack-a-chain-software/bazk/releases/download/bazk-poc/dist.zip"

# Docker command to run
DOCKER_COMMAND="sudo docker run --env .env --rm --device /dev/sgx_enclave --device /dev/sgx_provision -v $(pwd)/dist:/dist -it gramineproject/gramine"

# Function to download and extract ZIP file
update_folder() {
    echo "Downloading and updating folder $FOLDER..."

    # Downloads the ZIP file
    curl -L -o dist.zip $URL_ZIP

    # Removes the existing folder if it exists
    [ -d "$FOLDER" ] && rm -rf "$FOLDER"

    # Extracts the ZIP file
    unzip dist.zip -d ./

    # Removes the ZIP file after extraction
    rm dist.zip
}

# Always update the folder with the latest version
update_folder

# Executes the Docker command
$DOCKER_COMMAND
