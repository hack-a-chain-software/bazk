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
import { HackaConnectMachine } from './machines/HackaConnectMachine'
import ApiServicetMachine from './machines/ApiServiceMachine'

export const PhalaConnectContext = createActorContext(HackaConnectMachine);

export const ApiServiceContext = createActorContext(ApiServicetMachine);

export default function BazkApp() {
  const Pages = () => useRoutes(routes);

  return (
    <ApiServiceContext.Provider>
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
    </ApiServiceContext.Provider>
  )
}
