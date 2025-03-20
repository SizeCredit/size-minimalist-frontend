import { createPublicClient, HttpTransport } from "viem";
import { http, createConfig } from "wagmi";
import { base, baseSepolia, mainnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const RPC_URLS = {
  [base.id]: "https://base-mainnet.g.alchemy.com/v2/",
  [baseSepolia.id]: "https://base-sepolia.g.alchemy.com/v2/",
  [mainnet.id]: "https://eth-mainnet.g.alchemy.com/v2/",
};

export const chains = [base, baseSepolia, mainnet] as const;

export const config = createConfig({
  chains: chains,
  connectors: [
    injected(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  transports: Object.entries(RPC_URLS).reduce(
    (acc, [chainId, url]) => ({
      ...acc,
      [Number(chainId)]: http(`${url}${import.meta.env.VITE_ALCHEMY_API_KEY}`),
    }),
    {} as Record<number, HttpTransport>,
  ),
});

export const publicClients = Object.keys(RPC_URLS)
  .map((chainId) => ({
    [chainId]: createPublicClient({
      chain: chains.find((chain) => chain.id === Number(chainId)),
      transport: http(
        `${RPC_URLS[chainId as unknown as keyof typeof RPC_URLS]}${
          import.meta.env.VITE_ALCHEMY_API_KEY
        }`,
      ),
    }),
  }))
  .reduce((acc, curr) => ({ ...acc, ...curr }), {});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
