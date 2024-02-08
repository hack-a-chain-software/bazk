import { HackaConnectContext } from '@/App';
import { ConnectFlow } from '@/machines/HackaConnect';
import { useActorRef, useActor, useSelector, useMachine } from '@xstate/react';
import { useCallback, useEffect } from 'react';
import Modal from '../Modal';

export const WalletConnectModal = ({ actor }: any) => {
  const hackaConnectActorRef = HackaConnectContext.useActorRef()

  const show = useSelector(hackaConnectActorRef, (s) => s.context.showModal)

  console.log('show', show)

  // const context = useSelector(ConnectFlowActorRef, (s) => s.context.count)

  // console.log('test', test)
  // console.log('test id', test?.sessionId)
  // console.log('ConnectFlowActorRef', ConnectFlowActorRef.sessionId)

  const count = useSelector(actor, (s: any) => s.context.count)
  const providers = useSelector(actor, (s) => s.context.providers)


  // console.log('providers', ConnectFlowActorRef)

  // const sendLocal = (provider: any) => {
  //   ConnectFlowActorRef?.send({ type: 'select.provider', value: provider })
  // }

  return (
    <Modal
      isOpen={show}
      onClose={() => hackaConnectActorRef.send({ type: 'closeModal' })}
      rootClass="max-w-[520px]"
    >
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
          Start a contribution
        </span>

        <span
          className="
            text-[#475569]
            leading-[22.4px]
          "
        >
          To start a contribution, choose the method you want it to be done.
        </span>
      </div>

      <div
        className="pt-[32px] md:pt-10 flex items-center gap-3 md:gap-4"
      >
        {providers && providers.map((provider: any) => {
          return (
            <button
              key={provider.key}
              onClick={() => actor.send({ type: 'select.provider', value: provider })}
              className="text-black"
            >
              {provider.name}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

export default WalletConnectModal
