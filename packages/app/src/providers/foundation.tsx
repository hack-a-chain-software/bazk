import { isBefore } from 'date-fns'
import { createContext, useContext, useCallback } from 'react';
import { Keyring } from '@polkadot/api'
import { signCertificate } from '@phala/sdk'
import { ApiServiceContext } from '@/App';

interface FoundationContextValue {
  getCeremonies: () => Promise<any[]>
  getCeremony: (id: string | number) => Promise<any>
}

const initialState = {
  getCeremony: async () => {},
  getCeremonies: async () => [],
};

const FoundationContext = createContext<FoundationContextValue>({
  ...initialState
});

const FoundationContextProvider = ({ children }: any) => {
  const contract = ApiServiceContext.useSelector((state) => state.context.contract)

  const getCeremonies = useCallback(async () => {
    const keyring = new Keyring({ type: 'sr25519' })

    const pair = keyring.addFromUri('//bazk')

    const cert = await signCertificate({ pair })

    const {
      output
    } = await contract.query.getCerimonies(pair.address, { cert })

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
  }, [contract])

  const getCeremony = useCallback(async (id: string | number) => {
    const keyring = new Keyring({ type: 'sr25519' })

    const pair = keyring.addFromUri('//bazk')

    const cert = await signCertificate({ pair })

    const {
      output
    } = await contract.query.getCeremony(pair.address, { cert }, id)

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
  }, [contract])

  return (
    <FoundationContext.Provider value={{
      getCeremony,
      getCeremonies,
    }}>
      {children}
    </FoundationContext.Provider>
  );
};

const useFoundationContext = () => {
  return useContext(FoundationContext);
};

export { FoundationContextProvider, useFoundationContext };
