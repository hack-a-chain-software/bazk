import { PhalaConnectContext } from "@/App"

export const ConnectWalletButton = () => {
  const PhalaConnectActorRef = PhalaConnectContext.useActorRef()

  const isLoggedIn = PhalaConnectContext.useSelector((state) => state.matches('loggedIn'))

  const account = PhalaConnectContext.useSelector((state) => state.context.account)
  const provider = PhalaConnectContext.useSelector((state) => state.context.provider)

  return (
    <div>
      {isLoggedIn && account && provider && (
        <button
          onClick={() => PhalaConnectActorRef.send({ type: 'openModal' })}
          className="text-white flex justify-center justify-between gap-2"
        >
          <img src={provider.icon} />

          {account.name}
        </button>
      )}


      {!isLoggedIn && (
        <button
          onClick={() => PhalaConnectActorRef.send({ type: 'openModal' })}
          className="text-white"
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}

export default ConnectWalletButton
