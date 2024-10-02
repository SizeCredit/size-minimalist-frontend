import {
  ReactNode,
  createContext,
  useContext,
} from "react";
import { LimitOrdersContext } from "./LimitOrdersContext";
import { getRate } from "../services/getRate";
import { ConfigContext } from "./ConfigContext";
import { PriceContext } from "./PriceContext";
import { Address } from "viem";


export interface Quote {
  user: Address;
  rate: number;
}

export type Currency =
  'Credit' |
  'Cash'

interface SwapContext {
  sellCreditQuote: (amount: number, tenor: number) => Quote;
  buyCreditQuote: (amount: number, tenor: number) => Quote;
}

export const SwapContext = createContext<SwapContext>({} as SwapContext);

type Props = {
  children: ReactNode;
};

export function SwapProvider({ children }: Props) {
  const { market } = useContext(ConfigContext)
  const { tokens } = market
  const { borrowOffers, loanOffers } = useContext(LimitOrdersContext)
  const { price } = useContext(PriceContext)

  const sellCreditQuote = (amount: number, tenor: number): Quote => {
    const offers = loanOffers.
      filter(loanOffer => loanOffer.curveRelativeTime.tenors[0] <= tenor && tenor <= loanOffer.curveRelativeTime.tenors[loanOffer.curveRelativeTime.tenors.length - 1])
      .filter(loanOffer => Number(loanOffer.user.borrowATokenBalance) / 10 ** tokens.BorrowAToken.decimals > amount)
    const rates = offers.map(offer => ({
      user: offer.user.account as Address,
      rate: getRate(offer.curveRelativeTime, tenor)
    }))
    if(rates.length === 0) {
      return {} as Quote
    }
    const bestRate = rates.reduce((best, current) => {
      return current.rate < best.rate ? current : best;
    })
    return bestRate
  }
  const buyCreditQuote = (amount: number, tenor: number): Quote => {
    const offers = borrowOffers.
      filter(loanOffer => loanOffer.curveRelativeTime.tenors[0] <= tenor && tenor <= loanOffer.curveRelativeTime.tenors[loanOffer.curveRelativeTime.tenors.length - 1])
      .filter(borrowOffer => price ? Number(borrowOffer.user.collateralTokenBalance) / 10 ** tokens.BorrowAToken.decimals > amount * price * Math.max(Number(borrowOffer.user.user.openingLimitBorrowCR) / 1e18, 1.5) : false)
    const rates = offers.map(offer => ({
      user: offer.user.account as Address,
      rate: getRate(offer.curveRelativeTime, tenor)
    }))
    if(rates.length === 0) {
      return {} as Quote
    }
    const bestRate = rates.reduce((best, current) => {
      return current.rate > best.rate ? current : best;
    })
    return bestRate
  }

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
