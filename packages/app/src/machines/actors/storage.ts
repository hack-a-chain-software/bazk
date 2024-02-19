import { fromPromise } from 'xstate';

export const persistConnection = fromPromise(
  async ({ input }: any) => {
    await localStorage.setItem('/bazk-connect', JSON.stringify(input))

    return input
  }
)

export const restoreConnection = fromPromise(
  async () => {
    const cache = JSON.parse(await localStorage.getItem('/bazk-connect') ?? '') as any

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
