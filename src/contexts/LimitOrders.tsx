import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ConfigContext } from './ConfigContext';
import { usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
import { delayed } from '../services/delayed';
import { deduplicate } from '../services/deduplicate';

export interface LimitOrder {
  user: string;
  maxDueDate: Date;
  curveRelativeTime: {
    tenors: number[];
    aprs: number[];
    marketRateMultipliers: number[];
  }
}

interface LimitOrdersContext {
  borrowOffers: LimitOrder[]
  loanOffers: LimitOrder[]
}

export const LimitOrdersContext = createContext<LimitOrdersContext>({} as LimitOrdersContext);

type Props = {
  children: ReactNode;
};

export function LimitOrdersProvider({ children }: Props) {
  const [borrowOffers, setBorrowOffers] = useState<LimitOrder[]>([])
  const [loanOffers, setLoanOffers] = useState<LimitOrder[]>([])

  const { deployment } = useContext(ConfigContext)

  const publicClient = usePublicClient()

  useEffect(() => {
    (async () => {
      const [sellCreditLimit, buyCreditLimit] = await Promise.all([
        publicClient.getLogs({
          address: deployment.Size.address,
          event: parseAbiItem('event SellCreditLimit(uint256 indexed maxDueDate, uint256[] curveRelativeTimeTenors, int256[] curveRelativeTimeAprs, uint256[] curveRelativeTimeMarketRateMultipliers)'),
          fromBlock: BigInt(deployment.Size.block),
        }),
        publicClient.getLogs({
          address: deployment.Size.address,
          event: parseAbiItem('event BuyCreditLimit(uint256 indexed maxDueDate, uint256[] curveRelativeTimeTenors, int256[] curveRelativeTimeAprs, uint256[] curveRelativeTimeMarketRateMultipliers)'),
          fromBlock: BigInt(deployment.Size.block),
        })
      ])
      const transactionHashes = [
        ...Array.from(sellCreditLimit),
        ...Array.from(buyCreditLimit)
      ]
        .map((log) => log.transactionHash)
      const transactionPromises = transactionHashes.map((hash) => () => publicClient.getTransaction({ hash }));
      const txs = await delayed(transactionPromises, 100);

      const senders = txs.map((tx) => tx.from)
      const sellCreditLimitOffers = sellCreditLimit.map((log, i) => ({
        user: senders[i],
        maxDueDate: new Date(Number(log.args.maxDueDate!) * 1000),
        curveRelativeTime: {
          tenors: log.args.curveRelativeTimeTenors!.map(e => Number(e)),
          aprs: log.args.curveRelativeTimeAprs!.map(e => Number(e) / 1e18),
          marketRateMultipliers: log.args.curveRelativeTimeMarketRateMultipliers!.map(e => Number(e) / 1e18),
        },
      }))
      const bos = deduplicate(sellCreditLimitOffers, 'user')
      const buyCreditLimitOffers = buyCreditLimit.map((log, i) => ({
        user: senders[sellCreditLimit.length + i],
        maxDueDate: new Date(Number(log.args.maxDueDate!) * 1000),
        curveRelativeTime: {
          tenors: log.args.curveRelativeTimeTenors!.map(e => Number(e)),
          aprs: log.args.curveRelativeTimeAprs!.map(e => Number(e) / 1e18),
          marketRateMultipliers: log.args.curveRelativeTimeMarketRateMultipliers!.map(e => Number(e) / 1e18),
        },
      }))
      const los = deduplicate(buyCreditLimitOffers, 'user')
      setBorrowOffers(bos)
      setLoanOffers(los)
    })()
  }, [])

  console.log(borrowOffers)
  console.log(loanOffers)

  return (
    <LimitOrdersContext.Provider
      value={{
        borrowOffers,
        loanOffers
      }}
    >
      {children}
    </LimitOrdersContext.Provider>
  );
}
