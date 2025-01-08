import { http, createConfig } from "wagmi";
import { base, baseSepolia, sepolia, mainnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const RPC_URLS = {
  [base.id]: "https://base-mainnet.g.alchemy.com/v2/",
  [baseSepolia.id]: "https://base-sepolia.g.alchemy.com/v2/",
  [sepolia.id]: "https://eth-sepolia.g.alchemy.com/v2/",
  [mainnet.id]: "https://eth-mainnet.g.alchemy.com/v2/",
};

export const config = createConfig({
  chains: [base, baseSepolia, sepolia, mainnet],
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

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
