import { createContext, Dispatch, ReactNode, useState } from 'react';
import { base } from 'wagmi/chains'
import { Chain } from 'wagmi/chains';
import { Abi } from 'viem';
import Size from '../abi/Size.json';
import { erc20Abi } from 'viem';


type Token =
  'UnderlyingCollateralToken' |
  'UnderlyingBorrowToken' |
  'CollateralToken' |
  'BorrowAToken' |
  'DebtToken'

type Contract =
  'Size' | Token

type Address = `0x${string}`

interface ConfigContext {
  chain: Chain;
  deployment: Record<Contract, { address: Address, abi: Abi }>
  tokens: Record<Token, { decimals: number, symbol: string }>;
  setChain: Dispatch<Chain>;
}

export const ConfigContext = createContext<ConfigContext>({} as ConfigContext);

type Props = {
  children: ReactNode;
};

export function ConfigProvider({ children }: Props) {
  const [chain, setChain] = useState<Chain>(base);
  const deployment = {
    Size: { abi: Size.abi as Abi, address: '0xC2a429681CAd7C1ce36442fbf7A4a68B11eFF940' as Address },
    UnderlyingCollateralToken: { abi: erc20Abi, address: '0x' as Address },
    UnderlyingBorrowToken: { abi: erc20Abi, address: '0x' as Address },
    CollateralToken: { abi: erc20Abi, address: '0x' as Address },
    BorrowAToken: { abi: erc20Abi, address: '0x' as Address },
    DebtToken: { abi: erc20Abi, address: '0x' as Address },
  }
  const tokens = {
    BorrowAToken: { decimals: 6, symbol: 'szUSDC' },
    UnderlyingBorrowToken: { decimals: 6, symbol: 'USDC' },
    UnderlyingCollateralToken: { decimals: 18, symbol: 'ETH' },
    CollateralToken: { decimals: 18, symbol: 'szETH' },
    DebtToken: { decimals: 6, symbol: 'szDebtUSDC' }
  }

  return (
    <ConfigContext.Provider
      value={{
        chain,
        setChain,
        deployment,
        tokens
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}
