import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { CreditPositionStruct, DebtPositionStruct } from '../typechain/Size';
import { ConfigContext } from './ConfigContext';
import { config } from '../wagmi'
import { ethers } from 'ethers'
import { readContract } from 'wagmi/actions';
import { delayed } from '../services/delayed';

const RPC_REQUESTS_PER_SECOND = 10;

export interface DebtPosition {
  debtPositionId: string;
  borrower: string;
  futureValue: bigint;
  dueDate: Date;
  liquidityIndexAtRepayment: number;
}

export interface CreditPosition {
  creditPositionId: string;
  lender: string;
  forSale: boolean;
  credit: bigint;
  debtPosition: DebtPosition
};

interface PositionsContext {
  debtPositions: DebtPosition[]
  creditPositions: CreditPosition[]
  progress: number
}

export const PositionsContext = createContext<PositionsContext>({} as PositionsContext);

type Props = {
  children: ReactNode;
};

export function PositionsProvider({ children }: Props) {
  const { deployment } = useContext(ConfigContext)
  const [context, setContext] = useState<Omit<PositionsContext, 'progress'>>({
    debtPositions: [],
    creditPositions: [],
  })
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    ; (async () => {
      const positionsCount = await readContract(config, {
        abi: deployment.Size.abi,
        address: deployment.Size.address,
        functionName: 'getPositionsCount',
      }) as [number, number]

      const [debtPositionsCount, creditPositionsCount] = positionsCount

      const getDebtPositionPromises = 
        Array(Number(debtPositionsCount)).fill(undefined).map((_, i) => () => readContract(config, {
          abi: deployment.Size.abi,
          address: deployment.Size.address,
          functionName: 'getDebtPosition',
          args: [BigInt(i)],
        }) as Promise<DebtPositionStruct>)

      const debtPositionsStructs = await delayed(getDebtPositionPromises, RPC_REQUESTS_PER_SECOND, (finished) => setProgress((finished-1) * 100 / Number(debtPositionsCount + creditPositionsCount)));

      const debtPositions = debtPositionsStructs.map((debtPosition, i) => ({
        debtPositionId: i.toString(),
        borrower: debtPosition.borrower,
        futureValue: debtPosition.futureValue,
        dueDate: new Date(Number(debtPosition.dueDate) * 1000),
        liquidityIndexAtRepayment: Number(debtPosition.liquidityIndexAtRepayment),
      }) as DebtPosition)

      const getCreditPositionPromises =
        Array(Number(creditPositionsCount)).fill(undefined).map((_, i) => () => readContract(config, {
          abi: deployment.Size.abi,
          address: deployment.Size.address,
          functionName: 'getCreditPosition',
          args: [ethers.MaxUint256 / BigInt(2) + BigInt(i)],
        }) as Promise<CreditPositionStruct>)

      const creditPositionsStructs = await delayed(getCreditPositionPromises, RPC_REQUESTS_PER_SECOND , (finished) => setProgress((finished + Number(debtPositionsCount) - 1) * 100 / Number(debtPositionsCount + creditPositionsCount)));

      const creditPositions = creditPositionsStructs.map((creditPosition, i) => ({
        creditPositionId: (ethers.MaxUint256 / BigInt(2) + BigInt(i)).toString(),
        lender: creditPosition.lender,
        forSale: creditPosition.forSale,
        credit: creditPosition.credit,
        debtPosition: debtPositions[Number(creditPosition.debtPositionId)]
      }) as CreditPosition)

      setContext({
        debtPositions,
        creditPositions,
      })
      setProgress(100)
    })()
  }, [])


  return (
    <PositionsContext.Provider
      value={{...context, progress}}
    >
      {children}
    </PositionsContext.Provider>
  );
}
