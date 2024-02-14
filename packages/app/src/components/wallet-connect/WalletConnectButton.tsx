import { PhalaConnectContext } from "@/App"
import { twMerge } from "tailwind-merge"
import { Popover, Transition } from '@headlessui/react'
import ChevronIcon from '@/components/icons/Chevron'
import { Fragment } from "react"
import { shortenHash } from "@/utils/string"
import Logout from "../icons/Logout"

export const ConnectWalletButton = () => {
  const PhalaConnectActorRef = PhalaConnectContext.useActorRef()

  const accounts = PhalaConnectContext.useSelector((state) => state.context.accounts)
  const provider = PhalaConnectContext.useSelector((state) => state.context.provider)
  const selectedAccount = PhalaConnectContext.useSelector((state) => state.context.account)

  const isSignedOut = PhalaConnectContext.useSelector((state) => state.matches('signedOut'))

  if (isSignedOut || !provider || !selectedAccount) {
    return (
      <>
        <button
          onClick={() => PhalaConnectActorRef.send({ type: 'open-modal' })}
          className={twMerge(
            'bg-[#1B233B]',
            'py-2 px-4 rounded-lg border border-[#12D97C] bg-[#1B233B] hover:bg-[#1A4748]',
          )}
        >
          <div
            className="flex items-center justify-center gap-2"
          >

            <span
              className="text-white font-medium leading-[140%]"
            >
              connect wallet
            </span>

            <div
              className="w-6 h-6 relative overflow-hidden"
            >
              <div
                className="relative flex items-center justify-start -left-6 group-hover:translate-x-6 duration-200 ease-in-out transition"
              >
                <ChevronIcon
                  className="rotate-180 text-white min-w-6 min-h-6"
                />

                <ChevronIcon
                  className="rotate-180 text-white min-w-6 min-h-6"
                />
              </div>
            </div>
          </div>
        </button>
      </>
    )
  }

  return (
    <Popover className="relative outline-none">
      <Popover.Button
        className={twMerge(
          'group bg-[#1A4748]',
          'outline-none',
          'py-2 px-4 rounded-lg border border-[#12D97C] bg-[#1B233B] hover:bg-[#1A4748]',
        )}
      >
        <div
          className="flex items-center justify-center gap-2"
        >
          <img src={provider?.icon} className="w-7 h-7" />

          <span
            className="text-white font-medium leading-[140%]"
          >
            {selectedAccount?.name ?? ''}
          </span>

          <div
            className="w-6 h-6 relative overflow-hidden"
          >
            <ChevronIcon
              className="-rotate-90 text-white min-w-6 min-h-6"
            />
          </div>
        </div>
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel
          className="
            right-0
            absolute z-10 mt-6
            bg-white p-4
            gap-4
            flex flex-col
            rounded-lg
            w-[380px]
          "
        >
          <div
            className="flex justify-between items-center"
          >
            <div>
              <span
                className="text-[#1E293B] leading-[140%] font-medium text-[16px]"
              >
                Manage your account
              </span>
            </div>

            <div>
              <button
                onClick={() => PhalaConnectActorRef.send({ type: 'sign-out' })}
                className="flex items-center gap-2 hover:opacity-[.9]"
              >
                <span
                  className="text-sm text-[#B02A37] font-medium"
                >
                  Logout
                </span>

                <Logout
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          <div
            className="flex flex-col gap-3"
          >
            {accounts && accounts.map((account: any) => (
              <button
                key={account.address}
                onClick={() => PhalaConnectActorRef.send({ type: 'switch-account', value: account })}
                className={
                  twMerge(
                    'w-full p-4 rounded-lg border border-[#CBD5E1] h-[52px] flex items-center justify-between hover:bg-[#F1F5F9]',
                    account.address === selectedAccount.address && 'border-[#12D97C] hover:bg-[#D0F7E5] bg-[#F3FDF8]'
                  )
                }
              >
                <div
                  className="flex items-center gap-2"
                >
                  <span
                    className="text-sm font-medium text-[#1E293B] leading-[140%]"
                  >
                    {account.name}
                  </span>

                  <span
                    className="text-xs text-[#475569] leading-[140%]"
                  >
                    {shortenHash(account.address, 6)}
                  </span>
                </div>

                <div
                  className="relative flex justify-end "
                >
                  <div
                    className="flex items-center"
                  >
                    <div
                      className="flex items-center gap-1 relative "
                    >
                      <span
                        className="text-sm text-[#475569] font-medium leading-[140%]"
                      >
                        900.34
                      </span>

                      <span
                        className="text-xs text-[#64748B] leading-[140%]"
                      >
                        PHA
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}

export default ConnectWalletButton
