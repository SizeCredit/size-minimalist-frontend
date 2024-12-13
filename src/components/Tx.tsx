import { useState, useEffect } from "react";
import { createWalletClient } from "viem";
import { custom } from "viem";
import { sendTransaction, readContract } from "viem/actions";
import { useAccount } from "wagmi";
import * as chains from "viem/chains";

const Tx = () => {
  const [safe, setSafe] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [calldata, setCalldata] = useState("");
  const [signature, setSignature] = useState("");
  const { address, chainId } = useAccount();

  const chain = Object.values(chains).find((c) => c.id === chainId);

  const client = createWalletClient({
    chain: chain,
    transport: custom(window.ethereum),
  });

  const sendTx = () => {
    sendTransaction(client, {
      to: to as `0x${string}`,
      value: BigInt(amount),
      data: calldata as `0x${string}`,
      account: address as `0x${string}`,
    });
  };

  const signSafeTx = async () => {
    const safeAbi = [
      "function getTransactionHash(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 _nonce) external view returns (bytes32)",
    ];
    const transactionHash = await readContract(client, {
      address: safe as `0x${string}`,
      abi: safeAbi,
      functionName: "getTransactionHash",
      args: [
        // TODO fix args
        to as `0x${string}`,
        BigInt(amount),
        calldata as `0x${string}`,
        0,
        0,
        0,
        address as `0x${string}`,
        address as `0x${string}`,
        0,
      ],
    });
  };

  return (
    <>
      <div className="tx-container">
        <div className="tx-input">
          <label>Safe</label>
          <input
            type="text"
            value={safe}
            onChange={(e) => setSafe(e.target.value)}
          />
        </div>
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
        <div className="tx-signature">
          <textarea value={signature} readOnly />
        </div>
        <div className="tx-button">
          <button className="action-button" onClick={() => sendTx()}>
            Send
          </button>
          <button className="action-button" onClick={() => signSafeTx()}>
            Sign Safe Tx
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
