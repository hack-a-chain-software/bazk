import Modal from '../Modal';
import { twMerge } from 'tailwind-merge';
import { PhalaConnectContext } from '@/App';
import ChevronIcon from '@/components/icons/Chevron'
import DownloadIcon from '@/components/icons/Download'
import SpinnerIcon from '@/components/icons/Spinner';

export const WalletConnectModal = () => {
  const phalaConnectActorRef = PhalaConnectContext.useActorRef()

  const showModal = PhalaConnectContext.useSelector((state) => state.context.showModal)
  const providers = PhalaConnectContext.useSelector((state) => state.context.providers)
  const signinProvider = PhalaConnectContext.useSelector((state) => state.context.provider)
  const isSigningIn = PhalaConnectContext.useSelector((state: any) => state.matches('signedOut.signingIn'))

  return (
    <Modal
      isOpen={showModal}
      onClose={() => phalaConnectActorRef.send({ type: 'cancel' })}
      rootClass="max-w-[520px]"
    >
      <div>
        <div
          className="flex flex-col gap-3"
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
              text-[#1E293B]
              leading-[140%]
            "
          >
            Select your wallet
          </span>
        </div>

        <div
          className="pt-6 flex items-center gap-3 md:gap-4 flex-col"
        >
          {providers && providers.map((provider: any) => (
            <button
              key={provider.key}
              className={
                twMerge(
                  'p-4 border border-[#CBD5E1] rounded-lg w-full flex items-center justify-between',
                  'hover:bg-[#F1F5F9]',
                )
              }
              onClick={() => phalaConnectActorRef?.send({ type: 'sign-in', value: provider })}
            >
              <div
                className="flex items-center gap-3"
              >
                <div>
                  <img src={provider.icon} className="w-9 h-9" />
                </div>

                <span
                  className=""
                >
                  {provider.name}
                </span>
              </div>

              <div>
                {provider?.installed && !isSigningIn && signinProvider?.key !== provider.key && (
                  <ChevronIcon
                    className="rotate-180 text-[#64748B] min-w-6 min-h-6"
                  />
                )}

                {!provider.installed && (
                  <DownloadIcon
                    className="text-white min-w-6 min-h-6"
                  />
                )}

                {provider && isSigningIn && signinProvider.key === provider.key && (
                  <SpinnerIcon />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default WalletConnectModal
