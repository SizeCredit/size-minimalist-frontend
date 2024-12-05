import { useAccount, useConnect, useDisconnect } from "wagmi";
import { format, smallId } from "../services/format";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import Blockies from "react-blockies";
import { formatDistance } from "date-fns/formatDistance";
import { SidebarContext } from "../contexts/SidebarContext";
import { isMobile } from "../services/isMobile";
import { SizeContext } from "../contexts/SizeContext";
import { compensateCandidates } from "../services/compensateCandidates";
import { PositionsContext } from "../contexts/PositionsContext";
import { PriceContext } from "../contexts/PriceContext";
import { SwapContext } from "../contexts/SwapContext";
import { FactoryContext } from "../contexts/FactoryContext";

const Sidebar = () => {
  const account = useAccount();
  const { connectors, connect, error } = useConnect();
  const { price } = useContext(PriceContext);
  const { disconnect } = useDisconnect();
  const { market, markets, setMarketName } = useContext(FactoryContext);
  const { creditPositions: allCreditPositions } = useContext(PositionsContext);
  const { user, creditPositions, debtPositions } = useContext(UserContext);
  const { repay, compensate, sellCreditMarket } = useContext(SizeContext);
  const { collapsed, setCollapsed } = useContext(SidebarContext);
  const { sellCreditQuote } = useContext(SwapContext);

  const connector = isMobile() ? connectors[1] : connectors[0];

  useEffect(() => {
    toast.error(error?.message);
  }, [error]);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="container-collapse">
        <button className="button-collapse" onClick={() => setCollapsed(true)}>
          » Collapse
        </button>
      </div>
      <div className="wallet-info">
        <div className="wallet-address">
          <button
            onClick={
              account.status === "connected"
                ? () => disconnect()
                : () => connect({ connector })
            }
            className="connect-button"
          >
            {account.status === "connected" ? (
              <Blockies
                seed={account.address as string}
                size={10}
                scale={3}
                className="blockies"
              />
            ) : null}
            &nbsp;
            <code className="address">
              {format(account.address) || "Connect wallet"}
            </code>
          </button>
        </div>
      </div>
      <div className="select-market">
        <label>Market</label>
        <select
          value={market?.description || ""}
          onChange={(e) => setMarketName(e.target.value)}
        >
          {markets.map((m) => (
            <option key={m.description} value={m.description}>
              {m.description}
            </option>
          ))}
        </select>
      </div>
      <div className="tabs">
        <div>Price</div>
      </div>
      <div className="price-info">
        <h5>
          {format(price)} {market?.tokens.underlyingCollateralToken.symbol}/
          {market?.tokens.underlyingBorrowToken.symbol}
        </h5>
      </div>
      <div className="tabs">
        <div>Balances</div>
      </div>
      <div className="balance-info">
        <div>
          <span>
            <b>
              {format(
                user?.collateralTokenBalance,
                market?.tokens.collateralToken.decimals,
                4,
              )}{" "}
              {market?.tokens.collateralToken.symbol}
            </b>
            &nbsp; &nbsp; &nbsp;
            <i>
              {format(
                user?.underlyingCollateralTokenBalance,
                market?.tokens.collateralToken.decimals,
                4,
              )}{" "}
              {market?.tokens.underlyingCollateralToken.symbol}
            </i>
          </span>
        </div>
        <div>
          <b>
            {format(
              user?.borrowATokenBalance,
              market?.tokens.borrowAToken.decimals,
              4,
            )}{" "}
            {market?.tokens.borrowAToken.symbol}
          </b>
          &nbsp; &nbsp; &nbsp;
          <i>
            {format(
              user?.underlyingBorrowTokenBalance,
              market?.tokens.borrowAToken.decimals,
              4,
            )}{" "}
            {market?.tokens.underlyingBorrowToken.symbol}
          </i>
        </div>
        <div>
          <span>
            <b>
              {format(user?.debtBalance, market?.tokens.debtToken.decimals, 4)}{" "}
              {market?.tokens.debtToken.symbol}
            </b>
          </span>
        </div>
      </div>
      <div className="tabs">
        <div>Positions</div>
      </div>
      <div className="position-list">
        {creditPositions
          .filter((e) => e.credit > 0)
          .map((creditPosition, index) => {
            const credit = Number(
              format(
                creditPosition.credit,
                market?.tokens.borrowAToken.decimals,
              ),
            );
            const tenor = Math.floor(
              (creditPosition.debtPosition.dueDate.getTime() -
                new Date().getTime()) /
                1000,
            );
            const quote = sellCreditQuote(credit, tenor);
            const sellAmount =
              credit / (1 + (quote.rate * tenor) / 365 / 24 / 60 / 60);
            console.log(sellAmount, quote, credit, tenor);
            return (
              <div key={index} className="position-item">
                <div className="position-details">
                  <div
                    className="position-name"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        creditPosition.creditPositionId,
                      )
                    }
                  >
                    Credit Position #{smallId(creditPosition.creditPositionId)}
                  </div>
                  <div className="position-amount positive">
                    {format(
                      creditPosition.credit,
                      market?.tokens.borrowAToken.decimals,
                    )}{" "}
                    {market?.tokens.underlyingBorrowToken.symbol}
                  </div>
                  <div className="">
                    Due{" "}
                    {formatDistance(
                      creditPosition.debtPosition.dueDate,
                      new Date(),
                    )}
                  </div>
                  {quote.rate > 0 ? (
                    <button
                      className="repay sell"
                      onClick={() =>
                        sellCreditMarket(
                          quote,
                          creditPosition.credit,
                          tenor,
                          BigInt(creditPosition.creditPositionId),
                        )
                      }
                    >
                      Sell for {format(sellAmount, 4)}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
      </div>
      <div className="position-list">
        {debtPositions
          .filter((e) => e.futureValue > 0)
          .map((debtPosition, index) => {
            const candidates = compensateCandidates(
              debtPosition,
              allCreditPositions,
              creditPositions,
            );
            const canCompensate =
              candidates.creditPositionsToCompensate.length > 0 &&
              candidates.creditPositionsWithDebtToRepay.length > 0;
            return (
              <div key={index} className="position-item">
                <div className="position-details">
                  <div
                    className="position-name"
                    onClick={() =>
                      navigator.clipboard.writeText(debtPosition.debtPositionId)
                    }
                  >
                    Debt Position #{debtPosition.debtPositionId}
                  </div>
                  <div className="position-amount negative">
                    {format(
                      debtPosition.futureValue,
                      market?.tokens.borrowAToken.decimals,
                    )}{" "}
                    {market?.tokens.underlyingBorrowToken.symbol}
                  </div>
                  <div className="">
                    Due {formatDistance(debtPosition.dueDate, new Date())}
                  </div>
                  <button
                    className="repay"
                    onClick={() => repay(debtPosition.debtPositionId)}
                  >
                    Repay
                  </button>
                  {canCompensate ? (
                    <button
                      className="repay compensate"
                      onClick={() =>
                        compensate(
                          candidates.creditPositionsWithDebtToRepay[0]
                            .creditPositionId,
                          candidates.creditPositionsToCompensate[0]
                            .creditPositionId,
                        )
                      }
                    >
                      <span>Compensate</span>{" "}
                      <small>
                        #
                        {smallId(
                          candidates.creditPositionsToCompensate[0]
                            .creditPositionId,
                        )}
                      </small>
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Sidebar;
