import { transformBalance } from "@/utils/numbers";
import Decimal from "decimal.js";
import { fromPromise } from "xstate";

export const getAccountsBalance = fromPromise(
  async ({ input }: any) => {
    const { accounts, api } = input

    const updatedAccounts = await Promise.all(accounts.map(async (account: any) => {
      const balance = await api.query.system.account(account?.address)

      const { data: { free: freeBalance } } = balance

      const multiplier = new Decimal(10).pow(api.registry.chainDecimals[0])

      const newBalance = transformBalance(new Decimal(freeBalance.toString() || '0').div(multiplier))

      return {
        ...account,
        balance: newBalance,
      }
    }))

    return {
      updatedAccounts,
    }
  }
)

export default getAccountsBalance
