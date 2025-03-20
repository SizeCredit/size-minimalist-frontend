import { Chain } from "viem";

export function txUrl(chain: Chain, txHash: string): string {
  const blockExplorerUrl = chain.blockExplorers?.default?.url;
  const prefix = blockExplorerUrl?.includes("tenderly")
    ? `${chain.name.toLowerCase()}/`
    : "";
  return `${blockExplorerUrl}/tx/${prefix}${txHash}`;
}
