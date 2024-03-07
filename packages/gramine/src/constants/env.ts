
export const iasApiKey = process.env.IAS_API_KEY || null
export const pinataKey = process.env.PINATA_API_KEY || null
export const mnemonic = process.env.ACCOUNT_MNEMONIC || null;
export const pinataSecret = process.env.PINATA_API_SECRET || null
export const sgxEnabled = process.env.SGX_ENABLED === "true" || false;
export const testMode = process.env.TEST_MODE === "true" || true
