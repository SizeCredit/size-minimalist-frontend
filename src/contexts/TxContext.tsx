import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { delayed } from "../services/delayed";
import { Address, decodeFunctionData, Transaction } from "viem";
import { usePublicClient } from "wagmi";
import { RegistryContext } from "./RegistryContext";
import { ConfigContext } from "./ConfigContext";
import Size from "../abi/Size.json";

const RPC_REQUESTS_PER_SECOND = 10;

interface Tx {
  hash: string;
  data: string;
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
  const { blockNumber, pastBlocks } = useContext(ConfigContext);
  const { market } = useContext(RegistryContext);

  console.log(market, blockNumber);

  const client = usePublicClient();
  async function getTransactions(
    address: Address,
    startBlock: bigint,
    endBlock: bigint,
  ) {
    const blocks = Array.from(
      { length: Number(endBlock) - Number(startBlock) },
      (_, i) => startBlock + BigInt(i),
    );

    const allTxs = await delayed(
      blocks.map(
        (blockNumber) => () =>
          client.getBlock({
            blockNumber,
            includeTransactions: true,
          }),
      ),
      RPC_REQUESTS_PER_SECOND,
      (finished) => setProgress(((finished - 1) * 100) / blocks.length),
    );

    const txs = allTxs.flatMap((block) =>
      block.transactions.filter(
        (tx) => tx.to?.toLowerCase() === address.toLowerCase(),
      ),
    );

    return txs;
  }

  function getTxs(txs: Transaction[]): Tx[] {
    const calldatas = txs.map((tx) => tx.input);
    const decodedCalldatas = calldatas
      .map((calldata) => {
        const decoded = decodeFunctionData({
          abi: Size.abi,
          data: calldata,
        });
        return decoded;
      })
      .map(
        (functionData) =>
          `${functionData.functionName}(${functionData.args?.map((arg) => (arg as string).toString()).join(", ")})`,
      );

    return txs.map((tx, index) => ({
      hash: tx.hash,
      data: decodedCalldatas[index],
    }));
  }

  useEffect(() => {
    if (!market || !blockNumber) return;

    (async () => {
      setProgress(0);
      const txs = await getTransactions(
        market.address,
        blockNumber - pastBlocks,
        blockNumber,
      );
      const decodedTxs = getTxs(txs);
      setTransactions(decodedTxs);
      setProgress(100);
    })();
  }, [market, blockNumber]);

  return (
    <TxContext.Provider value={{ transactions, progress }}>
      {children}
    </TxContext.Provider>
  );
}
