import {
  BigNumberish,
  formatUnits
} from "ethers";

export function format(value: string | BigNumberish | undefined, decimals?: number): string {
  if (typeof value === 'string') {
    return value.substring(0, 6) + '...' + value.substring(value.length - 4)
  }
  else if (typeof value === 'bigint') {
    return truncateDecimal(formatUnits(value.toString(), decimals))
  }
  else if(typeof value == 'number') {
    return value.toFixed(2)
  }
  else return ''
}

function truncateDecimal(number: string, decimalPlaces = 2): string {
  const decimalIndex = number.indexOf('.');
  if (decimalIndex === -1) return number;
  const endIndex = decimalIndex + decimalPlaces + 1;
  return number.slice(0, endIndex);
}

export function smallId(creditPositionId: bigint) {
    const UINT256_HALF = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    let i = BigInt(creditPositionId) - UINT256_HALF;
    let smallId = i - BigInt(1);
    let smallIdHex = smallId.toString(16);
    return `0x80${smallIdHex}`;
}
