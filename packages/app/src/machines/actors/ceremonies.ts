import { signCertificate } from "@phala/sdk";
import { Keyring } from "@polkadot/api";
import { isBefore } from "date-fns";
import { fromPromise } from "xstate";

export const loadCeremony = fromPromise(
  async ({ input }: any) => {
    const { contract, ceremonyId } = input

    const keyring = new Keyring({ type: 'sr25519' })

    const pair = keyring.addFromUri('//bazk')

    const cert = await signCertificate({ pair })

    const {
      output
    } = await contract.query.getCeremony(pair.address, { cert }, ceremonyId)

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
)

export const loadCeremonies = fromPromise(
  async ({ input }: any) => {
    const { contract } = input

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

  }
)
