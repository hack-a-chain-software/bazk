import {
  HashRouter as Router,
  useRoutes,
} from 'react-router-dom'
import routes from '~react-pages'
import Root from '@/components/layout/Root'
import Header from '@/components/layout/Header'
import Container from '@/components/layout/Container'

import { FoundationContextProvider } from './providers/foundation'

export default function BazkApp() {
  const Pages = () => useRoutes(routes);

  return (
    <FoundationContextProvider>
      <Root>
        <Router>
          <Header/>

          <Container>
            <Pages/>
          </Container>
        </Router>
      </Root>
    </FoundationContextProvider>
  )
}
