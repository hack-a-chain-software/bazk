import { Keyring } from '@polkadot/ui-keyring'
import { fromPromise, assign, setup } from "xstate"
import { getAllAcountsForProvider } from "@/utils/providers";
import { ProvidersBaseListInterface } from "@/utils/constants";

export interface ConnectFlowInterface {}

export type ProviderContextType = any

export const ConnectFlow = setup({
  types: {} as any,
  actors: {
    requestConnect: fromPromise(
      async ({ input }: { input: { provider: ProvidersBaseListInterface, keyring: Keyring } }) => {
        return await getAllAcountsForProvider(input.provider, input.keyring)
      }
    )
  },
}).createMachine({
  context: ({ input }) => {
    return {
      keyring: null,
      account: null,
      accounts: null,
      provider: null,
      ...(input || {})
    }
  },
  initial: 'providers',
  states: {
    providers: {
      on: {
        'select.provider': {
          target: 'connecting',
          actions: assign(({ event }) => ({
            provider: event.value,
          }))
        },
      }
    },
    connecting: {
      invoke: {
        src: 'requestConnect',
        input: ({ event, context }) => ({
          provider: event.value,
          keyring: context.keyring,
        }),
        onDone: {
          target: 'accounts',
          actions: assign({
            accounts: ({ event }) => event.output
          }),
        },
      }
    },
    accounts: {
      on: {
        'selectAccount': {
          target: 'completed',
          actions: assign({
            account: ({ event }) => event.value
          }),
        },
      }
    },
    completed: {
      type: 'final',
    },
  },
  output: ({ context }) => ({
    ...context,
  })
})
