import { createContext, ReactNode, useContext } from "react";
import { useAccount, useReadContract } from "wagmi";
import { UserViewStruct } from "../typechain/Size";
import { ConfigContext } from "./ConfigContext";
import { config } from "../wagmi";
import {
  CreditPosition,
  DebtPosition,
  PositionsContext,
} from "./PositionsContext";
import { BigNumberish } from "ethers";

interface User extends UserViewStruct {
  underlyingBorrowTokenBalance: BigNumberish;
  underlyingCollateralTokenBalance: BigNumberish;
}

interface UserContext {
  user?: User;
  debtPositions: DebtPosition[];
  creditPositions: CreditPosition[];
}

export const UserContext = createContext<UserContext>({} as UserContext);

type Props = {
  children: ReactNode;
};

export function UserProvider({ children }: Props) {
  const account = useAccount();
  const { creditPositions, debtPositions } = useContext(PositionsContext);
  const { market } = useContext(ConfigContext);
  const { deployment } = market;
  const getUserView = useReadContract({
    abi: deployment.Size.abi,
    address: deployment.Size.address,
    functionName: "getUserView",
    args: [account.address],
    config,
  });
  const userView = (getUserView?.data || {}) as UserViewStruct;

  const underlyingBorrowTokenBalance = useReadContract({
    abi: deployment.UnderlyingBorrowToken.abi,
    address: deployment.UnderlyingBorrowToken.address,
    functionName: "balanceOf",
    args: [account.address],
    config,
  });

  const underlyingCollateralTokenBalance = useReadContract({
    abi: deployment.UnderlyingCollateralToken.abi,
    address: deployment.UnderlyingCollateralToken.address,
    functionName: "balanceOf",
    args: [account.address],
    config,
  });

  const user: User = {
    ...userView,
    underlyingBorrowTokenBalance:
      underlyingBorrowTokenBalance?.data as BigNumberish,
    underlyingCollateralTokenBalance:
      underlyingCollateralTokenBalance?.data as BigNumberish,
  };

  return (
    <UserContext.Provider
      value={{
        user,
        debtPositions: debtPositions.filter(
          (position) => position.borrower === account.address,
        ),
        creditPositions: creditPositions.filter(
          (position) => position.lender === account.address,
        ),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
