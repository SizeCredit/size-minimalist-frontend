import { createContext, ReactNode, useContext } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { UserViewStruct } from '../typechain/Size';
import { ConfigContext } from './ConfigContext';
import { config } from '../wagmi'
import { CreditPosition, DebtPosition, PositionsContext } from './PositionsContext';

interface UserContext {
  user?: UserViewStruct;
  debtPositions: DebtPosition[]
  creditPositions: CreditPosition[]
}

export const UserContext = createContext<UserContext>({} as UserContext);

type Props = {
  children: ReactNode;
};

export function UserProvider({ children }: Props) {
  const account = useAccount()
  const { creditPositions, debtPositions } = useContext(PositionsContext)
  const { market } = useContext(ConfigContext)
  const { deployment } = market
  const getUserView = useReadContract({
    abi: deployment.Size.abi,
    address: deployment.Size.address,
    functionName: 'getUserView',
    args: [account.address],
    config,
  })
  const user = getUserView?.data as UserViewStruct | undefined


  return (
    <UserContext.Provider
      value={{
        user,
        debtPositions: debtPositions.filter(position => position.borrower === account.address),
        creditPositions: creditPositions.filter(position => position.lender === account.address),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
