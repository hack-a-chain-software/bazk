FROM gramineproject/gramine:v1.5 as builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gnupg \
    curl \
    gcc \
    make \
    rsync \
    lsb-release \
    ca-certificates \
    jq \
    wget \
    unzip

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

RUN mkdir -p ./core/app

COPY ./ceremonies ./core/app/ceremonies

RUN PACKAGE=$(curl -s "https://api.github.com/repos/hack-a-chain-software/phase2-bn254/releases/latest" | grep -o '"browser_download_url": "[^"]*' | grep -o '[^"]*$' | grep 'dist.zip') \
    && echo "Downloading file: ${PACKAGE}" \
    && wget "${PACKAGE}" \
    && unzip dist.zip \
    && mv dist/bin /core/app/bin \
    && rm -rf *.zip dist

RUN cp $(which curl) ./core/curl
RUN cp $(which node) ./core/node

COPY ./scripts/build.sh /build.sh
RUN chmod +x /build.sh

ENTRYPOINT ["/build.sh"]
