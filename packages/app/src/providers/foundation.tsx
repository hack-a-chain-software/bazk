import abi from '../abi.json'
import { isBefore } from 'date-fns'
import { createContext, useReducer, useContext, useEffect } from 'react';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api'
import { options, OnChainRegistry, signCertificate, PinkContractPromise } from '@phala/sdk'

const RPC_TESTNET_URL = 'wss://poc6.phala.network/ws'

const BAZK_CONTRACT_ID = '0xeb6ba2385f46ec1904a97b08cee844ed903d336f9d3b2fb405e0651f7f06f85b'

interface FoundationContextValue {
  booting: boolean
  initialized: boolean,
  api: ApiPromise | null
  contract: PinkContractPromise | null
  init: () => Promise<void>
  getCeremonies: () => Promise<any[]>
  getCeremony: (id: string | number) => Promise<any>
}

const initialState = {
  api: null,
  contract: null,
  booting: false,
  initialized: false,
  init: async () => {},
  getCeremony: async () => {},
  getCeremonies: async () => [],
};

const FoundationContext = createContext<FoundationContextValue>({
  ...initialState
});

const reducer = (state: any, updated: any ) => {
  return {
    ...state,
    ...updated,
  };
}

const FoundationContextProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = async () => {
    dispatch({
      booting: true,
    })

    const api = await ApiPromise.create(
      options({
        provider: new WsProvider(RPC_TESTNET_URL),
        noInitWarn: true,
      })
    )

    const phatRegistry = await OnChainRegistry.create(api)

    const contractKey = await phatRegistry.getContractKeyOrFail(BAZK_CONTRACT_ID)

    const contract = new PinkContractPromise(api, phatRegistry, abi, BAZK_CONTRACT_ID, contractKey)

    // console.log('initialized - ', new Date())

    dispatch({
      api,
      contract,
      booting: false,
      initialized: true,
    })
  }

  const getCeremonies = async () => {
    const keyring = new Keyring({ type: 'sr25519' })

    const pair = keyring.addFromUri('//bazk')

    const cert = await signCertificate({ pair })

    const {
      output
    } = await state.contract.query.getCerimonies(pair.address, { cert })

    const rawCeremonies = output.toJSON().ok.ok

    return rawCeremonies
      .filter(([ceremony]: any) => ceremony.phase !== 1)
      .map(([ceremony, contributions]: any) => {
        const isOpen = isBefore(new Date(), new Date(ceremony.deadline * 1000))
          ? 'open'
          : 'finalized'

        return ({
          ...ceremony,
          contributions,
          status: isOpen,
          hash: '55ab71351f...c8c5cbb24d'
        })
      })
  }

  const getCeremony = async (id: string | number) => {
    const keyring = new Keyring({ type: 'sr25519' })

    const pair = keyring.addFromUri('//bazk')

    const cert = await signCertificate({ pair })

    const {
      output
    } = await state.contract.query.getCeremony(pair.address, { cert }, id)

    const [
      ceremony,
      contributions,
      metadatas,
    ] = output.toJSON().ok.ok

    return {
      ...ceremony,
      metadatas,
      contributions: contributions
        .map((contribution: any, index: any) => ({ ...contribution, order: index + 1}))
        .sort((a: any, b: any) => b.timestamp - a.timestamp),
    }
  }

  useEffect(() => {
    if (
      state.booting
      || state.contract
      || state.api
    ) {
      return
    }

    // console.log('booting - ', new Date())

    init()
  }, [state])

  return (
    <FoundationContext.Provider value={{
      init,
      getCeremony,
      getCeremonies,
      api: state.api,
      booting: state.booting,
      contract: state.contract,
      initialized: state.initialized,
    }}>
      {children}
    </FoundationContext.Provider>
  );
};

const useFoundationContext = () => {
  return useContext(FoundationContext);
};

export { FoundationContextProvider, useFoundationContext };
