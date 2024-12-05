import { createContext, ReactNode } from "react";
import { Address } from "viem";
import { type Chain } from "wagmi/chains";
import baseSepolia from "../markets/base-sepolia";
import baseMainnet from "../markets/base-mainnet";
import { useAccount, useBlockNumber } from "wagmi";
import { config } from "../wagmi";

interface ConfigContext {
  chain: {
    chain: Chain;
    SizeFactory: Address;
    WETH: Address;
  };
  blockNumber?: bigint;
  pastBlocks: bigint;
}

export const ConfigContext = createContext<ConfigContext>({} as ConfigContext);

type Props = {
  children: ReactNode;
};

export function ConfigProvider({ children }: Props) {
  const account = useAccount({
    config,
  });

  const chain = account.chain?.name === "Base" ? baseMainnet : baseSepolia;
  const blockNumber = useBlockNumber({ config }).data;
  const pastBlocks = 10_000n;

  return (
    <ConfigContext.Provider
      value={{
        chain,
        blockNumber,
        pastBlocks,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}
