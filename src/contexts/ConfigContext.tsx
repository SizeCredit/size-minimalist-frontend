import { createContext, Dispatch, ReactNode, useState } from 'react';
import { base } from 'wagmi/chains'
import { Chain } from 'wagmi/chains';
import { Abi } from 'viem';
import Size from '../abi/Size.json';
import { erc20Abi } from 'viem';

type Contract =
  'Size' |
  'UnderlyingCollateralToken' |
  'UnderlyingBorrowToken' |
  'CollateralToken' |
  'BorrowAToken' |
  'DebtToken'

type Address = `0x${string}`

interface ConfigContext {
  chain: Chain;
  deployment: Record<string, {address: Address, abi: Abi}>
  setChain: Dispatch<Chain>;
}

export const ConfigContext = createContext<ConfigContext>({} as ConfigContext);

type Props = {
  children: ReactNode;
};

export function ConfigProvider({ children }: Props) {
  const [chain, setChain] = useState<Chain>(base);
  const deployment = {
    Size: {abi: Size.abi as Abi, address: '0xC2a429681CAd7C1ce36442fbf7A4a68B11eFF940' as Address},
    // UnderlyingCollateralToken: ['', erc20Abi],
    // UnderlyingBorrowToken: ['', erc20Abi],
    // CollateralToken: ['', erc20Abi],
    // BorrowAToken: ['', erc20Abi],
    // DebtToken: ['', erc20Abi],
  }

  return (
    <ConfigContext.Provider
      value={{
        chain,
        setChain,
        deployment
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}
