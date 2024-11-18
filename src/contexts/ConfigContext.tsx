import { createContext, Dispatch, ReactNode, useState } from "react";
import { Abi } from "viem";
import baseMainnetWethUsdc from "../markets/base-mainnet-weth-usdc";
import baseMainnetCbbtcUsdc from "../markets/base-mainnet-cbbtc-usdc";
import baseSepoliaWethUsdc from "../markets/base-sepolia-weth-usdc";
import baseSepoliaLinkUsdc from "../markets/base-sepolia-link-usdc";
import baseSepolia from "../markets/base-sepolia";

export type Token =
  | "UnderlyingCollateralToken"
  | "UnderlyingBorrowToken"
  | "CollateralToken"
  | "BorrowAToken"
  | "DebtToken";

export type Address = `0x${string}`;

interface ConfigContext {
  market: {
    deployment: Record<string, { address: Address; abi: Abi; block: number }>;
    tokens: Record<Token, { decimals: number; symbol: string }>;
    minimumCreditAmount: number;
  };
  chain: {
    SizeFactory: { address: Address; abi: Abi };
    WETH: { address: Address; abi: Abi };
  };
  marketNames: string[];
  marketName: string;
  setMarketName: Dispatch<string>;
}

export const ConfigContext = createContext<ConfigContext>({} as ConfigContext);

type Props = {
  children: ReactNode;
};

const DEFAULT_MARKET = "base-mainnet-weth-usdc";

export function ConfigProvider({ children }: Props) {
  const [marketName, setMarket] = useState(() => {
    return localStorage.getItem("market") || DEFAULT_MARKET;
  });
  const chain = marketName.includes("mainnet") ? baseSepolia : baseSepolia;

  const markets = {
    "base-mainnet-weth-usdc": baseMainnetWethUsdc,
    "base-mainnet-cbbtc-usdc": baseMainnetCbbtcUsdc,
    "base-sepolia-weth-usdc": baseSepoliaWethUsdc,
    "base-sepolia-link-usdc": baseSepoliaLinkUsdc,
  };

  const market = (markets as any)[marketName];
  const marketNames = Object.keys(markets);

  const setMarketName = (name: string) => {
    setMarket(name);
    localStorage.setItem("market", name);
  };

  return (
    <ConfigContext.Provider
      value={{
        chain,
        market,
        marketNames,
        marketName,
        setMarketName,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}
