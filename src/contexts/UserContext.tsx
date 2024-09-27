import { createContext, ReactNode, useContext } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { UserViewStruct } from '../typechain/Size';
import { ConfigContext } from './ConfigContext';
import { config } from '../wagmi'

interface UserContext {
  user?: UserViewStruct;
}

export const UserContext = createContext<UserContext>({} as UserContext);

type Props = {
  children: ReactNode;
};

export function UserProvider({ children }: Props) {
  const account = useAccount()
  const { deployment } = useContext(ConfigContext)
  const result = useReadContract({
    abi: deployment.Size.abi,
    address: deployment.Size.address,
    functionName: 'getUserView',
    args: [account.address],
    config,
  })
  const user = result?.data as UserViewStruct | undefined

  return (
    <UserContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
