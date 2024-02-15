import { ReactNode } from 'react'
import '@fontsource/inter/latin.css'
import ConnectWalletModal from '../wallet-connect/WalletConnectModal';

export const Root = ({ children }: { children: ReactNode }) => {
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
