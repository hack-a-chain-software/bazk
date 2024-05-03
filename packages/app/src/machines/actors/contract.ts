import abi from '@/abi.json'
import { fromPromise } from "xstate";
import { PinkContractPromise } from '@phala/sdk';

const BAZK_CONTRACT_ID = '0xec0fdb16780cc905dbf8091eaff8d4a6341b5ae8c6353a0c1f88ef29c63673f0'

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
