import { createContext, ReactNode, useEffect, useState } from "react";
import { delayed } from "../services/delayed";
import {
  Address,
  decodeFunctionData,
  Transaction,
  TransactionReceipt,
} from "viem";
import { usePublicClient } from "wagmi";
import Size from "../abi/Size.json";
import FlashLoanLiquidator from "../abi/FlashLoanLiquidator.json";
import txHashes from "../txs/txHash.json";

const RPC_REQUESTS_PER_SECOND = 4;

export interface Tx {
  hash: string;
  data: string;
  gasUsed: bigint;
}

interface TxContext {
  transactions: Tx[];
  progress: number;
}

export const TxContext = createContext<TxContext>({} as TxContext);

type Props = {
  children: ReactNode;
};

export function TxProvider({ children }: Props) {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [progress, setProgress] = useState(0);

  const client = usePublicClient();
  async function getTransactions(txHashes: Address[]): Promise<void> {
    const txPromises = txHashes.map(
      (hash) => () =>
        Promise.all([
          client.getTransaction({ hash }),
          client.getTransactionReceipt({ hash }),
        ]),
    );

    await delayed(txPromises, RPC_REQUESTS_PER_SECOND, (_, partialResults) => {
      getTxs(partialResults as [Transaction, TransactionReceipt][]);
    });
  }

  function decode(arg: string[]): string {
    return arg
      .map(
        (a) =>
          decodeFunctionData({
            abi: [...Size.abi, ...FlashLoanLiquidator.abi],
            data: a as `0x${string}`,
          }).functionName,
      )
      .join(", ");
  }

  function getTxs(txInfo: [Transaction, TransactionReceipt][]): void {
    const calldatas = txInfo.map((tx) => tx[0].input);
    const decodedCalldatas = calldatas
      .map((calldata) => {
        const decoded = decodeFunctionData({
          abi: [...Size.abi, ...FlashLoanLiquidator.abi],
          data: calldata,
        });
        return decoded;
      })
      .map((functionData) =>
        functionData.functionName === "multicall"
          ? `${functionData.functionName}([${functionData.args?.map((arg) => decode(arg as unknown as string[])).join(",")}])`
          : functionData.functionName,
      );

    const decodedTxs = txInfo.map((tx, index) => ({
      hash: tx[0].hash,
      data: decodedCalldatas[index],
      gasUsed: tx[1].gasUsed,
    }));

    setProgress((100 * decodedTxs.length) / txHashes.length);

    setTransactions(decodedTxs);
  }

  useEffect(() => {
    (async () => {
      setProgress(0);
      await getTransactions(txHashes as Address[]);
      setProgress(100);
    })();
  }, []);

  return (
    <TxContext.Provider value={{ transactions, progress }}>
      {children}
    </TxContext.Provider>
  );
}
