
import type {
  InjectedWindowProvider,
  InjectedAccountWithMeta,
} from '@polkadot/extension-inject/types'
import { Keyring } from '@polkadot/ui-keyring'
import { decodeAddress } from '@polkadot/util-crypto'
import {
  propOr,
  path,
  map,
  toPairs,
  fromPairs,
} from 'ramda'
import { ProvidersBaseListInterface, providersBaseList } from './constants'

export interface InjectedAccountWithMetaAndName
  extends InjectedAccountWithMeta {
  name: string
}

export type Pairs<T1, T2 = T1> = [T1, T2]

export const getInjectedWeb3Provider = () => fromPairs(
  map<[string, InjectedWindowProvider], Pairs<string>>(
    ([k, v]: any) => [k, v.version || 'unknown'],
    toPairs(propOr({}, 'injectedWeb3', window) as object)
  )
)

export const getAvailableProviders = () => {
  const injectedProviders = getInjectedWeb3Provider()

  return providersBaseList.map((wallet: any) => ({
    ...wallet,
    installed: !!injectedProviders[wallet.key],
    version: injectedProviders[wallet.key],
  }))
}

export const getAllAcountsForProvider = async (selected: ProvidersBaseListInterface, keyring: Keyring) => {
  const { key: name } = selected

  await new Promise((resolve) => setTimeout(resolve, 2000))

  const provider = path(
    ['injectedWeb3', name],
    window
  ) as (InjectedWindowProvider | undefined)

  if (provider && provider.enable) {
    try {
      const gateway = await provider.enable('Phala Website')

      const accounts = await gateway.accounts.get(true)

      return accounts.map(
        (acc) =>
          ({
            ...acc,
            address: keyring.encodeAddress(decodeAddress(acc.address), 30),
            meta: {
              source: name,
            },
          } as InjectedAccountWithMetaAndName)
      )
    } catch (err) {
      console.warn(err)

      return []
      //
    }
  }
  return []
}
