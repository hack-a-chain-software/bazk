import { assign, setup } from "xstate";
import { mockActor, loadCeremony } from "./actors";

const ceremonyTypes = {} as any

const ceremonyActors = {
  mockActor,
  loadCeremony,
}

const ceremonyContext = {
  ceremony: null,
}

export const CeremonyMachine = setup({
  types: ceremonyTypes,
  actors: ceremonyActors,
}).createMachine({
  initial: 'idle',

  id: 'ceremony-machine',

  context: ceremonyContext,

  states: {
    sleeping: {
      on: {
        'fetch-ceremony': 'fetching'
      }
    },

    fetching: {
      invoke: {
        id: 'load-ceremony',
        src: 'loadCeremony',
        input: ({ event }) => ({
          api: event.value.api,
          ceremonyId: event.value.ceremonyId
        }),
        onDone: {
          target: 'fetched',

          actions: assign({
            ceremony: ({ event }) => event.output.ceremony
          })
        }
      }
    },

    fetched: {
      states: {
        idle: {
          on: {
            'create-contribution': 'contributing',
          }
        },

        contributing: {
          invoke: {
            src: 'mockActor',
            id: 'create-contribution',
            onDone: {
              target: 'idle',
            }
          }
        },
      },
    },
  }
})

export default CeremonyMachine
