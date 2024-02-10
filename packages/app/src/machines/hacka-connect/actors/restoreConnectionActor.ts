import localforage from 'localforage';
import { fromPromise } from 'xstate';

export const restoreConnectionActor = fromPromise(
  async () => {
    const cache = await localforage.getItem('/bzk-connect')

    if (!cache || JSON.stringify(cache) === '{}') {
      return {
        value: cache,
        success: false,
      }
    }

    return {
      value: cache,
      success: true,
    }
  }
)
