import { Token } from "../contexts/ConfigContext";
import { LimitOrder } from "../contexts/LimitOrdersContext";

export function filterOffers(
  tokens: Record<Token, { decimals: number }>,
  offers: LimitOrder[],
  amount: number,
  sell: boolean,
  tenor?: number,
  price?: number): LimitOrder[] {
  return offers.
    filter(offer => offer.maxDueDate.getTime() > new Date().getTime())
    .filter(offer => tenor ? (offer.curveRelativeTime.tenors[0] <= tenor && tenor <= offer.curveRelativeTime.tenors[offer.curveRelativeTime.tenors.length - 1]) : true)
    .filter(offer => sell ? (Number(offer.user.borrowATokenBalance) / 10 ** tokens.BorrowAToken.decimals > amount) : price ? Number(offer.user.collateralTokenBalance) / 10 ** tokens.BorrowAToken.decimals > amount * price * Math.max(Number(offer.user.user.openingLimitBorrowCR) / 1e18, 1.5) : false)
}