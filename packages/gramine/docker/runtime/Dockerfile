FROM gramineproject/gramine:latest

ARG DEBIAN_FRONTEND=noninteractive

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
