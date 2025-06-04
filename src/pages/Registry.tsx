import { useContext } from "react";
import { RegistryContext } from "../contexts/RegistryContext";
import { format } from "../services/format";
import { addressUrl } from "../services/addressUrl";
import { tokenUrl } from "../services/tokenUrl";

const Registry = () => {
  const { markets } = useContext(RegistryContext);

  return (
    <>
      <div className="registry-container">
        <div className="table-responsive">
          <table className="registry-table">
            <thead>
              <tr>
                <th>Configuration</th>
                {markets.map((market) => (
                  <th key={market.address}>{market.description}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Market Information */}
              <tr className="section-header">
                <td colSpan={markets.length + 1}>Market Information</td>
              </tr>
              <tr>
                <td>Address</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    <a
                      href={addressUrl(market.chainInfo.chain, market.address)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <code>{market.address}</code>
                    </a>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Chain</td>
                {markets.map((market) => (
                  <td key={market.address}>{market.chainInfo.chain.name}</td>
                ))}
              </tr>

              {/* Tokens */}
              <tr className="section-header">
                <td colSpan={markets.length + 1}>Token Information</td>
              </tr>
              <tr>
                <td>Collateral Token</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    <a
                      href={tokenUrl(
                        market.chainInfo.chain,
                        market.data.collateralToken.toString(),
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <code>{market.data.collateralToken.toString()}</code>
                    </a>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Collateral Token Total Supply</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(
                      market.tokens.collateralToken.totalSupply,
                      market.tokens.collateralToken.decimals,
                      3,
                      ",",
                    )}{" "}
                    {market.tokens.collateralToken.symbol}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Borrow AToken</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    <a
                      href={tokenUrl(
                        market.chainInfo.chain,
                        market.data.borrowAToken.toString(),
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <code>{market.data.borrowAToken.toString()}</code>
                    </a>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Borrow AToken Total Supply</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(
                      market.tokens.borrowAToken.totalSupply,
                      market.tokens.borrowAToken.decimals,
                      3,
                      ",",
                    )}{" "}
                    {market.tokens.borrowAToken.symbol}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Debt Token</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    <a
                      href={tokenUrl(
                        market.chainInfo.chain,
                        market.data.debtToken.toString(),
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <code>{market.data.debtToken.toString()}</code>
                    </a>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Debt Token Total Supply</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(
                      market.tokens.debtToken.totalSupply,
                      market.tokens.debtToken.decimals,
                      3,
                      ",",
                    )}{" "}
                    {market.tokens.debtToken.symbol}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Underlying Collateral Token</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    <a
                      href={tokenUrl(
                        market.chainInfo.chain,
                        market.data.underlyingCollateralToken.toString(),
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <code>
                        {market.data.underlyingCollateralToken.toString()}
                      </code>
                    </a>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Underlying Borrow Token</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    <a
                      href={tokenUrl(
                        market.chainInfo.chain,
                        market.data.underlyingBorrowToken.toString(),
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <code>
                        {market.data.underlyingBorrowToken.toString()}
                      </code>
                    </a>
                  </td>
                ))}
              </tr>

              {/* Fee Configuration */}
              <tr className="section-header">
                <td colSpan={markets.length + 1}>Fee Configuration</td>
              </tr>
              <tr>
                <td>Swap Fee APR</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(market.feeConfig.swapFeeAPR, 18 - 2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td>Fragmentation Fee</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(market.feeConfig.fragmentationFee, 18)}{" "}
                    {market.tokens.underlyingBorrowToken.symbol}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Liquidation Reward</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(market.feeConfig.liquidationRewardPercent, 18 - 2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td>Overdue Collateral Protocol</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(
                      market.feeConfig.overdueCollateralProtocolPercent,
                      18 - 2,
                    )}
                    %
                  </td>
                ))}
              </tr>
              <tr>
                <td>Liquidation Collateral Protocol</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(market.feeConfig.collateralProtocolPercent, 18 - 2)}
                    %
                  </td>
                ))}
              </tr>
              <tr>
                <td>Fee Recipient</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    <a
                      href={addressUrl(
                        market.chainInfo.chain,
                        market.feeConfig.feeRecipient.toString(),
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <code>{market.feeConfig.feeRecipient.toString()}</code>
                    </a>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Fees</td>
                {markets.map((market) => (
                  <td key={market.address}>
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
                  </td>
                ))}
              </tr>

              {/* Risk Configuration */}
              <tr className="section-header">
                <td colSpan={markets.length + 1}>Risk Configuration</td>
              </tr>
              <tr>
                <td>CR Opening</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(market.riskConfig.crOpening, 18 - 2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td>CR Liquidation</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(market.riskConfig.crLiquidation, 18 - 2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td>Min Borrow A Token</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(
                      market.riskConfig.minimumCreditBorrowAToken,
                      market.tokens.borrowAToken.decimals,
                      market.tokens.borrowAToken.decimals,
                    )}{" "}
                    {market.tokens.underlyingBorrowToken.symbol}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Borrow A Token Cap</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(
                      market.riskConfig.borrowATokenCap,
                      market.tokens.borrowAToken.decimals,
                      0,
                      ",",
                    )}{" "}
                    {market.tokens.underlyingBorrowToken.symbol}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Min Tenor</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {market.riskConfig.minTenor.toString()} seconds (
                    {Number(market.riskConfig.minTenor) / 3600} hours)
                  </td>
                ))}
              </tr>
              <tr>
                <td>Max Tenor</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {market.riskConfig.maxTenor.toString()} seconds (
                    {Number(market.riskConfig.maxTenor) / 3600 / 24 / 365}{" "}
                    years)
                  </td>
                ))}
              </tr>

              {/* Oracle & Admin */}
              <tr className="section-header">
                <td colSpan={markets.length + 1}>Oracle & Admin</td>
              </tr>
              <tr>
                <td>Price Feed</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    <a
                      href={addressUrl(
                        market.chainInfo.chain,
                        market.oracle.priceFeed.toString(),
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <code>{market.oracle.priceFeed.toString()}</code>
                    </a>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Price</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {format(market.priceFeed.price, 18, 2, ",")}{" "}
                    {market.tokens.underlyingCollateralToken.symbol} {"/"}{" "}
                    {market.tokens.underlyingBorrowToken.symbol}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Variable Pool Borrow Rate Stale Interval</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    {market.oracle.variablePoolBorrowRateStaleRateInterval.toString()}{" "}
                    seconds
                  </td>
                ))}
              </tr>
              <tr>
                <td>Admin</td>
                {markets.map((market) => (
                  <td key={market.address}>
                    <a
                      href={addressUrl(
                        market.chainInfo.chain,
                        market.admin.toString(),
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <code>{market.admin.toString()}</code>
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="disclaimers">
          <small>*Unofficial Size application</small>
        </div>
      </div>
    </>
  );
};

export default Registry;
