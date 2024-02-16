import { ReactNode, useEffect } from 'react'
import '@fontsource/inter/latin.css'
import ConnectWalletModal from '../wallet-connect/WalletConnectModal';
import { ApiServiceContext, PhalaConnectContext } from '@/App';

export const Root = ({ children }: { children: ReactNode }) => {
  const HackaConnectActorRef = PhalaConnectContext.useActorRef()

  const connection = ApiServiceContext.useSelector((state) => state.context.connection)
  const isSignedIn = PhalaConnectContext.useSelector((state) => state.matches('signedIn'))

  useEffect(() => {
    if (!connection || !isSignedIn) {
      return
    }

    HackaConnectActorRef.send({ type: 'load-account-balance', value: connection })
  }, [connection, HackaConnectActorRef, isSignedIn])
  return (
    <div
      className="flex flex-col max-h-full h-full overflow-y-hidden"
    >
      {children}

      <ConnectWalletModal />
    </div>
  );
}

export default Root;
