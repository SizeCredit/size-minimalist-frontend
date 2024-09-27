import {
  ReactNode,
  createContext,
} from "react";

export enum Currency {
  'Credit',
  'Cash'
}

interface SwapContext {
  getQuote: (currency: Currency, amount: number, tenor: number) => Promise<number>;
}

export const SwapContext = createContext<SwapContext>({} as SwapContext);

type Props = {
  children: ReactNode;
};

export function SwapProvider({ children }: Props) {
  const getQuote = async (currency: Currency, amount: number, tenor: number) => {
    if (tenor === 0) return 0;
    if (currency === Currency.Credit) {
      return amount / 1.1;
    }
    else {
      return amount * 1.1;
    }
  }


  return (
    <SwapContext.Provider
      value={{
        getQuote,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
}
