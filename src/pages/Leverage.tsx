import { useContext, useEffect, useState } from "react";
import { LeverageContext } from "../contexts/LeverageContext";
import { ConfigContext } from "../contexts/ConfigContext";
import { Action } from "../services/Authorization";
import { AuthorizationContext } from "../contexts/AuthorizationContext";
import { Address, parseUnits } from "viem";
import { RegistryContext, TokenInformation } from "../contexts/RegistryContext";

const Leverage = () => {
  const { chainInfo } = useContext(ConfigContext);
  const { market } = useContext(RegistryContext);

  const { approve, leverageUpWithSwap } = useContext(LeverageContext);
  const { setAuthorization } = useContext(AuthorizationContext);
  const [amount, setAmount] = useState<string>("1000");
  const [token, setToken] = useState<TokenInformation | undefined>();
  const [lender, setLender] = useState<Address>(
    "0x04B4c8281B5d2D7aBee794bf3Ab3c95a02FF246f",
  );
  const [leveragePercent, setLeveragePercent] = useState<number>(600);
  const [borrowPercent, setBorrowPercent] = useState<number>(97);

  const tokens = [
    market?.tokens.underlyingCollateralToken,
    market?.tokens.underlyingBorrowToken,
  ];

  useEffect(() => {
    setToken(market?.tokens.underlyingCollateralToken);
  }, [market]);

  if (!chainInfo || !market || !token) {
    return <div>Loading...</div>;
  }


  return (
    <div className="leverage-container">
      <div className="input-container">
        <div className="set-authorization">
          <label>1. Set Authorization</label>
          <div>
            <button
              className="action-button"
              onClick={() =>
                setAuthorization(chainInfo.addresses.LeverageUp as Address, [
                  Action.SELL_CREDIT_MARKET,
                ])
              }
            >
              Authorize SELL_CREDIT_MARKET
            </button>
          </div>
        </div>
      </div>
      <div className="input-container">
        <div className="set-authorization">
          <label>2. Approve</label>
          <div>
            <label>Amount</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label>Token</label>
            <select
              onChange={(e) =>
                setToken(
                  tokens.find((token) => token!.symbol === e.target.value)!,
                )
              }
            >
              {tokens.map((token, index) => (
                <option key={token!.symbol || index} value={token!.symbol}>
                  {token!.symbol}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              className="action-button"
              onClick={() =>
                approve(
                  token.address,
                  parseUnits(amount.toString(), token.decimals),
                )
              }
            >
              Approve
            </button>
          </div>
        </div>
      </div>
      <div className="input-container">
        <div className="set-authorization">
          <label>3. Leverage Up</label>
          <div>
            <label>Lender</label>
            <input
              type="text"
              value={lender}
              onChange={(e) => setLender(e.target.value as Address)}
            />
          </div>
          <div>
            <label>Leverage Percent</label>
            <div>
              <input
                type="number"
                value={leveragePercent}
                onChange={(e) => setLeveragePercent(Number(e.target.value))}
              />
              <span>%</span>
            </div>
          </div>
          <div>
            <label>Borrow Percent</label>
            <div>
              <input
                type="number"
                value={borrowPercent}
                onChange={(e) => setBorrowPercent(Number(e.target.value))}
              />
              <span>%</span>
            </div>
          </div>
          <div>
            <button
              className="action-button"
              onClick={() =>
                leverageUpWithSwap(
                  token.address,
                  parseUnits(amount.toString(), token.decimals),
                  lender,
                  parseUnits(leveragePercent.toString(), 16),
                  parseUnits(borrowPercent.toString(), 16),
                )
              }
            >
              Leverage Up
            </button>
          </div>
        </div>
        <div className="set-authorization">
          <label>4. Revoke Authorization</label>
          <div>
            <button
              className="action-button"
              onClick={() =>
                setAuthorization(chainInfo.addresses.LeverageUp as Address, [])
              }
            >
              Revoke Authorization
            </button>
          </div>
        </div>
      </div>
      <div className="disclaimers">
        <small>*Unofficial Size application</small>
        <small>*NO SLIPPAGE PROTECTION</small>
      </div>
    </div>
  );
};

export default Leverage;
