import { Keyring } from '@polkadot/ui-keyring'
import { assign, setup } from "xstate"
import { getAvailableProviders } from "@/utils/providers";
import { mockActor, getAccountsBalance, persistConnection, restoreConnection, requestConnection } from '@/machines/actors';

export const hackaConnectMachineId = 'hacka-connect-machine'

export const hackaConnectMachineTypes = {} as any

const hackaConnectMachineActors = {
  mockActor,
  persistConnection,
  restoreConnection,
  requestConnection,
  getAccountsBalance,
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
    accounts: null,
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
  context: hackaConnectMachineContext,
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
            'load-account-balance': {
              target: 'gettingAccountBalance'
            },
            'sign-out': {
              target: 'signinOut',
            },
            'sign-tx': {
              target: 'signTx'
            },
            'sign-and-send-tx': {
              target: 'signAndSendTx'
            },
            'switch-account': {
              target: 'switchingAccount'
            }
          },
        },
        signTx: {
          invoke: {
            id: 'mock-acotr',
            src: 'mockActor',
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
            id: 'mock-acotr',
            src: 'mockActor',
            input: ({ event }) => ({
              transaction: event.output.transaction
            }),
            onDone: {
              target: 'idle',
            }
          }
        },
        gettingAccountBalance: {
          invoke: {
            src: 'getAccountsBalance',
            id: 'getAccountsBalance',
            input: ({ context, event }) => ({
              api: event.value,
              accounts: context.accounts,
            }),
            onDone: {
              target: 'idle',
              actions: assign({
                accounts: ({ event }) => event.output.updatedAccounts
              })
            }
          },
        },
        switchingAccount: {
          invoke: {
            id: `${hackaConnectMachineId}-persist-connection-actor`,
            src: 'persistConnection',
            input: ({ event, context }) => ({
              account: event.value,
              accounts: context.accounts,
              provider: context.provider
            }),
            onDone: {
              target: 'idle',
              actions: assign({
                account: ({ event }: any) => event.output.account,
                accounts: ({ event }: any) => event.output.accounts,
                provider: ({ event }: any) => event.output.provider,
              })
            }
          }
        },
        signinOut: {
          invoke: {
            id: `${hackaConnectMachineId}-persist-connection-actor`,
            src: 'persistConnection',
            input: () => ({}),
            onDone: {
              target: 'signedOut',
              actions: assign({
                account: null,
                accounts: null,
                provider: null,
              })
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
})

export default HackaConnectMachine
