
import type {
  InjectedWindowProvider,
  InjectedAccountWithMeta,
} from '@polkadot/extension-inject/types'
import {
  propOr,
  map,
  toPairs,
  fromPairs,
} from 'ramda'
import { providersBaseList } from './constants'

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
  const injectedProviders = {
    ...getInjectedWeb3Provider(),
    ethereum: (window as any).ethereum?.net_version ?? 'unknown'
  } as any

  return providersBaseList.map((wallet: any) => ({
    ...wallet,
    installed: !!injectedProviders[wallet.key],
    version: injectedProviders[wallet.key],
  }))
}
