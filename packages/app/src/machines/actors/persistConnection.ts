import localforage from 'localforage';
import { fromPromise } from 'xstate';

export const persistConnection = fromPromise(
  async ({ input }: any) => {
    await localforage.setItem('/bazk-connect', { ...input })

    return input
  }
)

export default persistConnection
