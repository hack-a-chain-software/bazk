import abi from '@/abi.json'
import { fromPromise } from "xstate";
import { PinkContractPromise } from '@phala/sdk';

const BAZK_CONTRACT_ID = '0x8786e9a5497cbedff7c8887d56930faadd29ff14b104fa180a45f4c043948a4c'

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
