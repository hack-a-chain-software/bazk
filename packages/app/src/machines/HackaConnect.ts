import { getAllAcountsForProvider, getAvailableProviders } from "@/utils/providers";
import { fromPromise, assign, setup } from "xstate"
import { Keyring } from '@polkadot/ui-keyring'
import { ProvidersBaseListInterface } from "@/utils/constants";

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
  context: () => ({
    count: 0,
    account: null,
    accounts: null,
    keyring: new Keyring(),
    providers: getAvailableProviders() || [],
  }),
  initial: 'providers',
  states: {
    providers: {
      on: {
        'select.provider': {
          target: 'connecting',
          actions: assign(({ context, event }) => ({
            provider: event.value,
            count: context.count + 2
          }))
        }
      }
    },
    connecting: {
      invoke: {
        src: 'requestConnect',
        input: ({ context }) => ({
          keyring: context.keyring,
          provider: context.providers[0]
        }),
        onDone: {
          target: 'completed',
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
  }),
})

export const HackaConnectMachine = setup({
  types: {} as any,
  actors: {
    connecting: ConnectFlow,
    log: fromPromise(
      async () => {
        await new Promise<void>((resolve) =>
          setTimeout(() => {
              console.log('LOGddddddd');
            resolve();
          }, 1000)
        );
      }
    ),
  }
}).createMachine({
  id: 'hacka-connect',
  context: () => {
    return {
      account: null,
      provider: null,
      showModal: false,
    }
  },
  initial: 'loggedOut',
  states: {
    loggedIn: {
      invoke: {
        src: 'log',
        id: 'connected-log',
        onDone: 'loggedOut'
      }
    },
    loggedOut: {
      on: {
        closeModal: {
          actions: assign({
            showModal: false
          })
        },
        openModal: {
          target: 'connecting',
          actions: assign({
            showModal: true
          })
        },
      }
    },
    connecting: {
      invoke: {
        id:'hacka-connect-connecting-flow',
        src: 'connecting',
        onDone: {
          target: 'loggedIn',
          actions: assign({
            showModal: false,
          })
        },
      }
    },
    disconnect: {
      on: {
        //
      }
    },
  },
})
