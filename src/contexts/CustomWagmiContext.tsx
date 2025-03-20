import { createContext, ReactNode } from "react";

import { Chain, createPublicClient, HttpTransport, PublicClient } from "viem";
import { http, createConfig, Config, WagmiProvider } from "wagmi";
import { base, baseSepolia, mainnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

interface CustomWagmiContext {
  chains: readonly [Chain, ...Chain[]];
  config: Config;
  publicClients: Record<number, PublicClient>;
}

export const CustomWagmiContext = createContext<CustomWagmiContext>(
  {} as CustomWagmiContext,
);

type Props = {
  children: ReactNode;
};

export function CustomWagmiProvider({ children }: Props) {
  const chainId = new URLSearchParams(window.location.search).get("chainId");
  const rpcUrl = new URLSearchParams(window.location.search).get("rpcUrl");
  const blockExplorerUrl = new URLSearchParams(window.location.search).get(
    "blockExplorerUrl",
  );

  const rpcUrls: Record<number, string> = {
    [base.id]: `https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
    [baseSepolia.id]: `https://base-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
    [mainnet.id]: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
  };
  if (chainId && rpcUrl) {
    rpcUrls[Number(chainId)] = rpcUrl;
  }
  const defaultChains = [base, baseSepolia, mainnet] as const;

  const blockExplorers = defaultChains
    .map((chain) => ({
      [chain.id]:
        chain.id === Number(chainId)
          ? blockExplorerUrl
          : chain.blockExplorers?.default?.url,
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});

  const chains = defaultChains.map((chain) => ({
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      default: {
        ...chain.rpcUrls?.default,
        http: [rpcUrls[chain.id]],
      },
    },
    blockExplorers: {
      default: {
        ...chain.blockExplorers?.default,
        url: blockExplorers[chain.id],
      },
    },
  })) as unknown as readonly [Chain, ...Chain[]];

  const config = createConfig({
    chains: chains,
    connectors: [
      injected(),
      walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
    ],
    transports: Object.entries(rpcUrls).reduce(
      (acc, [chainId, url]) => ({
        ...acc,
        [Number(chainId)]: http(url),
      }),
      {} as Record<number, HttpTransport>,
    ),
  });

  console.log(
    Object.entries(rpcUrls).reduce(
      (acc, [chainId, url]) => ({
        ...acc,
        [Number(chainId)]: url,
      }),
      {},
    ),
  );

  const publicClients = Object.keys(rpcUrls)
    .map((chainId) => ({
      [chainId]: createPublicClient({
        chain: chains.find((chain) => chain.id === Number(chainId)),
        transport: http(rpcUrls[chainId as unknown as keyof typeof rpcUrls]),
      }),
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});

  return (
    <CustomWagmiContext.Provider
      value={{
        chains,
        config,
        publicClients,
      }}
    >
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </CustomWagmiContext.Provider>
  );
}
