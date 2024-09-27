import {
  BigNumberish,
  formatUnits
} from "ethers";

export function format(value: string | BigNumberish | undefined, decimals?: number) : string {
  console.log(typeof value)
  if (typeof value === 'string') {
    return value.substring(0, 6) + '...' + value.substring(value.length - 4)
  }
  else if (typeof value === 'bigint') {
    return formatUnits(value.toString(), decimals).toString()
  }
  else return ''
}