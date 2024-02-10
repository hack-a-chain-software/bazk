import localforage from 'localforage';
import { fromPromise } from 'xstate';

export const persistConnectionActor = fromPromise(
  async ({ input }: any) => {
    await localforage.setItem('/bzk-connect', { ...input })
  }
)
