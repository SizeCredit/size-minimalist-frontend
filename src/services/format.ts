import { BigNumberish, formatUnits } from "ethers";

export function format(
  value: string | BigNumberish | undefined,
  decimals = 2,
  truncate = 2,
  separator: string | undefined = undefined,
): string {
  if (typeof value === "string") {
    return value.substring(0, 6) + "..." + value.substring(value.length - 4);
  } else if (typeof value === "bigint") {
    const ans = truncateDecimal(
      formatUnits(value.toString(), decimals),
      truncate,
    );
    if (separator) {
      return addCommas(ans);
    } else {
      return ans;
    }
  } else if (typeof value == "number") {
    return value.toFixed(decimals);
  } else return "";
}

function addCommas(nStr: string): string {
  nStr += "";
  const x = nStr.split(".");
  let x1 = x[0];
  const x2 = x.length > 1 ? "." + x[1] : "";
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + "," + "$2");
  }
  return x1 + x2;
}

function truncateDecimal(number: string, decimalPlaces = 2): string {
  const decimalIndex = number.indexOf(".");
  if (decimalIndex === -1) return number;
  const endIndex = decimalIndex + decimalPlaces + (decimalPlaces > 0 ? 1 : 0);
  return number.slice(0, endIndex);
}

export function smallId(creditPositionId: string): string {
  return `...${creditPositionId.substring(creditPositionId.length - 4)}`;
}
