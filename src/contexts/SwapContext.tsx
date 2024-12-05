import { ReactNode, createContext, useContext } from "react";
import { LimitOrdersContext } from "./LimitOrdersContext";
import { getRate } from "../services/getRate";
import { PriceContext } from "./PriceContext";
import { Address } from "viem";
import { filterOffers } from "../services/filterOffers";
import { FactoryContext } from "./FactoryContext";

export interface Quote {
  user: Address;
  rate: number;
}

export type Currency = "Credit" | "Cash";

interface SwapContext {
  sellCreditQuote: (amount: number, tenor: number) => Quote;
  buyCreditQuote: (amount: number, tenor: number) => Quote;
}

export const SwapContext = createContext<SwapContext>({} as SwapContext);

type Props = {
  children: ReactNode;
};

export function SwapProvider({ children }: Props) {
  const { market } = useContext(FactoryContext);
  const { borrowOffers, loanOffers } = useContext(LimitOrdersContext);
  const { price } = useContext(PriceContext);

  const sellCreditQuote = (amount: number, tenor: number): Quote => {
    const offers = filterOffers(
      market!,
      loanOffers,
      amount,
      true,
      price,
      tenor,
    );

    const rates = offers.map((offer) => ({
      user: offer.user.account as Address,
      rate: getRate(offer.curveRelativeTime, tenor),
    }));
    if (rates.length === 0) {
      return {} as Quote;
    }
    const bestRate = rates.reduce((best, current) => {
      return current.rate < best.rate ? current : best;
    });
    return bestRate;
  };
  const buyCreditQuote = (amount: number, tenor: number): Quote => {
    const offers = filterOffers(
      market!,
      borrowOffers,
      amount,
      false,
      price,
      tenor,
    );
    const rates = offers.map((offer) => ({
      user: offer.user.account as Address,
      rate: getRate(offer.curveRelativeTime, tenor),
    }));
    if (rates.length === 0) {
      return {} as Quote;
    }
    const bestRate = rates.reduce((best, current) => {
      return current.rate > best.rate ? current : best;
    });
    return bestRate;
  };

  return (
    <SwapContext.Provider
      value={{
        buyCreditQuote,
        sellCreditQuote,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
}
