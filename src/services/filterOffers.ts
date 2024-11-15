import { Token } from "../contexts/ConfigContext";
import { LimitOrder } from "../contexts/LimitOrdersContext";

function collateralRatio(
  tokens: Record<Token, { decimals: number }>,
  offer: LimitOrder,
  price: number,
  amount: number,
): number {
  const collateral =
    Number(offer.user.collateralTokenBalance) /
    10 ** tokens.CollateralToken.decimals;
  const debt =
    Number(offer.user.debtBalance) / 10 ** tokens.DebtToken.decimals + amount;
  return (collateral * price) / debt;
}

export function filterOffers(
  tokens: Record<Token, { decimals: number }>,
  offers: LimitOrder[],
  amount: number,
  sell: boolean,
  price?: number,
  tenor?: number,
): LimitOrder[] {
  return offers
    .filter((offer) => offer.maxDueDate.getTime() > new Date().getTime())
    .filter((offer) =>
      tenor
        ? offer.curveRelativeTime.tenors[0] <= tenor &&
          tenor <=
            offer.curveRelativeTime.tenors[
              offer.curveRelativeTime.tenors.length - 1
            ]
        : true,
    )
    .filter((offer) => {
      return sell
        ? Number(offer.user.borrowATokenBalance) /
            10 ** tokens.BorrowAToken.decimals >
            amount
        : price
          ? collateralRatio(tokens, offer, price, amount) >
            Math.max(Number(offer.user.user.openingLimitBorrowCR) / 1e18, 1.5)
          : false;
    });
}
