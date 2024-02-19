import { fromPromise } from "xstate"
import { ProvidersBaseListInterface } from "@/utils/constants";
import { createWalletClient, custom } from 'viem'
import { sepolia } from 'viem/chains'
import {
  EvmAccountMappingProvider,
  UIKeyringProvider,
} from '@phala/sdk'

export const requestConnection = fromPromise(
  async ({ input }: { input: { provider: ProvidersBaseListInterface, registry: any } }) => {
    // TODO: REFACT THIS HEHE :) -> S2 <FIRE/>
    const {
      registry,
      provider,
    } = input

    let instance: any = null
    let accounts: any = null

    if (provider.type === 'polkadot') {
      accounts = await UIKeyringProvider.getAllAccountsFromProvider('Bazk', provider!.key)

      instance = await UIKeyringProvider.create(input.registry!.api, 'Bazk', provider!.key, accounts[0])
    } else {
      const client = createWalletClient({ chain: sepolia, transport: custom((window as any)!.ethereum) }) as any

      const [address] = await client.requestAddresses()

      instance = await EvmAccountMappingProvider.create(registry!.api, client, { address })

      accounts = [
        {
          type: 'ethereum',
          name: 'Account 01',
          address: instance?.address,
        }
      ]
    }

    await instance?.signCertificate()

    return {
      instance,
      accounts: accounts,
      provider: input.provider,
    }
  }
)

export default requestConnection
