import { DebtPosition, CreditPosition } from '../contexts/PositionsContext';

export function compensateCandidates(debtPosition: DebtPosition, creditPositions: CreditPosition[], myCreditPositions: CreditPosition[]): {
  creditPositionsWithDebtToRepay: CreditPosition[],
  creditPositionsToCompensate: CreditPosition[]
} {
  const creditPositionsWithDebtToRepay = creditPositions.filter(creditPosition => creditPosition.debtPosition.debtPositionId === debtPosition.debtPositionId)
  const creditPositionsToCompensate = myCreditPositions.filter(creditPosition => debtPosition.dueDate.getTime() > creditPosition.debtPosition.dueDate.getTime())
  .filter(creditPosition => creditPosition.debtPosition.futureValue > 0 && creditPosition.debtPosition.dueDate.getTime() > new Date().getTime())
  return {
    creditPositionsWithDebtToRepay,
    creditPositionsToCompensate
  }
}