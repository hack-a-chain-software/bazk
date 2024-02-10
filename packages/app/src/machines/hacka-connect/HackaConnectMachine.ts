import { Keyring } from '@polkadot/ui-keyring'
import { assign, setup } from "xstate"
import { getAvailableProviders } from "@/utils/providers";
import { persistConnectionActor } from './actors/persistConnectionActor';
import { restoreConnectionActor } from './actors/restoreConnectionActor';
import { requestConnectionActor } from './actors/requestConnectionActor';

export const hackaConnectMachineId = 'hacka-connect-machine'

export const hackaConnectMachineTypes = {} as any

const hackaConnectMachineActors = {
  persistConnection: persistConnectionActor,
  restoreConnection: restoreConnectionActor,
  requestConnection: requestConnectionActor,
}

const hackaConnectMachineContext = () => {
  const keyring = new Keyring()

  try {
    keyring.loadAll({ isDevelopment: false })
  } catch (e) {
    console.warn(e)
  }

  return {
    keyring,
    account: null,
    provider: null,
    showModal: false,
    providers: getAvailableProviders() || [],
  }
}

export const HackaConnectMachine = setup({
  types: hackaConnectMachineTypes,
  actors: hackaConnectMachineActors,
}).createMachine({
  initial: 'restore',
  id: hackaConnectMachineId,
  states: {
    restore: {
      invoke: {
        id: `${hackaConnectMachineId}-restore-connection-actor`,
        src: 'restoreConnection',
        onDone: [
          {
            guard: ({ event }: any) => !!event.output.success,
            target: 'signedIn',
            actions: [
              assign({
                account: ({ event }: any) => event.output.value.account,
                accounts: ({ event }: any) => event.output.value.accounts,
                provider: ({ event }: any) => event.output.value.provider,
              }),
            ]
          },
          {
            target: "signedOut",
          },
        ],
        onError: {
          target: 'signedOut',
        }
      }
    },
    signedIn: {
      guard: ({ context }: any) => context.account && context.provider,
      initial: "idle",
      states: {
        idle: {
          on: {
            'sign-out': {
              target: 'signinOut',
            },
            'sign-tx': {
              target: 'signTx'
            },
            'sign-and-send-tx': {
              target: 'signAndSendTx'
            },
          },
        },
        signTx: {
          invoke: {
            id: '',
            src: 'persistConnection',
            input: ({ event }) => ({
              transaction: event.output.transaction
            }),
            onDone: {
              target: 'idle',
            }
          }
        },
        signAndSendTx: {
          invoke: {
            id: '',
            src: 'persistConnection',
            input: ({ event }) => ({
              transaction: event.output.transaction
            }),
            onDone: {
              target: 'idle',
            }
          }
        },
        signinOut: {
          invoke: {
            id: '',
            src: 'persistConnection',
            onDone: {
              target: 'signedOut',
            },
            onError: {
              target: 'idle',
            }
          }
        },
        signedOut: {
          type: 'final',
        }
      },
      onDone: {
        target: 'signedOut',
      }
    },
    signedOut: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            'sign-in': {
              target: 'signingIn',
              actions: assign({
                provider: ({ event }) => event.value
              })
            },
            'open-modal': {
              actions: assign({
                showModal: true,
              })
            },
            'close-modal': {
              actions: assign({
                showModal: false,
                provider: null
              })
            }
          }
        },
        signingIn: {
          invoke: {
            src: 'requestConnection',
            id: `${hackaConnectMachineId}-signing-actor`,
            input: ({ event, context }) => ({
              provider: event.value,
              keyring: context.keyring,
            }),
            onDone: {
              target: 'persist',
              actions: assign({
                accounts: ({ event }: any) => event.output.accounts,
                provider: ({ event }: any) => event.output.provider,
                account: ({ event }: any) => event.output.accounts[0],
              }),
            },
            onError: {
              target: 'idle',
              actions: [
                assign({
                  provider: null
                }),
              ]
            }
          },
        },
        persist: {
          invoke: {
            id: `${hackaConnectMachineId}-persist-connection-actor`,
            src: 'persistConnection',
            input: ({ context }: any) => ({
              provider: context.provider,
              accounts: context.accounts,
              account: context.accounts[0],
            }),
            onDone: {
              target: 'signedOn',
              actions: assign({
                showModal: false,
              })
            }
          }
        },
        signedOn: {
          type: 'final'
        }
      },
      onDone: {
        target: 'signedIn'
      }
    },
  },
  context: hackaConnectMachineContext,
})

export default HackaConnectMachine
