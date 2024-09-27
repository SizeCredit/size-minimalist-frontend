import {
  ReactNode,
  createContext,
  useCallback,
} from "react";

enum Currency {
  'Credit',
  'Cash'
}

interface SwapContext {
  getQuote(currency: Currency, amount: number, tenor: number): Promise<number>;
}

export const SwapContext = createContext<SwapContext>({} as SwapContext);

type Props = {
  children: ReactNode;
};

export function SwapProvider({ children }: Props) {
  const getQuote = useCallback(
    async (currency: Currency, amount: number, tenor: number) => {
      if(currency === Currency.Credit) {
        return amount / 1.1;
      }
      else {
        return amount * 1.1;
      }
    }, []
  );


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
