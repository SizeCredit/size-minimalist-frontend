import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ConfigContext } from "./ConfigContext";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { delayed } from "../services/delayed";
import { deduplicate } from "../services/deduplicate";
import { UserViewStruct } from "../typechain/Size";
import { readContract } from "wagmi/actions";
import { config } from "../wagmi";
import { RegistryContext } from "./RegistryContext";
import Size from "../abi/Size.json";

const RPC_REQUESTS_PER_SECOND = 10;

export interface YieldCurve {
  tenors: number[];
  aprs: number[];
  marketRateMultipliers: number[];
}

export interface LimitOrder {
  user: UserViewStruct;
  maxDueDate: Date;
  curveRelativeTime: YieldCurve;
}

interface LimitOrdersContext {
  borrowOffers: LimitOrder[];
  loanOffers: LimitOrder[];
  progress: number;
}

export const LimitOrdersContext = createContext<LimitOrdersContext>(
  {} as LimitOrdersContext,
);

type Props = {
  children: ReactNode;
};

export function LimitOrdersProvider({ children }: Props) {
  const [context, setContext] = useState<Omit<LimitOrdersContext, "progress">>({
    borrowOffers: [],
    loanOffers: [],
  });
  const [progress, setProgress] = useState(0);

  const { blockNumber, pastBlocks } = useContext(ConfigContext);
  const { market } = useContext(RegistryContext);

  const publicClient = usePublicClient();

  useEffect(() => {
    (async () => {
      if (!market || !blockNumber) return;

      setProgress(0);
      const [sellCreditLimit, buyCreditLimit] = await Promise.all([
        publicClient.getLogs({
          address: market.address,
          event: parseAbiItem(
            "event SellCreditLimit(uint256 indexed maxDueDate, uint256[] curveRelativeTimeTenors, int256[] curveRelativeTimeAprs, uint256[] curveRelativeTimeMarketRateMultipliers)",
          ),
          fromBlock: blockNumber - pastBlocks,
        }),
        publicClient.getLogs({
          address: market.address,
          event: parseAbiItem(
            "event BuyCreditLimit(uint256 indexed maxDueDate, uint256[] curveRelativeTimeTenors, int256[] curveRelativeTimeAprs, uint256[] curveRelativeTimeMarketRateMultipliers)",
          ),
          fromBlock: blockNumber - pastBlocks,
        }),
      ]);
      const transactionHashes = [
        ...Array.from(sellCreditLimit),
        ...Array.from(buyCreditLimit),
      ].map((log) => log.transactionHash);
      const transactionPromises = transactionHashes.map(
        (hash) => () => publicClient.getTransaction({ hash }),
      );
      const txs = await delayed(
        transactionPromises,
        RPC_REQUESTS_PER_SECOND,
        (finished) =>
          setProgress(((finished - 1) * 100) / transactionHashes.length),
      );

      const senders = txs.map((tx) => tx.from);
      const users = await Promise.all(
        senders.map(
          (sender) =>
            readContract(config, {
              abi: Size.abi,
              address: market.address,
              functionName: "getUserView",
              args: [sender],
            }) as Promise<UserViewStruct>,
        ),
      );

      const sellCreditLimitOffers = sellCreditLimit
        .map((log, i) => ({
          user: users[i],
          maxDueDate: new Date(Number(log.args.maxDueDate!) * 1000),
          curveRelativeTime: {
            tenors: log.args.curveRelativeTimeTenors!.map((e) => Number(e)),
            aprs: log.args.curveRelativeTimeAprs!.map((e) => Number(e) / 1e18),
            marketRateMultipliers:
              log.args.curveRelativeTimeMarketRateMultipliers!.map(
                (e) => Number(e) / 1e18,
              ),
          },
        }))
        .reverse();
      const borrowOffers = deduplicate(sellCreditLimitOffers, "user.account");
      const buyCreditLimitOffers = buyCreditLimit
        .map((log, i) => ({
          user: users[sellCreditLimit.length + i],
          maxDueDate: new Date(Number(log.args.maxDueDate!) * 1000),
          curveRelativeTime: {
            tenors: log.args.curveRelativeTimeTenors!.map((e) => Number(e)),
            aprs: log.args.curveRelativeTimeAprs!.map((e) => Number(e) / 1e18),
            marketRateMultipliers:
              log.args.curveRelativeTimeMarketRateMultipliers!.map(
                (e) => Number(e) / 1e18,
              ),
          },
        }))
        .reverse();
      const loanOffers = deduplicate(buyCreditLimitOffers, "user.account");
      setContext({
        borrowOffers,
        loanOffers,
      });
      setProgress(100);
    })();
  }, [market]);

  return (
    <LimitOrdersContext.Provider value={{ ...context, progress }}>
      {children}
    </LimitOrdersContext.Provider>
  );
}
