import { useContext, useState } from "react";
import { TxContext } from "../contexts/TxContext";
import { useReadContract } from "wagmi";
import { parseAbi } from "viem";
import { format } from "../services/format";
import { ConfigContext } from "../contexts/ConfigContext";

const Tx = () => {
  const { BASESCAN, chain } = useContext(ConfigContext);
  const { transactions } = useContext(TxContext);
  const [gasPrice, setGasPrice] = useState(8);
  const latestAnswer = useReadContract({
    address: chain.addresses.ChainlinkETHUSDPriceFeed,
    abi: parseAbi(["function latestAnswer() external view returns (uint256)"]),
    functionName: "latestAnswer",
  });
  const price = Number(latestAnswer.data) / 1e8;

  return (
    <>
      <div className="tx-container">
        <div className="tx-list">
          <div>
            <label>Gas price (Gwei)</label>
            &nbsp;
            <input
              type="number"
              value={gasPrice}
              onChange={(e) => setGasPrice(Number(e.target.value))}
            />
          </div>
          <table className="tx-table">
            <thead>
              <tr>
                <th>Hash</th>
                <th>Data</th>
                <th>Tx Cost ($)</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={index}>
                  <td>
                    <a
                      href={`${BASESCAN}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tx.hash}
                    </a>
                  </td>
                  <td>{tx.data}</td>
                  <td>
                    {format((Number(tx.gasUsed) * gasPrice * price) / 1e9)}
                  </td>
                </tr>
              ))}
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

export default Tx;
