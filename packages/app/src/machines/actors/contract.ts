import abi from '@/abi.json'
import { fromPromise } from "xstate";
import { PinkContractPromise } from '@phala/sdk';

const BAZK_CONTRACT_ID = '0x43b5e1432806aad3b30873924021168ea9be88926cf09049fa82acce786974d2'

export const contractConnection = fromPromise(
  async ({ input }: any) => {
    const { connection, phatRegistry } = input

    const contractKey = await phatRegistry.getContractKeyOrFail(BAZK_CONTRACT_ID)

    const contract = new PinkContractPromise(connection, phatRegistry, abi, BAZK_CONTRACT_ID, contractKey)

    return {
      contract,
    }
  }
)

export default contractConnection
