import { fromPromise } from "xstate";
import { ApiPromise, WsProvider } from '@polkadot/api'
import { options, OnChainRegistry } from '@phala/sdk'

const RPC_TESTNET_URL = 'wss://poc6.phala.network/ws'

export const webSocketConnection = fromPromise(
  async () => {
    const api = await ApiPromise.create(
      options({
        provider: new WsProvider(RPC_TESTNET_URL),
        noInitWarn: true,
      })
    )

    const phatRegistry = await OnChainRegistry.create(api)

    return {
      api,
      phatRegistry,
    }
  }
)

export default webSocketConnection
