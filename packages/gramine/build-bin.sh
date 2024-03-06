# Use ubuntu 20.04 for building, otherwise the binary will not work on gramine image

# Path of the folder to check
FOLDER="./dist"

# GitHub API URL to get the latest release
API_URL="https://api.github.com/repos/hack-a-chain-software/phase2-bn254/releases/latest"

get_zip_url() {
    curl -s $API_URL | grep -o '"browser_download_url": "[^"]*' | grep -o '[^"]*$' | grep 'dist.zip'
}

# Gets the URL of the ZIP file from the latest release
URL_ZIP=$(get_zip_url)

# Check if URL_ZIP is not empty
if [ -z "$URL_ZIP" ]; then
    echo "Failed to find ZIP URL. Exiting..."
    exit 1
fi

# Downloads the ZIP file
curl -L -o dist.zip $URL_ZIP

# Extracts the ZIP file
unzip dist.zip -d ./

# Removes the ZIP file after extraction
rm dist.zip
