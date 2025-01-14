import { createPublicClient } from "viem";
import { http, createConfig } from "wagmi";
import { base, baseSepolia, sepolia, mainnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const RPC_URLS = {
  [base.id]: "https://base-mainnet.g.alchemy.com/v2/",
  [baseSepolia.id]: "https://base-sepolia.g.alchemy.com/v2/",
  [sepolia.id]: "https://eth-sepolia.g.alchemy.com/v2/",
  [mainnet.id]: "https://eth-mainnet.g.alchemy.com/v2/",
};

export const chains = [base, baseSepolia, sepolia, mainnet] as const;

export const config = createConfig({
  chains: chains,
  connectors: [
    injected(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  transports: {
    [base.id]: http(
      `${RPC_URLS[base.id]}${import.meta.env.VITE_ALCHEMY_API_KEY}`,
    ),
    [baseSepolia.id]: http(
      `${RPC_URLS[baseSepolia.id]}${import.meta.env.VITE_ALCHEMY_API_KEY}`,
    ),
    [sepolia.id]: http(
      `${RPC_URLS[sepolia.id]}${import.meta.env.VITE_ALCHEMY_API_KEY}`,
    ),
    [mainnet.id]: http(
      `${RPC_URLS[mainnet.id]}${import.meta.env.VITE_ALCHEMY_API_KEY}`,
    ),
  },
});

export const publicClients = Object.keys(RPC_URLS).map((chainId) =>
  ({
    [chainId]: createPublicClient({
      chain: chains.find((chain) => chain.id === Number(chainId)),
      transport: http(
        `${RPC_URLS[chainId as unknown as keyof typeof RPC_URLS]}${
          import.meta.env.VITE_ALCHEMY_API_KEY
        }`,
      ),
    }),
  }),
).reduce((acc, curr) => ({ ...acc, ...curr }), {});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
