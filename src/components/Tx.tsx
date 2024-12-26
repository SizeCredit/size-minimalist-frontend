import { useContext } from "react";
import { TxContext } from "../contexts/TxContext";

const Tx = () => {
  const { transactions } = useContext(TxContext);

  return (
    <>
      <div className="tx-container">
        <div className="tx-list">
          {transactions.map((tx, index) => (
            <div key={index} className="tx-item">
              <div className="tx-item-hash">{tx.hash}</div>
              <div className="tx-item-data">{tx.data}</div>
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

export default Tx;
