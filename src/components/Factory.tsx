import { useContext } from "react";
import { FactoryContext } from "../contexts/FactoryContext";
import { format } from "../services/format";
import { ConfigContext } from "../contexts/ConfigContext";

const Factory = () => {
  const { BASESCAN } = useContext(ConfigContext);
  const { markets } = useContext(FactoryContext);

  return (
    <>
      <div className="registry-container">
        <div className="registry-grid">
          {markets.map((market) => (
            <div key={market.address} className="market-entry">
              <h5>{market.description}</h5>
              <div>
                <b>Address:</b>{" "}
                <a
                  href={`${BASESCAN}/address/${market.address}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.address}</code>
                </a>
              </div>
              <div>
                <b>Collateral Token:</b>{" "}
                <a
                  href={`${BASESCAN}/token/${market.data.collateralToken.toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.data.collateralToken.toString()}</code>
                </a>
              </div>
              <div>
                <b>Borrow AToken:</b>{" "}
                <a
                  href={`${BASESCAN}/token/${market.data.borrowAToken.toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.data.borrowAToken.toString()}</code>
                </a>
              </div>
              <div>
                <b>Debt Token:</b>{" "}
                <a
                  href={`${BASESCAN}/token/${market.data.debtToken.toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.data.debtToken.toString()}</code>
                </a>
              </div>
              <div>
                <b>Underlying Collateral Token:</b>{" "}
                <a
                  href={`${BASESCAN}/token/${market.data.underlyingCollateralToken.toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>
                    {market.data.underlyingCollateralToken.toString()}
                  </code>
                </a>
              </div>
              <div>
                <b>Underlying Borrow Token:</b>{" "}
                <a
                  href={`${BASESCAN}/token/${market.data.underlyingBorrowToken.toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.data.underlyingBorrowToken.toString()}</code>
                </a>
              </div>
              <div>
                <b>Swap Fee APR:</b>{" "}
                {format(market.feeConfig.swapFeeAPR, 18 - 2)}%
              </div>
              <div>
                <b>Fragmentation Fee:</b>{" "}
                {format(market.feeConfig.fragmentationFee, 18)}{" "}
                {market.tokens.underlyingBorrowToken.symbol}
              </div>
              <div>
                <b>Liquidation Reward:</b>{" "}
                {format(market.feeConfig.liquidationRewardPercent, 18 - 2)}%
              </div>
              <div>
                <b>Overdue Collateral Protocol:</b>{" "}
                {format(
                  market.feeConfig.overdueCollateralProtocolPercent,
                  18 - 2,
                )}
                %
              </div>
              <div>
                <b>Liquidation Collateral Protocol:</b>{" "}
                {format(market.feeConfig.collateralProtocolPercent, 18 - 2)}%
              </div>
              <div>
                <b>Fee Recipient:</b>{" "}
                <a
                  href={`${BASESCAN}/address/${market.feeConfig.feeRecipient.toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.feeConfig.feeRecipient.toString()}</code>
                </a>
              </div>
              <div>
                <b>CR Opening:</b> {format(market.riskConfig.crOpening, 18 - 2)}
                %
              </div>
              <div>
                <b>CR Liquidation:</b>{" "}
                {format(market.riskConfig.crLiquidation, 18 - 2)}%
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
                seconds ({Number(market.riskConfig.minTenor) / 3600} hours)
              </div>
              <div>
                <b>Max Tenor:</b> {market.riskConfig.maxTenor.toString()}{" "}
                seconds ({Number(market.riskConfig.maxTenor) / 3600 / 24 / 365}{" "}
                years)
              </div>
              <div>
                <b>Price Feed:</b>{" "}
                <a
                  href={`${BASESCAN}/address/${market.oracle.priceFeed.toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.oracle.priceFeed.toString()}</code>
                </a>
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
