import { useContext } from "react";
import { FactoryContext } from "../contexts/FactoryContext";
import { format } from "../services/format";

const Factory = () => {
  const { markets } = useContext(FactoryContext);

  return (
    <>
      <div className="registry-container">
        <div className="registry-grid">
          {markets.map((market) => (
            <div key={market.address} className="market-entry">
              <h5>{market.description}</h5>
              <div>
                <b>Address:</b> <code>{market.address}</code>
              </div>
              <div>
                <b>Collateral Token:</b>{" "}
                <code>{market.data.collateralToken.toString()}</code>
              </div>
              <div>
                <b>Borrow AToken:</b>{" "}
                <code>{market.data.borrowAToken.toString()}</code>
              </div>
              <div>
                <b>Debt Token:</b>{" "}
                <code>{market.data.debtToken.toString()}</code>
              </div>
              <div>
                <b>Underlying Collateral Token:</b>{" "}
                <code>{market.data.underlyingCollateralToken.toString()}</code>
              </div>
              <div>
                <b>Underlying Borrow Token:</b>{" "}
                <code>{market.data.underlyingBorrowToken.toString()}</code>
              </div>
              <div>
                <b>Swap Fee APR:</b>{" "}
                {format(market.feeConfig.swapFeeAPR, 18 - 2)} %
              </div>
              <div>
                <b>Fragmentation Fee:</b>{" "}
                {format(market.feeConfig.fragmentationFee, 18)}{" "}
                {market.tokens.underlyingBorrowToken.symbol}
              </div>
              <div>
                <b>Liquidation Reward:</b>{" "}
                {format(market.feeConfig.liquidationRewardPercent, 18 - 2)} %
              </div>
              <div>
                <b>Overdue Collateral Protocol:</b>{" "}
                {format(
                  market.feeConfig.overdueCollateralProtocolPercent,
                  18 - 2,
                )}{" "}
                %
              </div>
              <div>
                <b>Liquidation Collateral Protocol:</b>{" "}
                {format(market.feeConfig.collateralProtocolPercent, 18 - 2)} %
              </div>
              <div>
                <b>Fee Recipient:</b>{" "}
                <code>{market.feeConfig.feeRecipient.toString()}</code>
              </div>
              <div>
                <b>CR Opening:</b> {format(market.riskConfig.crOpening, 18 - 2)}{" "}
                %
              </div>
              <div>
                <b>CR Liquidation:</b>{" "}
                {format(market.riskConfig.crLiquidation, 18 - 2)} %
              </div>
              <div>
                <b>Min Borrow A Token:</b>{" "}
                {format(
                  market.riskConfig.minimumCreditBorrowAToken,
                  market.tokens.borrowAToken.decimals,
                )}{" "}
                {market.tokens.underlyingBorrowToken.symbol}
              </div>
              <div>
                <b>Borrow A Token Cap:</b>{" "}
                {format(
                  market.riskConfig.borrowATokenCap,
                  market.tokens.borrowAToken.decimals,
                )}{" "}
                {market.tokens.underlyingBorrowToken.symbol}
              </div>
              <div>
                <b>Min Tenor:</b> {market.riskConfig.minTenor.toString()}{" "}
                seconds
              </div>
              <div>
                <b>Max Tenor:</b> {market.riskConfig.maxTenor.toString()}{" "}
                seconds
              </div>
              <div>
                <b>Oracle Price Feed:</b>{" "}
                <code>{market.oracle.priceFeed.toString()}</code>
              </div>
              <div>
                <b>Variable Pool Borrow Rate Stale Interval:</b>{" "}
                {market.oracle.variablePoolBorrowRateStaleRateInterval.toString()}{" "}
                seconds
              </div>
            </div>
          ))}
        </div>
        <div className="disclaimers">
          <small>*Unofficial Size application</small>
        </div>
      </div>
    </>
  );
};

export default Factory;
