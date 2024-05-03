import abi from '@/abi.json'
import { fromPromise } from "xstate";
import { PinkContractPromise } from '@phala/sdk';

const BAZK_CONTRACT_ID = '0x8113a143dc2b8d5e7b2ea82f2741c35228052360bb1a4deb3a57467fa76918ee'

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
