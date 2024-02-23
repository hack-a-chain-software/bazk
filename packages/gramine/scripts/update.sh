#!/bin/bash

# Path of the folder to check
FOLDER="./dist"

# GitHub API URL to get the latest release
API_URL="https://api.github.com/repos/hack-a-chain-software/bazk/releases/latest"

# Docker command to run
DOCKER_COMMAND="sudo docker run --env-file .env --rm --device /dev/sgx_enclave --device /dev/sgx_provision -v $(pwd)/dist:/dist -it gramineproject/gramine"

# Function to parse JSON and get the ZIP download URL
get_zip_url() {
    curl -s $API_URL | grep -o '"browser_download_url": "[^"]*' | grep -o '[^"]*$' | grep 'dist.zip'
}

# Function to download and extract ZIP file
update_folder() {
    echo "Downloading and updating folder $FOLDER..."

    # Gets the URL of the ZIP file from the latest release
    URL_ZIP=$(get_zip_url)

    # Check if URL_ZIP is not empty
    if [ -z "$URL_ZIP" ]; then
        echo "Failed to find ZIP URL. Exiting..."
        exit 1
    fi

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
