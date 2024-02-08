import { ReactNode } from 'react'
import '@fontsource/inter/latin.css'
import { HackaConnectContext } from '@/App';
import ConnectWalletModal from '../wallet-connect/modal';

const ConnectFlowId = 'hacka-connect-connecting-flow'

export const Root = ({ children }: { children: ReactNode }) => {
  const connectFlowActorRef = HackaConnectContext.useSelector((s) => s.children[ConnectFlowId]);

  const show = HackaConnectContext.useSelector((s) => s.context.showModal)

  console.log('show', show)

  return (
    <div
      className="flex flex-col max-h-full h-full overflow-y-hidden"
    >
      {children}

      {connectFlowActorRef && (
        <ConnectWalletModal
          actor={connectFlowActorRef}
        />
      )}
    </div>
  );
}

export default Root;
