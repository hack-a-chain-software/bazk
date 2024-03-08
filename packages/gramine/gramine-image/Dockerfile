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
    ca-certificates
