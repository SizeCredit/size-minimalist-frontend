import { BigNumberish, formatUnits } from "ethers";

export function format(
  value: string | BigNumberish | undefined,
  decimals = 2,
  truncate = 2,
): string {
  if (typeof value === "string") {
    return value.substring(0, 6) + "..." + value.substring(value.length - 4);
  } else if (typeof value === "bigint") {
    return truncateDecimal(formatUnits(value.toString(), decimals), truncate);
  } else if (typeof value == "number") {
    return value.toFixed(decimals);
  } else return "";
}

function truncateDecimal(number: string, decimalPlaces = 2): string {
  const decimalIndex = number.indexOf(".");
  if (decimalIndex === -1) return number;
  const endIndex = decimalIndex + decimalPlaces + 1;
  return number.slice(0, endIndex);
}

export function smallId(creditPositionId: string): string {
  return `...${creditPositionId.substring(creditPositionId.length - 4)}`;
}
