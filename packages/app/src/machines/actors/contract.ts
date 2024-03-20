import abi from '@/abi.json'
import { fromPromise } from "xstate";
import { PinkContractPromise } from '@phala/sdk';

const BAZK_CONTRACT_ID = '0xeb6ba2385f46ec1904a97b08cee844ed903d336f9d3b2fb405e0651f7f06f85b'

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
