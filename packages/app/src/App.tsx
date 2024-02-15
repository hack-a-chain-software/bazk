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
import { HackaConnectMachine } from './machines/hacka-connect/HackaConnectMachine'

export const PhalaConnectContext = createActorContext(HackaConnectMachine);

export default function BazkApp() {
  const Pages = () => useRoutes(routes);

  return (
    <PhalaConnectContext.Provider>
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
    </PhalaConnectContext.Provider>
  )
}
