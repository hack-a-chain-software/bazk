import { ApiPromise, WsProvider } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types';
import { Codec } from '@polkadot/types/types';
import { options, OnChainRegistry, signCertificate, PinkContractPromise, ILooseResult, CertificateData } from '@phala/sdk'
import axios, { AxiosResponse } from 'axios';
import * as base64js from 'base64-js';
import * as fs from 'fs/promises';


// Define the structure of the report you expect to receive
interface IReport {
    report: string;
    signature: string;
    certificate: string;
}

interface IRequest {
    iasUrl?: string;
    iasKey: string;
    userReportData: Buffer;
    timeout?: number;
}

// Constants for default values
const DEFAULT_IAS_URL = 'https://api.trustedservices.intel.com/sgx/dev/attestation/v4/report';
const DEFAULT_TIMEOUT = 10000; // milliseconds

async function createQuote(userReportData: Buffer): Promise<Buffer> {
    await fs.writeFile('/dev/attestation/user_report_data', userReportData);
    const quote: Buffer = await fs.readFile('/dev/attestation/quote');
    return quote;
}

// Main function to get a report from Intel
async function createRemoteAttestationReport({
    userReportData,
    iasKey,
    iasUrl = DEFAULT_IAS_URL,
    timeout = DEFAULT_TIMEOUT
}: IRequest): Promise<IReport> {
    const quote: Buffer = await createQuote(userReportData);
    // Convert quote to Base64
    const encodedQuote = base64js.fromByteArray(quote);
    const encodedJson = JSON.stringify({ isvEnclaveQuote: encodedQuote });
    const client = axios.create({ timeout });

    // Send the request
    const response: AxiosResponse = await client.post(
        iasUrl,
        encodedJson,
        {
            headers: {
                'Connection': 'Close',
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': iasKey,
            },
            transformResponse: (r) => r,
        },
    );

    // Check for non-200 status codes
    if (response.status !== 200) {
        const messages: { [key: number]: string } = {
            401: 'Unauthorized: Failed to authenticate or authorize request.',
            404: 'Not Found: GID does not refer to a valid EPID group ID.',
            500: 'Internal error occurred.',
            503: 'Service is currently not able to process the request (due to a temporary overloading or maintenance). This is a temporary state – the same request can be repeated after some time.',
        };
        const msg = messages[response.status] || 'Unknown error occurred';
        throw new Error(`Bad HTTP status: ${response.status} - ${msg}`);
    }

    if (response.data.length === 0) {
        throw new Error('Empty HTTP response');
    }

    const report: string = response.data;
    const signature: string | undefined = response.headers['x-iasreport-signature'];
    const cert: string | undefined = response.headers['x-iasreport-signing-certificate'];

    if (!signature || !cert) {
        throw new Error('Required response headers for the attestation report are missing');
    }

    // Process the certificate and signature
    const decodedCert: string = decodeURIComponent(cert.replace(/%0A/g, ''));
    const splitCert: string[] = decodedCert.split('-----');
    const certificate: string = (splitCert.length > 2) ? splitCert[2] : '';

    return {
        report,
        signature,
        certificate,
    };
}

class Contract {
    contract: PinkContractPromise;
    pair: KeyringPair;
    cert: CertificateData;

    constructor(contract: PinkContractPromise, pair: KeyringPair, cert: CertificateData) {
        this.contract = contract;
        this.pair = pair;
        this.cert = cert;
    }

    static async connect(config: {
        rpc: string,
        contractId: string,
        pair: KeyringPair,
        abi: string,
    }): Promise<Contract> {
        const { rpc, contractId, pair, abi } = config;
        const api = await ApiPromise.create(
            options({
                provider: new WsProvider(rpc),
                noInitWarn: true,
            })
        )
        const phatRegistry = await OnChainRegistry.create(api)
        const contractKey = await phatRegistry.getContractKeyOrFail(contractId)
        const contract = new PinkContractPromise(api, phatRegistry, JSON.parse(abi), contractId, contractKey)
        const cert = await signCertificate({ pair });
        return new Contract(contract, pair, cert);
    }

    async call(method: string, ...args: any[]): Promise<any> {
        const result = await this.contract.query[method](this.pair.address, { cert: this.cert }, ...args);
        const output = result.output as ILooseResult<ILooseResult<Codec>> | undefined
        if (output?.isOk) {
            return output.asOk;
        } else {
            throw new Error(`Failed to call ${method}: ${result.result}`);
        }
    }
}

