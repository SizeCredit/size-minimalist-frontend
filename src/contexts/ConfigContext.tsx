import { createContext, Dispatch, ReactNode, useState } from 'react';
import { Abi } from 'viem';
import baseMainnetWethUsdc from '../markets/base-mainnet-weth-usdc'
import baseSepoliaWethUsdc from '../markets/base-sepolia-weth-usdc'

export type Token =
  'UnderlyingCollateralToken' |
  'UnderlyingBorrowToken' |
  'CollateralToken' |
  'BorrowAToken' |
  'DebtToken'

type Address = `0x${string}`

interface ConfigContext {
  market: {
    deployment: Record<string, { address: Address, abi: Abi, block: number }>
    tokens: Record<Token, { decimals: number, symbol: string }>;
    minimumCreditAmount: number;
  }
  marketNames: string[]
  marketName: string;
  setMarketName: Dispatch<string>
}

export const ConfigContext = createContext<ConfigContext>({} as ConfigContext);

type Props = {
  children: ReactNode;
};

const DEFAULT_MARKET = 'base-mainnet-weth-usdc'

export function ConfigProvider({ children }: Props) {
  const [marketName, setMarket] = useState(() => {
    return localStorage.getItem("market") || DEFAULT_MARKET;
  });
  
  const markets = {
    'base-mainnet-weth-usdc': baseMainnetWethUsdc,
    'base-sepolia-weth-usdc': baseSepoliaWethUsdc,
  }

  const market = (markets as any)[marketName]
  const marketNames = Object.keys(markets)

  const setMarketName = (name: string) => {
    setMarket(name)
    localStorage.setItem("market", name);
  }


  return (
    <ConfigContext.Provider
      value={{
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
