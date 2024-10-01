import {
  ReactNode,
  createContext,
  useContext,
} from "react";
import { LimitOrdersContext } from "./LimitOrdersContext";
import { getQuote } from "../services/quote";
import { ConfigContext } from "./ConfigContext";
import { PriceContext } from "./PriceContext";

export type Currency =
  'Credit' |
  'Cash'

interface SwapContext {
  buyCreditQuote: (amount: number, tenor: number) => number;
  sellCreditQuote: (amount: number, tenor: number) => number;
}

export const SwapContext = createContext<SwapContext>({} as SwapContext);

type Props = {
  children: ReactNode;
};

export function SwapProvider({ children }: Props) {
  const { borrowOffers, loanOffers } = useContext(LimitOrdersContext)
  const { tokens } = useContext(ConfigContext)
  const { price } = useContext(PriceContext)

  const sellCreditQuote = (amount: number, tenor: number): number => {
    const offers = loanOffers.
      filter(loanOffer => loanOffer.curveRelativeTime.tenors[0] <= tenor && tenor <= loanOffer.curveRelativeTime.tenors[loanOffer.curveRelativeTime.tenors.length - 1])
      .filter(loanOffer => Number(loanOffer.user.borrowATokenBalance) / 10 ** tokens.BorrowAToken.decimals > amount)
    const rates = offers.map(offer => getQuote(offer.curveRelativeTime, amount, tenor))
    const bestRate = Math.min(...rates)
    return bestRate
  }
  const buyCreditQuote = (amount: number, tenor: number): number => {
    const offers = borrowOffers.
      filter(loanOffer => loanOffer.curveRelativeTime.tenors[0] <= tenor && tenor <= loanOffer.curveRelativeTime.tenors[loanOffer.curveRelativeTime.tenors.length - 1])
      .filter(borrowOffer => price ? Number(borrowOffer.user.collateralTokenBalance) / 10 ** tokens.BorrowAToken.decimals > amount * price * Math.max(Number(borrowOffer.user.user.openingLimitBorrowCR) / 1e18, 1.5) : false)
    const rates = offers.map(offer => getQuote(offer.curveRelativeTime, amount, tenor))
    const bestRate = Math.max(...rates)
    return bestRate
  }

  return (
    <SwapContext.Provider
      value={{
        buyCreditQuote,
        sellCreditQuote
      }}
    >
      {children}
    </SwapContext.Provider>
  );
}
