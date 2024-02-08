import { PhalaConnectContext } from '@/App';
import { useActorRef, useSelector } from '@xstate/react';
import Modal from '../Modal';
import { ConnectFlow } from '@/machines/phala-connect/flows/ConnectFlowMachine';

const ConnectFlowId = 'hacka-connect-connecting-flow'

export const WalletConnectModal = () => {
  const fallbackActor = useActorRef(ConnectFlow)

  const phalaConnectActorRef = PhalaConnectContext.useActorRef()

  const showModal = PhalaConnectContext.useSelector((state) => state.context.showModal)
  const providers = PhalaConnectContext.useSelector((state) => state.context.providers)

  const ConnectFlowActorRef = PhalaConnectContext.useSelector((state) => state.children[ConnectFlowId])

  const accounts = useSelector(ConnectFlowActorRef || fallbackActor, (state: any) => state.context.accounts)
  const isAccounts = useSelector(ConnectFlowActorRef || fallbackActor, (s: any) => s.matches('accounts'))

  return (
    <Modal
      isOpen={showModal}
      onClose={() => phalaConnectActorRef.send({ type: 'cancel' })}
      rootClass="max-w-[520px]"
    >
      {!isAccounts && (
        <div>
          <div
            className="flex flex-col gap-2"
          >
            <span
              className="
                text-[22px]
                text-[#1E293B]
                font-semibold
                leading-[30.8px]
              "
            >
              Connect Wallet
            </span>

            <span
              className="
                text-[#475569]
                leading-[22.4px]
              "
            >
              Select your wallet
            </span>
          </div>

          <div
            className="pt-[32px] md:pt-10 flex items-center gap-3 md:gap-4"
          >
            {providers && providers.map((provider: any) => {
              return (
                <button
                  key={provider.key}
                  onClick={() => ConnectFlowActorRef?.send({ type: 'select.provider', value: provider })}
                  className="text-black"
                >
                  {provider.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {isAccounts && (
        <div>
          <div
            className="pt-4 md:pt-6 flex flex-col gap-2"
          >
            <span
              className="
                text-[22px]
                text-[#1E293B]
                font-semibold
                leading-[30.8px]
              "
            >
              Connect Wallet
            </span>

            <span
              className="
                text-[#475569]
                leading-[22.4px]
              "
            >
              Select your account
            </span>
          </div>

          <div
            className="pt-[32px] md:pt-10 flex items-center gap-3 md:gap-4"
          >
            {accounts && accounts.map((account: any) => {
              return (
                <button
                  key={account.address}
                  onClick={() => ConnectFlowActorRef?.send({ type: 'selectAccount', value: account })}
                  className="text-black"
                >
                  {account.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </Modal>
  )
}

export default WalletConnectModal
