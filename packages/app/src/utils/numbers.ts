import Decimal from "decimal.js"

export type BalancePair = any

const formatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
})

export const transformBalance = (value: Decimal) => formatter.format(value.toNumber())
