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
import { PhalaConnect } from './machines/phala-connect/PhalaConnectMachine'

export const PhalaConnectContext = createActorContext(PhalaConnect, {
  // state: JSON.parse(localStorage.getItem('hacka-connect') || 'null')
});

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