const DEFAULT_VALIDATOR_ABI = '{"contract":{"authors":["Kevin Wang <wy721@qq.com>"],"name":"pod_validator","version":"0.1.0"},"source":{"build_info":{"build_mode":"Release","cargo_contract_version":"3.2.0","rust_toolchain":"stable-x86_64-unknown-linux-gnu","wasm_opt_settings":{"keep_debug_symbols":false,"optimization_passes":"Z"}},"compiler":"rustc 1.72.1","hash":"0x7298c937d5a638271892eaa35fda08ee931bcf5b197ff3a8a602e978243443f4","language":"ink! 4.3.0","wasm":""},"spec":{"constructors":[{"args":[],"default":false,"docs":[],"label":"default","payable":false,"returnType":{"displayName":["ink_primitives","ConstructorResult"],"type":4},"selector":"0xed4b9d1b"}],"docs":[],"environment":{"accountId":{"displayName":["AccountId"],"type":0},"balance":{"displayName":["Balance"],"type":16},"blockNumber":{"displayName":["BlockNumber"],"type":19},"chainExtension":{"displayName":["ChainExtension"],"type":20},"hash":{"displayName":["Hash"],"type":17},"maxEventTopics":4,"timestamp":{"displayName":["Timestamp"],"type":18}},"events":[{"args":[{"docs":[],"indexed":false,"label":"mr_enclave","type":{"displayName":[],"type":1}}],"docs":["A new pod mr_enclave is added."],"label":"PodAdded"}],"lang_error":{"displayName":["ink","LangError"],"type":6},"messages":[{"args":[],"default":false,"docs":[" Returns the public key."],"label":"public_key","mutates":false,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":7},"selector":"0x52061d7d"},{"args":[{"label":"pod","type":{"displayName":[],"type":1}}],"default":false,"docs":[],"label":"allow","mutates":true,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":9},"selector":"0xaef3befe"},{"args":[{"label":"report","type":{"displayName":["SignedReport"],"type":12}}],"default":false,"docs":[" Validates the given RA report and signs the inner user_report_data."],"label":"sign","mutates":false,"payable":false,"returnType":{"displayName":["ink","MessageResult"],"type":14},"selector":"0x81ca8fa1"}]},"storage":{"root":{"layout":{"struct":{"fields":[{"layout":{"leaf":{"key":"0x00000000","ty":0}},"name":"owner"},{"layout":{"leaf":{"key":"0x00000000","ty":3}},"name":"allowlist"}],"name":"Validator"}},"root_key":"0x00000000"}},"types":[{"id":0,"type":{"def":{"composite":{"fields":[{"type":1,"typeName":"[u8; 32]"}]}},"path":["ink_primitives","types","AccountId"]}},{"id":1,"type":{"def":{"array":{"len":32,"type":2}}}},{"id":2,"type":{"def":{"primitive":"u8"}}},{"id":3,"type":{"def":{"sequence":{"type":1}}}},{"id":4,"type":{"def":{"variant":{"variants":[{"fields":[{"type":5}],"index":0,"name":"Ok"},{"fields":[{"type":6}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":5},{"name":"E","type":6}],"path":["Result"]}},{"id":5,"type":{"def":{"tuple":[]}}},{"id":6,"type":{"def":{"variant":{"variants":[{"index":1,"name":"CouldNotReadInput"}]}},"path":["ink_primitives","LangError"]}},{"id":7,"type":{"def":{"variant":{"variants":[{"fields":[{"type":8}],"index":0,"name":"Ok"},{"fields":[{"type":6}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":8},{"name":"E","type":6}],"path":["Result"]}},{"id":8,"type":{"def":{"sequence":{"type":2}}}},{"id":9,"type":{"def":{"variant":{"variants":[{"fields":[{"type":10}],"index":0,"name":"Ok"},{"fields":[{"type":6}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":10},{"name":"E","type":6}],"path":["Result"]}},{"id":10,"type":{"def":{"variant":{"variants":[{"fields":[{"type":5}],"index":0,"name":"Ok"},{"fields":[{"type":11}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":5},{"name":"E","type":11}],"path":["Result"]}},{"id":11,"type":{"def":{"variant":{"variants":[{"index":0,"name":"BadOrigin"},{"index":1,"name":"InvalidReport"},{"index":2,"name":"PodNotAllowed"}]}},"path":["pod_validator","pod_validator","Error"]}},{"id":12,"type":{"def":{"composite":{"fields":[{"name":"report","type":13,"typeName":"String"},{"name":"signature","type":13,"typeName":"String"},{"name":"certificate","type":13,"typeName":"String"}]}},"path":["pod_validator","pod_validator","SignedReport"]}},{"id":13,"type":{"def":{"primitive":"str"}}},{"id":14,"type":{"def":{"variant":{"variants":[{"fields":[{"type":15}],"index":0,"name":"Ok"},{"fields":[{"type":6}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":15},{"name":"E","type":6}],"path":["Result"]}},{"id":15,"type":{"def":{"variant":{"variants":[{"fields":[{"type":8}],"index":0,"name":"Ok"},{"fields":[{"type":11}],"index":1,"name":"Err"}]}},"params":[{"name":"T","type":8},{"name":"E","type":11}],"path":["Result"]}},{"id":16,"type":{"def":{"primitive":"u128"}}},{"id":17,"type":{"def":{"composite":{"fields":[{"type":1,"typeName":"[u8; 32]"}]}},"path":["ink_primitives","types","Hash"]}},{"id":18,"type":{"def":{"primitive":"u64"}}},{"id":19,"type":{"def":{"primitive":"u32"}}},{"id":20,"type":{"def":{"variant":{}},"path":["ink_env","types","NoChainExtension"]}}],"version":"4"}'

/// Request a signature from the validator contract.
async function signWithDefaultValidator(report: IReport, config: {
    rpc: string,
    pair: KeyringPair,
    contractId: string,
}): Promise<string> {
    const validatorContract = await Contract.connect({
        rpc: config.rpc,
        contractId: config.contractId,
        pair: config.pair,
        abi: DEFAULT_VALIDATOR_ABI,
    });
    const output = await validatorContract.call('sign', report) as ILooseResult<Codec>;
    if (output?.isOk) {
        return output.asOk.toHex();
    } else {
        throw new Error(`Failed to sign the report: ${output.asErr}`);
    }
}

export { createRemoteAttestationReport, signWithDefaultValidator, DEFAULT_VALIDATOR_ABI, Contract };
