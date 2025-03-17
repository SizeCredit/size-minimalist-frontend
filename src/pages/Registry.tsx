import { useContext } from "react";
import { RegistryContext } from "../contexts/RegistryContext";
import { format } from "../services/format";
import { ConfigContext } from "../contexts/ConfigContext";

const Registry = () => {
  const { chain } = useContext(ConfigContext);
  const { markets } = useContext(RegistryContext);

  if (!chain) return <div>Loading...</div>;

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
                  href={`${chain.explorer}/address/${market.address}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.address}</code>
                </a>
              </div>
              <div>
                <b>Collateral Token:</b>{" "}
                <a
                  href={`${chain.explorer}/token/${market.data.collateralToken.toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.data.collateralToken.toString()}</code>
                </a>
              </div>
              <div>
                &nbsp;&nbsp; Total Supply:{" "}
                {format(
                  market.tokens.collateralToken.totalSupply,
                  market.tokens.collateralToken.decimals,
                  3,
                  ",",
                )}{" "}
                {market.tokens.collateralToken.symbol}
              </div>
              <div>
                <b>Borrow AToken:</b>{" "}
                <a
                  href={`${chain.explorer}/token/${market.data.borrowAToken.toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.data.borrowAToken.toString()}</code>
                </a>
              </div>
              <div>
                &nbsp;&nbsp; Total Supply:{" "}
                {format(
                  market.tokens.borrowAToken.totalSupply,
                  market.tokens.borrowAToken.decimals,
                  3,
                  ",",
                )}{" "}
                {market.tokens.borrowAToken.symbol}
              </div>
              <div>
                <b>Debt Token:</b>{" "}
                <a
                  href={`${chain.explorer}/token/${market.data.debtToken.toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.data.debtToken.toString()}</code>
                </a>
              </div>
              <div>
                &nbsp;&nbsp; Total Supply:{" "}
                {format(
                  market.tokens.debtToken.totalSupply,
                  market.tokens.debtToken.decimals,
                  3,
                  ",",
                )}{" "}
                {market.tokens.debtToken.symbol}
              </div>
              <div>
                <b>Underlying Collateral Token:</b>{" "}
                <a
                  href={`${chain.explorer}/token/${market.data.underlyingCollateralToken.toString()}`}
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
                  href={`${chain.explorer}/token/${market.data.underlyingBorrowToken.toString()}`}
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
                  href={`${chain.explorer}/address/${market.feeConfig.feeRecipient.toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.feeConfig.feeRecipient.toString()}</code>
                </a>
              </div>
              <div>
                &nbsp;&nbsp; Fees:{" "}
                {format(
                  market.tokens.borrowAToken.feeRecipientBalance,
                  market.tokens.borrowAToken.decimals,
                )}{" "}
                {market.tokens.borrowAToken.symbol}{" "}
                {format(
                  market.tokens.collateralToken.feeRecipientBalance,
                  market.tokens.collateralToken.decimals,
                )}{" "}
                {market.tokens.collateralToken.symbol}
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
                  market.tokens.borrowAToken.decimals,
                )}{" "}
                {market.tokens.underlyingBorrowToken.symbol}
              </div>
              <div>
                <b>Borrow A Token Cap:</b>{" "}
                {format(
                  market.riskConfig.borrowATokenCap,
                  market.tokens.borrowAToken.decimals,
                  0,
                  ",",
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
                  href={`${chain.explorer}/address/${market.oracle.priceFeed.toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{market.oracle.priceFeed.toString()}</code>
                </a>
              </div>
              <div>
                <div>
                  &nbsp;&nbsp; Price:{" "}
                  {format(market.priceFeed.price, 18, 2, ",")}{" "}
                  {market.tokens.underlyingCollateralToken.symbol} {"/"}{" "}
                  {market.tokens.underlyingBorrowToken.symbol}
                </div>
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

export default Registry;
