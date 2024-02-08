import { Keyring } from '@polkadot/ui-keyring'
import { fromPromise, assign, setup } from "xstate"
import { ConnectFlow } from "./flows/ConnectFlowMachine";
import { getAvailableProviders } from "@/utils/providers";
import localforage from 'localforage';

export const ConnectFlowId = ''

export const PhalaConnect = setup({
  types: {} as any,
  actors: {
    connecting: ConnectFlow,
    persistActor: fromPromise(
      async ({ input }) => {
        await localforage.setItem('/bzk-connect', { ...input })
      }
    ),
    restoreActor: fromPromise(
      async () => {
        const cached = await localforage.getItem('/bzk-connect')

        console.log('cached', cached)

        if (!cached || JSON.stringify(cached) === '{}') {
          throw new Error('not logged')
        }

        return cached
      }
    ),
    log: fromPromise(
      async ({ input }) => {
        await new Promise<void>((resolve) =>
          setTimeout(() => {
              console.log('loggedIn', input);
            resolve();
          }, 1000)
        );
      }
    ),
  },
}).createMachine({
  id: 'hacka-connect',
  context: () => {
    const keyring = new Keyring()

    try {
      keyring.loadAll({ isDevelopment: false })
    } catch (e) {
      console.warn(e)
    }

    return {
      keyring,
      account: null,
      loading: true,
      provider: null,
      showModal: false,
      providers: getAvailableProviders() || [],
    }
  },
  initial: 'restore',
  states: {
    loggedIn: {
      on: {
        sign: {
          //
        },
        signAndSend: {
          //
        },
      },
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
    restore: {
      invoke: {
        id: 'phala-connect-restore',
        src: 'restoreActor',
        onDone: {
          target: 'loggedIn',
          actions: assign({
            loading: false,
            account: ({ event }: any) => event.output.account,
            provider: ({ event }: any) => event.output.provider,
          })
        },
        onError: {
          target: 'loggedOut',
          actions: assign({
            loading: false,
          })
        }
      }
    },
    persist: {
      invoke: {
        id:'phala-connect-persist',
        src: 'persistActor',
        input: ({ context }: any) => ({
          account: context.account,
          provider: context.provider
        }),
        onDone: {
          target: 'loggedIn',
        },
        onError: {
          target: 'loggedOut'
        }
      }
    },
    connecting: {
      invoke: {
        id:'hacka-connect-connecting-flow',
        src: 'connecting',
        input: ({ context }: any) => ({
          keyring: context.keyring,
        }),
        onDone: {
          target: 'persist',
          actions: assign({
            showModal: false,
            account: ({ event }: any) => event.output.account,
            accounts: ({ event }: any) => event.output.accounts,
            provider: ({ event }: any) => event.output.provider,
          })
        },
      },
      on: {
        cancel: {
          target: 'loggedOut',
          actions: assign({
            showModal: false
          })
        }
      }
    },
    disconnect: {
      on: {
        //
      }
    },
  },
})

export default PhalaConnect
