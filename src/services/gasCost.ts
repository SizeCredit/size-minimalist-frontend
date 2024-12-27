export function gasCost(
  gasUsed: bigint,
  gasPriceGwei: number,
  ethToUsd: number,
) {
  return (Number(gasUsed) * gasPriceGwei * ethToUsd) / 1e9;
}
