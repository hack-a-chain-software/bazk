import { assign, setup } from 'xstate'
import webSocketConnection from './actors/websocketConnection';
import contractConnection from './actors/contractConnection';

const apiServicetMachineTypes = {} as any;

const apiServicetMachineActors = {
  contractConnection,
  webSocketConnection,
};

const apiServicetMachineActions = {
  //
};

const apiServicetMachineGuards = {
  //
};

export const ApiServicetMachine = setup({
  types: apiServicetMachineTypes,
  guards: apiServicetMachineGuards,
  actors: apiServicetMachineActors,
  actions: apiServicetMachineActions,
}).createMachine({
  context: {
    contract: null,
    connection: null,
    phatRegistry: null,
  },

  initial: 'starting',

  states: {
    starting: {
      initial: 'webSocketConnecting',

      states: {
        webSocketConnecting: {
          invoke: {
            src: 'webSocketConnection',
            id: 'webSocketConnection',

            onDone: {
              target: 'contractConnecting',

              actions: assign({
                connection: ({ event }: any) => event.output.api,
                phatRegistry: ({ event }: any) => event.output.phatRegistry,
              })
            }
          },
        },

        contractConnecting: {
          invoke: {
            id: 'contractConnection',
            src: 'contractConnection',
            input: ({ context }) => ({
              ...context
            }),
            onDone: {
              target: 'finished',
              actions: assign({
                contract: ({ event }: any) => event.output.contract
              })
            },
          }
        },

        finished: {
          type: 'final',
        }
      },

      onDone: 'started'
    },

    started: {
      guards: ({ context }: any) => (
        context.contract
        && context.connection
        && context.phatRegistry
      ),

      initial: 'idl',

      states: {
        idl: {
          on: {
            'finish-connection': {
              target: 'finished'
            }
          }
        },

        finished: {
          type: 'final'
        },
      },

      onDone: 'starting',
    }
  }
})

export default ApiServicetMachine
