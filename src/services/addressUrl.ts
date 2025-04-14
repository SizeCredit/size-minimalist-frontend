import { Chain } from "viem";

export function addressUrl(chain: Chain, address: string): string {
  const blockExplorerUrl = chain.blockExplorers?.default?.url;
  const prefix = blockExplorerUrl?.includes("tenderly")
    ? `${chain.name.toLowerCase()}/`
    : "";
  return `${blockExplorerUrl}/address/${prefix}${address}`;
}
