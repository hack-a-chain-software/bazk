export type EventType = 'verify' | 'new' | 'contribute'

export const commandMap = {
  new: {
    name: '',
    path: './app/bin/new',
    resolve: (args: any) => {}
  },
  verify: {
    name: '',
    path:  './app/bin/verify_contribution',
    resolve: (args: any) => {}
  },
  contribute: {
    name: '',
    path: './app/bin/contribute',
    resolve: (args: any) => {},
  },
}

export const getCommandByEvent = (event: EventType) => commandMap[event]
