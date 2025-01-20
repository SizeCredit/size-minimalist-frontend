import { createContext, ReactNode, useState } from "react";
import { Address } from "viem";
import { type Chain } from "wagmi/chains";
import baseSepolia from "../markets/base-sepolia";
import baseMainnet from "../markets/base-mainnet";
import sepolia from "../markets/sepolia";
import mainnet from "../markets/mainnet";
import { useAccount, useBlockNumber } from "wagmi";
import { config } from "../wagmi";

const chains = [baseMainnet, mainnet, baseSepolia, sepolia];

interface ConfigContext {
  chain?: {
    chain: Chain;
    explorer: string;
    addresses: Record<string, Address>;
  };
  blockNumber?: bigint;
  pastBlocks: bigint;
  setPastBlocks: (value: bigint) => void;
}

export const ConfigContext = createContext<ConfigContext>({} as ConfigContext);

type Props = {
  children: ReactNode;
};

export function ConfigProvider({ children }: Props) {
  const account = useAccount({
    config,
  });

  const chain = chains.find((c) => c.chain.id === account.chain?.id) || chains[0];
  console.log(account.chain);
  const blockNumber = useBlockNumber({ config }).data;
  const [pastBlocks, setPastBlocks] = useState<bigint>(10_000n);

  return (
    <ConfigContext.Provider
      value={{
        chain,
        blockNumber,
        pastBlocks,
        setPastBlocks,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}
