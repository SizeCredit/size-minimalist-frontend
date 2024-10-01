import {
  ReactNode,
  createContext,
  useContext,
} from "react";
import { toast } from 'react-toastify';
import { LimitOrdersContext } from "./LimitOrdersContext";
import { getRate } from "../services/getRate";
import { ConfigContext } from "./ConfigContext";
import { PriceContext } from "./PriceContext";
import { config } from "../wagmi";
import { sendTransaction } from "wagmi/actions";
import { Address, encodeFunctionData } from "viem";
import { ethers } from "ethers";
import Size from '../abi/Size.json'


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
  sellCreditMarket: (quote: Quote, amount: bigint, tenor: number) => Promise<void>
  buyCreditMarket: (quote: Quote, amount: bigint, tenor: number) => Promise<void>
}

export const SwapContext = createContext<SwapContext>({} as SwapContext);

type Props = {
  children: ReactNode;
};

export function SwapProvider({ children }: Props) {
  const { deployment } = useContext(ConfigContext)
  const { borrowOffers, loanOffers } = useContext(LimitOrdersContext)
  const { tokens } = useContext(ConfigContext)
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

  const sellCreditMarket = async (quote: Quote, amount: bigint, tenor: number): Promise<void> => {
    const { user: lender, rate } = quote
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60
    const maxAPR = Math.floor(rate * 1.05 * 1e18)
    const exactAmountIn = true
    const creditPositionId = ethers.MaxUint256
    const arg = {
      lender,
      creditPositionId,
      amount,
      tenor,
      deadline,
      maxAPR,
      exactAmountIn
    }
    console.log(arg)
    const data = encodeFunctionData({
      abi: [Size.abi.find(e => e.name === 'sellCreditMarket')],
      functionName: 'sellCreditMarket',
      args: [arg]
    })
    console.log(data)
    try {
      const tx = await sendTransaction(config, {
        to: deployment.Size.address,
        data
      })
      toast.success(`https://basescan.org/tx/${tx}`)
    } catch (e: any) {
      toast.error(e.shortMessage)
    }
  }

  const buyCreditMarket = async (quote: Quote, amount: bigint, tenor: number): Promise<void> => {
    const { user: borrower, rate } = quote
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60
    const minAPR = Math.floor(rate * 1e18 / 1.05)
    const exactAmountIn = true
    const creditPositionId = ethers.MaxUint256
    const arg = {
      borrower,
      creditPositionId,
      amount,
      tenor,
      deadline,
      minAPR,
      exactAmountIn
    }
    console.log(arg)
    const data = encodeFunctionData({
      abi: [Size.abi.find(e => e.name === 'buyCreditMarket')],
      functionName: 'buyCreditMarket',
      args: [arg]
    })
    console.log(data)
    try {
      const tx = await sendTransaction(config, {
        to: deployment.Size.address,
        data
      })
      toast.success(`https://basescan.org/tx/${tx}`)
    } catch (e: any) {
      toast.error(e.shortMessage)
    }
  }

  return (
    <SwapContext.Provider
      value={{
        buyCreditQuote,
        sellCreditQuote,
        buyCreditMarket,
        sellCreditMarket,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
}
