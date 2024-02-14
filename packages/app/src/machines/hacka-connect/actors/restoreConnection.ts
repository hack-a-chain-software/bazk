import localforage from 'localforage';
import { fromPromise } from 'xstate';

export const restoreConnectionActor = fromPromise(
  async () => {
    const cache = await localforage.getItem('/bazk-connect') as any

    if (!cache || JSON.stringify(cache) === '{}' || !cache?.account || !cache?.provider) {
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

export default restoreConnectionActor
