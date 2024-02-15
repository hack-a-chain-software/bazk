import { fromPromise } from "xstate"
import { Keyring } from '@polkadot/ui-keyring'
import { getAllAcountsForProvider } from "@/utils/providers";
import { ProvidersBaseListInterface } from "@/utils/constants";

export const requestConnectionActor = fromPromise(
  async ({ input }: { input: { provider: ProvidersBaseListInterface, keyring: Keyring } }) => {
    return {
      provider: input.provider,
      accounts: await getAllAcountsForProvider(input.provider, input.keyring),
    }
  }
)

export default requestConnectionActor
