import { assign, setup } from 'xstate'
import { persistConnectionActor } from './hacka-connect/actors/persistConnection';

const foundationMachineTypes = {} as any;

const foundationMachineActors = {
  'startFoundation': persistConnectionActor
};

const foundationMachineActions = {};

const foundationMachineGuards = {};

export const FoundationMachine = setup({
  types: foundationMachineTypes,
  guards: foundationMachineGuards,
  actors: foundationMachineActors,
  actions: foundationMachineActions,
}).createMachine({
  context: {
    api: null,
  },
  initial: 'starting',

  states: {
    starting: {
      invoke: {
        id: '',
        src: 'startFoundation',
        onDone: {
          target: 'started',
          actions: assign({
            api: ({ event }: any) => event.output.value
          })
        },
        onError: {
          // TODO
        }
      }
    },
    started: {
      //
    },
  }
})
