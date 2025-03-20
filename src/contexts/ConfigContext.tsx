import { createContext, ReactNode, useContext, useState } from "react";
import { Address } from "viem";
import { type Chain } from "wagmi/chains";
import baseSepolia from "../markets/base-sepolia";
import baseMainnet from "../markets/base-mainnet";
import mainnet from "../markets/mainnet";
import { useAccount, useBlockNumber } from "wagmi";
import { CustomWagmiContext } from "./CustomWagmiContext";

interface ConfigContext {
  chain?: {
    chain: Chain;
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
  const { config, chains } = useContext(CustomWagmiContext);
  const account = useAccount({
    config,
  });

  const chainsWithAddresses = chains.map((chain) => {
    const addresses =
      chain.id === baseSepolia.chainId
        ? baseSepolia.addresses
        : chain.id === baseMainnet.chainId
          ? baseMainnet.addresses
          : chain.id === mainnet.chainId
            ? mainnet.addresses
            : {};
    return {
      chain,
      addresses,
    };
  });

  const chain =
    chainsWithAddresses.find((c) => c.chain.id === account.chain?.id) ||
    chainsWithAddresses[0];
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
