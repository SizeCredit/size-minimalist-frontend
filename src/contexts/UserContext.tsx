import { createContext, ReactNode, useContext } from "react";
import { useAccount, useReadContract } from "wagmi";
import { UserViewStruct } from "../types/ethers-contracts/Size";
import { config } from "../wagmi";
import {
  CreditPosition,
  DebtPosition,
  PositionsContext,
} from "./PositionsContext";
import { BigNumberish } from "ethers";
import { RegistryContext } from "./RegistryContext";
import Size from "../abi/Size.json";
import { Address, erc20Abi } from "viem";

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
  const { market } = useContext(RegistryContext);
  const getUserView = useReadContract({
    abi: Size.abi,
    address: market?.address,
    functionName: "getUserView",
    args: [account.address],
    config,
  });
  const userView = (getUserView?.data || {}) as UserViewStruct;

  const underlyingBorrowTokenBalance = useReadContract({
    abi: erc20Abi,
    address: market?.data.underlyingBorrowToken as Address,
    functionName: "balanceOf",
    args: [account.address!],
    config,
  });

  const underlyingCollateralTokenBalance = useReadContract({
    abi: erc20Abi,
    address: market?.data.underlyingCollateralToken as Address,
    functionName: "balanceOf",
    args: [account.address!],
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
