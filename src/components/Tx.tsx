import { useState } from "react";
import { createWalletClient } from "viem";
import { custom } from "viem";
import { sendTransaction } from "viem/actions";
import { useAccount } from "wagmi";
import * as chains from "viem/chains";

const Tx = () => {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [calldata, setCalldata] = useState("");
  const { address, chainId } = useAccount();

  const chain = Object.values(chains).find((c) => c.id === chainId);

  const sendTx = () => {
    const client = createWalletClient({
      chain: chain,
      transport: custom(window.ethereum),
    });
    sendTransaction(client, {
      to: to as `0x${string}`,
      value: BigInt(amount),
      data: calldata as `0x${string}`,
      account: address as `0x${string}`,
    });
  };

  return (
    <>
      <div className="tx-container">
        <div className="tx-grid">
          <div className="tx-input">
            <label>To</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="tx-input">
            <label>Amount</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="tx-input">
            <label>Calldata</label>
            <input
              type="text"
              value={calldata}
              onChange={(e) => setCalldata(e.target.value)}
            />
          </div>
        </div>
        <div className="tx-button">
          <button className="action-button" onClick={() => sendTx()}>
            Send
          </button>
        </div>
        <div className="disclaimers">
          <small>*Unofficial Size application</small>
        </div>
      </div>
    </>
  );
};

export default Tx;
