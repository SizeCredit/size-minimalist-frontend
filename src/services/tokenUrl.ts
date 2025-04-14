import { Chain } from "viem";

export function tokenUrl(chain: Chain, address: string): string {
  const blockExplorerUrl = chain.blockExplorers?.default?.url;
  const prefix = blockExplorerUrl?.includes("tenderly")
    ? `${chain.name.toLowerCase()}/`
    : "";
  return `${blockExplorerUrl}/token/${prefix}${address}`;
}
