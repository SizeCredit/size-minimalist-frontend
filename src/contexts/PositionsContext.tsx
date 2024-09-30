import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { CreditPositionStruct, DebtPositionStruct } from '../typechain/Size';
import { ConfigContext } from './ConfigContext';
import { config } from '../wagmi'
import { ethers } from 'ethers'
import { readContract } from 'wagmi/actions';
import { smallId } from '../services/format';

export interface DebtPosition {
  debtPositionId: string;
  borrower: string;
  futureValue: number;
  dueDate: Date;
  liquidityIndexAtRepayment: number;
}

export interface CreditPosition {
  creditPositionId: string;
  lender: string;
  forSale: boolean;
  credit: number;
  debtPosition: DebtPosition
};

interface PositionsContext {
  debtPositions: DebtPosition[]
  creditPositions: CreditPosition[]
}

export const PositionsContext = createContext<PositionsContext>({} as PositionsContext);

type Props = {
  children: ReactNode;
};

export function PositionsProvider({ children }: Props) {
  const { deployment } = useContext(ConfigContext)
  const [debtPositions, setDebtPositions] = useState<DebtPosition[]>([])
  const [creditPositions, setCreditPositions] = useState<CreditPosition[]>([])

  const getPositionsCount = useReadContract({
    abi: deployment.Size.abi,
    address: deployment.Size.address,
    functionName: 'getPositionsCount',
    config,
  })
  const positionsCount = getPositionsCount?.data as [number, number] | undefined
  const [debtPositionsCount, creditPositionsCount] =
    import.meta.env.VITE_SIMPLE ? [0, 0] :
      (positionsCount || [,])

  console.log(Number(debtPositionsCount), Number(creditPositionsCount))

  useEffect(() => {
    ; (async () => {
      const debtPositionsStructs = await Promise.all(
        Array(Number(debtPositionsCount || 0)).fill(undefined).map((_, i) => readContract(config, {
          abi: deployment.Size.abi,
          address: deployment.Size.address,
          functionName: 'getDebtPosition',
          args: [BigInt(i)],
        }) as Promise<DebtPositionStruct>)
      )
      console.log(debtPositionsStructs)
      const ds = debtPositionsStructs.map((debtPosition, i) => ({
        debtPositionId: i.toString(),
        borrower: debtPosition.borrower,
        futureValue: Number(debtPosition.futureValue),
        dueDate: new Date(Number(debtPosition.dueDate) * 1000),
        liquidityIndexAtRepayment: Number(debtPosition.liquidityIndexAtRepayment),
      }) as DebtPosition
      )
      setDebtPositions(ds)
    })()
  }, [debtPositionsCount])

  useEffect(() => {
    if (!debtPositions.length) return
      ; (async () => {
        const creditPositionsStructs = await Promise.all(
          Array(Number(creditPositionsCount || 0)).fill(undefined).map((_, i) => readContract(config, {
            abi: deployment.Size.abi,
            address: deployment.Size.address,
            functionName: 'getCreditPosition',
            args: [ethers.MaxUint256 / BigInt(2) + BigInt(i)],
          }) as Promise<CreditPositionStruct>)
        )
        const cs = creditPositionsStructs.map((creditPosition, i) => ({
          creditPositionId: smallId(ethers.MaxUint256 / BigInt(2) + BigInt(i)),
          lender: creditPosition.lender,
          forSale: creditPosition.forSale,
          credit: Number(creditPosition.credit),
          debtPosition: debtPositions[Number(creditPosition.debtPositionId)]
        }) as CreditPosition
        )
        setCreditPositions(cs)
      })()
  }, [creditPositionsCount, debtPositions.length])

  return (
    <PositionsContext.Provider
      value={{
        debtPositions,
        creditPositions
      }}
    >
      {children}
    </PositionsContext.Provider>
  );
}
