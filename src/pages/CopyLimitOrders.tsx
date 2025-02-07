import { useContext, useState } from "react";
import { SizeContext } from "../contexts/SizeContext";

const CopyLimitOrders = () => {
  const { copyLimitOrders } = useContext(SizeContext);
  const [copyAddress, setCopyAddress] = useState("");

  return (
    <>
      <div className="copy-container">
        <div className="input-container">
          <div className="copy-address">
            <label>Copy Address</label>
            <input
              type="text"
              value={copyAddress}
              onChange={(e) => setCopyAddress(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            className="action-button"
            onClick={() => copyLimitOrders(copyAddress)}
          >
            Copy Limit Orders
          </button>
        </div>

        <div className="disclaimers">
          <small>*Unofficial Size application</small>
        </div>
      </div>
    </>
  );
};

export default CopyLimitOrders;
