import { useContext, useState } from "react";
import { parseUnits } from "ethers";
import { SizeContext } from "../contexts/SizeContext";
import { RegistryContext, Token } from "../contexts/RegistryContext";

const actions = ["Deposit", "Withdraw"];

const Funding = () => {
  const { market } = useContext(RegistryContext);
  const [action, setAction] = useState(actions[0]);

  const depositTokens: Token[] = [
    "underlyingCollateralToken",
    "underlyingBorrowToken",
  ];

  const { deposit, withdraw } = useContext(SizeContext);
  const [token, setToken] = useState<Token>(depositTokens[0]);
  const [amount, setAmount] = useState("0");

  const onClick = () =>
    action === actions[0]
      ? deposit(
          market?.data[token] as string,
          parseUnits(amount, market?.tokens[token].decimals),
        )
      : withdraw(
          market?.data[token] as string,
          parseUnits(amount, market?.tokens[token].decimals),
        );

  return (
    <>
      <div className="funding-container">
        <div className="input-container">
          <div className="deposit">
            <select onChange={(e) => setAction(e.target.value)}>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="w-80"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              onChange={(e) =>
                setToken(
                  depositTokens.find(
                    (x) => market?.tokens[x].symbol === e.target.value,
                  )!,
                )
              }
            >
              {depositTokens.map((token) => (
                <option
                  key={market?.tokens[token].symbol}
                  value={market?.tokens[token].symbol}
                >
                  {market?.tokens[token].symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="action-button" onClick={onClick}>
          {action}
        </button>

        <div className="disclaimers">
          <small>*Unofficial Size application</small>
        </div>
      </div>
    </>
  );
};

export default Funding;
