import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import Close from './icons/Close'

export const Modal = ({
  isOpen,
  onClose,
  children,
  rootClass,
}: {
  isOpen: boolean,
  rootClass?: string
  onClose: () => void,
  children: ReactNode,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={
                  twMerge(
                    'relative w-full max-w-md transform overflow-hidden rounded-xl bg-white p-4 md:p-6 text-left align-middle shadow-xl transition-all',
                    rootClass,
                  )
                }
              >
                <div
                  className="absolute md:top-6 md:right-6 top-4 right-4"
                >
                  <button
                    onClick={onClose}
                  >
                    <Close />
                  </button>
                </div>

                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default Modal
