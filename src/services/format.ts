import {
  BigNumberish,
  formatUnits
} from "ethers";

export function format(value: string | BigNumberish | undefined, decimals?: number): string {
  console.log(typeof value)
  if (typeof value === 'string') {
    return value.substring(0, 6) + '...' + value.substring(value.length - 4)
  }
  else if (typeof value === 'bigint') {
    return truncateDecimal(formatUnits(value.toString(), decimals))
  }
  else return ''
}

function truncateDecimal(number: string, decimalPlaces = 2): string {
  const decimalIndex = number.indexOf('.');
  if (decimalIndex === -1) return number;
  const endIndex = decimalIndex + decimalPlaces + 1;
  return number.slice(0, endIndex);
}