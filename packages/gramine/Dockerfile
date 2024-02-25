FROM ubuntu:22.04 as build

# Install dependencies
RUN apt-get update && \
    apt-get install -y build-essential curl git wget apt-transport-https ca-certificates software-properties-common && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - && \
    add-apt-repository -y "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Rust and Cargo
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain 1.51.0 && \
    . $HOME/.cargo/env

ENV PATH="/root/.cargo/bin:${PATH}"

# Install Node.js and Yarn
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn

RUN git clone --recursive https://github.com/hack-a-chain-software/phase2-bn254.git ./phase2-bn254

# Copy gramine files into the container
COPY . /gramine
WORKDIR /gramine

# Update permissions
RUN chmod +x ./bazk-build/*
RUN chmod +x ./build.sh
RUN chmod +x ./build-bin.sh

RUN yarn install

RUN npx webpack --config webpack.config.js

RUN mkdir -p ./dist/ceremonies

COPY ./ceremonies ./dist/ceremonies

WORKDIR /phase2-bn254/powersoftau

# Executa os comandos de construção do Rust
RUN cargo build --release --bin new_constrained && \
    cargo build --release --bin compute_constrained && \
    cargo build --release --bin verify_transform_constrained && \
    cargo build --release --bin beacon_constrained && \
    cargo build --release --bin prepare_phase2

# # Copia os binários construídos para o local especificado
RUN mkdir -p /gramine/dist/bin/ && \
    cp target/release/new_constrained /gramine/dist/bin/new_constrained && \
    cp target/release/compute_constrained /gramine/dist/bin/compute_constrained && \
    cp target/release/verify_transform_constrained /gramine/dist/bin/verify_transform_constrained && \
    cp target/release/beacon_constrained /gramine/dist/bin/beacon_constrained && \
    cp target/release/prepare_phase2 /gramine/dist/bin/prepare_phase2

# Altera o diretório de trabalho para a próxima fase
WORKDIR /phase2-bn254/phase2

# Constrói os próximos binários
RUN cargo build --release --bin new && \
    cargo build --release --bin contribute && \
    cargo build --release --bin verify_contribution

# Copia os novos binários construídos
RUN cp target/release/new /gramine/dist/bin/new && \
    cp target/release/contribute /gramine/dist/bin/contribute && \
    cp target/release/verify_contribution /gramine/dist/bin/verify_contribution

WORKDIR /gramine

RUN (cd bazk-build && rm -f *.manifest *.sgx *.sig && rm -rf cruntime app dist)

WORKDIR /gramine

RUN mkdir -p ./bazk-build/app/

RUN cp -r ./dist/* bazk-build/app/

RUN cp $(which curl) ./bazk-build/curl

# RUN sudo docker run \
#     -u $(id -u ${USER}):$(id -g ${USER}) \
#     --rm \
#     -v $(pwd)/bazk-build:/bazk-build \
#     --env IAS_SPID=$IAS_SPID \
#     kvin/gramine:1.0 \
#     "make dist -C /bazk-build"

# Set the output directory as a volume
VOLUME /gramine/bazk-build

# Command to keep the container running if needed
# This line can be adjusted or removed depending on how you plan to use the container
CMD ["tail", "-f", "/dev/null"]
