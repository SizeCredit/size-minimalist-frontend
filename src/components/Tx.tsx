import { useState } from "react";
import {
  createWalletClient,
  encodeFunctionData,
  parseAbi,
  zeroAddress,
} from "viem";
import { custom } from "viem";
import { sendTransaction, readContract, signTypedData } from "viem/actions";
import { useAccount } from "wagmi";
import * as chains from "viem/chains";

const Tx = () => {
  const [safe, setSafe] = useState(zeroAddress as `0x${string}`);
  const [to, setTo] = useState(zeroAddress as `0x${string}`);
  const [amount, setAmount] = useState("0");
  const [calldataEncode1, setCalldataEncode1] = useState(
    "transfer(address,uint256) 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 1234567",
  );
  const [calldata, setCalldata] = useState("0x");
  const [signatures, setSignatures] = useState("0x");
  const safeExecTransactionCalldata = `execTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes) ${to} ${amount} ${calldata} 0 0 0 0 ${zeroAddress} ${zeroAddress} ${signatures}`;
  const [signature, setSignature] = useState("0x");
  const { address, chainId } = useAccount();

  const chain = Object.values(chains).find((c) => c.id === chainId);

  console.log(safeExecTransactionCalldata);

  const [
    safeExecTransactionFunctionSignature,
    ...safeExecTransactionCalldataArgs
  ] = safeExecTransactionCalldata.split(" ");
  const safeExecTransactionCalldataFunctionName =
    safeExecTransactionFunctionSignature.split("(")[0];
  const safeExecTransactionCalldataEncoded = encodeFunctionData({
    abi: parseAbi([
      `function ${safeExecTransactionFunctionSignature}`,
    ] as string[]),
    args: safeExecTransactionCalldataArgs,
    functionName: safeExecTransactionCalldataFunctionName,
  });

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
    const safeAbi = parseAbi([
      "function getTransactionHash(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 _nonce) external view returns (bytes32)",
      "function nonce() external view returns (uint256)",
    ]);
    const nonce = (await readContract(client, {
      address: safe as `0x${string}`,
      abi: safeAbi,
      functionName: "nonce",
    })) as bigint;
    const signature = await signTypedData(client, {
      account: address as `0x${string}`,
      domain: {
        chainId: chainId as number,
        verifyingContract: safe as `0x${string}`,
      },
      message: {
        to: to as `0x${string}`,
        value: BigInt(amount),
        data: calldata as `0x${string}`,
        operation: 0,
        safeTxGas: 0n,
        baseGas: 0n,
        gasPrice: 0n,
        gasToken: zeroAddress as `0x${string}`,
        refundReceiver: zeroAddress as `0x${string}`,
        nonce: nonce,
      },
      primaryType: "SafeTx",
      types: {
        SafeTx: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "data", type: "bytes" },
          { name: "operation", type: "uint8" },
          { name: "safeTxGas", type: "uint256" },
          { name: "baseGas", type: "uint256" },
          { name: "gasPrice", type: "uint256" },
          { name: "gasToken", type: "address" },
          { name: "refundReceiver", type: "address" },
          { name: "nonce", type: "uint256" },
        ],
      },
    });
    setSignature(signature);
  };

  const encodeCalldata = () => {
    const [functionSignature, ...args] = calldataEncode1.split(" ");
    const functionName = functionSignature.split("(")[0];
    const calldata = encodeFunctionData({
      abi: parseAbi([`function ${functionSignature}`] as string[]),
      args: args,
      functionName,
    });
    setCalldata(calldata);
  };

  return (
    <>
      <div className="tx-container">
        <div className="tx-input">
          <label>Calldata Encode</label>
          <input
            type="text"
            value={calldataEncode1}
            onChange={(e) => setCalldataEncode1(e.target.value)}
          />
        </div>
        <div className="tx-grid">
          <button className="action-button" onClick={() => encodeCalldata()}>
            Encode Calldata
          </button>
          <div className="tx-input">&nbsp;</div>
          <div className="tx-input">
            <label>Safe</label>
            <input
              type="text"
              value={safe}
              onChange={(e) => setSafe(e.target.value as `0x${string}`)}
            />
          </div>
          <button className="action-button" onClick={() => signSafeTx()}>
            Sign Safe Tx
          </button>
          <div className="tx-input">&nbsp;</div>
        </div>
        <div className="tx-signature">
          <textarea
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              width: "100%",
            }}
            value={signature}
            readOnly
          />{" "}
        </div>

        <div className="tx-input">
          <label>Signatures</label>
          <input
            type="text"
            value={signatures}
            onChange={(e) => setSignatures(e.target.value)}
          />
        </div>

        <div>&nbsp;</div>
        <div className="tx-signature">
          <label>Safe Exec Transaction Calldata Encoded</label>
          <textarea
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              width: "100%",
            }}
            value={safeExecTransactionCalldataEncoded}
            readOnly
          />
        </div>
        <div>&nbsp;</div>

        <div className="tx-input">
          <label>To</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value as `0x${string}`)}
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
        <button className="action-button" onClick={() => sendTx()}>
          Send
        </button>

        <div className="disclaimers">
          <small>*Unofficial Size application</small>
        </div>
      </div>
    </>
  );
};

export default Tx;
