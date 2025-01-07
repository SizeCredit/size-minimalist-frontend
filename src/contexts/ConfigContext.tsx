import { createContext, ReactNode, useState } from "react";
import { Address } from "viem";
import { type Chain } from "wagmi/chains";
import baseSepolia from "../markets/base-sepolia";
import baseMainnet from "../markets/base-mainnet";
import mainnet from "../markets/mainnet";
import { useAccount, useBlockNumber } from "wagmi";
import { config } from "../wagmi";

const chains = [baseSepolia, baseMainnet, mainnet];

interface ConfigContext {
  chain: {
    chain: Chain;
    explorer: string;
    addresses: Record<string, Address>;
  };
  BASESCAN: string;
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

  const chain = chains[account.chain?.id || 1];
  const blockNumber = useBlockNumber({ config }).data;
  const [pastBlocks, setPastBlocks] = useState<bigint>(10_000n);

  const BASESCAN = chain.explorer;

  return (
    <ConfigContext.Provider
      value={{
        chain,
        BASESCAN,
        blockNumber,
        pastBlocks,
        setPastBlocks,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}
