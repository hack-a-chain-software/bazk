import abi from '@/abi.json'
import { fromPromise } from "xstate";
import { PinkContractPromise } from '@phala/sdk';

const BAZK_CONTRACT_ID = '0xd72ac19567088e35a446e0dacdfadc5f266ea68d2481401d9e6b374310fac3de'

export const contractConnection = fromPromise(
  async ({ input }: any) => {
    const address = import.meta.env.VITE_CONTRACT_ID || BAZK_CONTRACT_ID

    const { connection, phatRegistry } = input

    const contractKey = await phatRegistry.getContractKeyOrFail(address)

    const contract = new PinkContractPromise(connection, phatRegistry, abi, address, contractKey)

    return {
      contract,
    }
  }
)

export default contractConnection
