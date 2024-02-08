import {
  HashRouter as Router,
  useRoutes,
} from 'react-router-dom'
import routes from '~react-pages'
import Root from '@/components/layout/Root'
import Header from '@/components/layout/Header'
import Container from '@/components/layout/Container'

import { FoundationContextProvider } from './providers/foundation'
import { createActorContext } from '@xstate/react'
import { HackaConnectMachine } from './machines/HackaConnect'

export const HackaConnectContext = createActorContext(HackaConnectMachine, {
  // state: JSON.parse(localStorage.getItem('todos') || 'null')
});

export default function BazkApp() {
  const Pages = () => useRoutes(routes);

  return (
    <HackaConnectContext.Provider>
      <FoundationContextProvider>
        <Root>
          <Router>
            <Header/>

            <Container>
              <Pages/>
            </Container>
          </Router>
        </Root>x
      </FoundationContextProvider>
    </HackaConnectContext.Provider>
  )
}
