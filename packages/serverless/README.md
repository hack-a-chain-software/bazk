# Serverless
==========

The serverless package is responsible for mediating the communication between the front-end and the backend and executing the commands sent. It manages and ensures that only one command is executed at a time.

## Installation
Serverless is powered by [**Cloudflare Workers**](https://developers.cloudflare.com/workers/get-started/guide/).

-----------------

#### Steps
1) Clone the repository:
```bash
$ gh repo clone hack-a-chain-software/bazk
$ cd bazk
```

2) Check all packages and copy the .env.example file and edit it with your environment config:
```bash
$ cp ./packages/serverless/.env.example ./packages/serverless/.env
```

3) Install frontend dependencies via PNPM
```bash
$ yarn install
```

When working on frontend, run `yarn serverless dev`.
