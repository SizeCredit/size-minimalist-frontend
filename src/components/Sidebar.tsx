import { useAccount, useConnect, useDisconnect } from "wagmi";
import { format, smallId } from "../services/format";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import Blockies from "react-blockies";
import { formatDistance } from "date-fns/formatDistance";
import { SidebarContext } from "../contexts/SidebarContext";
import { SizeContext } from "../contexts/SizeContext";
import { compensateCandidates } from "../services/compensateCandidates";
import { PositionsContext } from "../contexts/PositionsContext";
import { PriceContext } from "../contexts/PriceContext";
import { SwapContext } from "../contexts/SwapContext";
import { RegistryContext } from "../contexts/RegistryContext";
import { ConfigContext } from "../contexts/ConfigContext";
import { pages } from "../App";

const CONNECTION_TIMEOUT = 5000;

const Sidebar = () => {
  const account = useAccount();
  const navigate = useNavigate();
  const { connectors, connect, error } = useConnect();
  const { price } = useContext(PriceContext);
  const { pastBlocks, setPastBlocks, chain } = useContext(ConfigContext);
  const { disconnect } = useDisconnect();
  const { market, markets, setMarketName } = useContext(RegistryContext);
  const { creditPositions: allCreditPositions } = useContext(PositionsContext);
  const { user, creditPositions, debtPositions } = useContext(UserContext);
  const { repay, compensate, sellCreditMarket } = useContext(SizeContext);
  const { collapsed, setCollapsed } = useContext(SidebarContext);
  const { sellCreditQuote } = useContext(SwapContext);
  const [timeouts, setTimeouts] = useState<NodeJS.Timeout[]>([]);

  const tryConnect = async () => {
    for (const connector of connectors) {
      try {
        // Attempt to connect with current connector
        connect({ connector });

        // Wait for either successful connection or timeout
        const success = await Promise.race([
          // Wait for connection
          new Promise((resolve) => {
            const checkConnection = setInterval(() => {
              if (account.status === "connected") {
                clearInterval(checkConnection);
                resolve(true);
              }
            }, 500);
          }),
          // Timeout after CONNECTION_TIMEOUT
          new Promise((resolve) => {
            const timeout = setTimeout(
              () => resolve(false),
              CONNECTION_TIMEOUT,
            );
            setTimeouts((prev) => [...prev, timeout]);
          }),
        ]);

        // If connected successfully, stop trying other connectors
        if (success) break;
      } catch (error) {
        console.error(`Failed to connect with connector:`, error);
        // Continue to next connector on error
      }
    }
  };

  useEffect(() => {
    toast.error(error?.message);
  }, [error]);

  useEffect(() => {
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [timeouts]);

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
                : () => tryConnect()
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
            &nbsp;&nbsp;
            <code className="chain">
              {chain?.chain.name ? `${chain.chain.name}` : ""}
            </code>
          </button>
        </div>
      </div>
      <div className="tabs">
        <div>Market</div>
      </div>
      <div className="market-info">
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
      <div className="past-blocks">
        <div className="past-blocks-content">
          <label>Past Blocks</label>
          <input
            type="number"
            value={Number(pastBlocks)}
            onChange={(e) => setPastBlocks(BigInt(e.target.value))}
          />
        </div>
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
                3,
              )}{" "}
              {market?.tokens.collateralToken.symbol}
            </b>
            &nbsp;&nbsp;
            <i>
              {format(
                user?.underlyingCollateralTokenBalance,
                market?.tokens.collateralToken.decimals,
                3,
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
              3,
            )}{" "}
            {market?.tokens.borrowAToken.symbol}
          </b>
          &nbsp;&nbsp;
          <i>
            {format(
              user?.underlyingBorrowTokenBalance,
              market?.tokens.borrowAToken.decimals,
              3,
            )}{" "}
            {market?.tokens.underlyingBorrowToken.symbol}
          </i>
        </div>
        <div>
          <span>
            <b>
              {format(user?.debtBalance, market?.tokens.debtToken.decimals, 3)}{" "}
              {market?.tokens.debtToken.symbol}
            </b>
          </span>
        </div>
      </div>
      <div className="tabs">
        <div>Pages</div>
      </div>
      <div className="pages-list">
        {pages.map((page) => (
          <div key={page.path} className="page-item">
            <button
              className="page-button button"
              onClick={() => navigate(page.path)}
            >
              {page.label}
            </button>
          </div>
        ))}
      </div>
      <div className="tabs">
        <div>Virtual TestNets</div>
      </div>

      <div className="vnet-list">
        <div className="vnet-chain-id">
          <label>Chain ID</label>
          <input type="number" defaultValue={chain?.chain.id} disabled />
        </div>
        <div className="vnet-rpc-url">
          <label>RPC URL</label>
          <input
            type="text"
            defaultValue={chain?.chain.rpcUrls?.default?.http[0]}
          />
        </div>
        <div className="vnet-block-explorer">
          <label>Block Explorer URL</label>
          <input
            type="text"
            defaultValue={chain?.chain.blockExplorers?.default?.url}
          />
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
