import { useContext, useState } from "react";
import { SizeContext } from "../contexts/SizeContext";
import { UserContext } from "../contexts/UserContext";
import { formatUnits, parseUnits } from "viem";

const PERCENT_DECIMALS = 16;

const CopyLimitOrders = () => {
  const { copyLimitOrders } = useContext(SizeContext);
  const { user } = useContext(UserContext);

  if (!user) {
    return <div>Loading...</div>;
  }

  const [copyAddress, setCopyAddress] = useState(
    (user?.userCopyLimitOrders.copyAddress as string) || "",
  );
  const [loanOffsetAPR, setLoanOffsetAPR] = useState(
    formatUnits(
      BigInt(user?.userCopyLimitOrders.copyLoanOffer.offsetAPR || 0),
      PERCENT_DECIMALS,
    ),
  );
  const [borrowOffsetAPR, setBorrowOffsetAPR] = useState(
    formatUnits(
      BigInt(user?.userCopyLimitOrders.copyBorrowOffer.offsetAPR || 0),
      PERCENT_DECIMALS,
    ),
  );

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

        <div className="input-container">
          <div className="loan-offset-apr">
            <label>Loan Offset APR (%)</label>
            <input
              type="text"
              value={loanOffsetAPR}
              onChange={(e) => setLoanOffsetAPR(e.target.value)}
            />
          </div>
        </div>

        <div className="input-container">
          <div className="borrow-offset-apr">
            <label>Borrow Offset APR (%)</label>
            <input
              type="text"
              value={borrowOffsetAPR}
              onChange={(e) => setBorrowOffsetAPR(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            className="action-button"
            onClick={() =>
              copyLimitOrders(
                copyAddress,
                parseUnits(loanOffsetAPR, PERCENT_DECIMALS),
                parseUnits(borrowOffsetAPR, PERCENT_DECIMALS),
              )
            }
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
