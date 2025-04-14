import { createContext, ReactNode, useContext } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
  CopyLimitOrdersParamsStruct,
  UserViewStruct,
} from "../types/ethers-contracts/Size";
import {
  CreditPosition,
  DebtPosition,
  PositionsContext,
} from "./PositionsContext";
import { BigNumberish } from "ethers";
import { RegistryContext } from "./RegistryContext";
import Size from "../abi/Size.json";
import SizeFactory from "../abi/SizeFactory.json";
import { Address, erc20Abi, keccak256, toHex } from "viem";
import { CustomWagmiContext } from "./CustomWagmiContext";
import { ConfigContext } from "./ConfigContext";

interface User extends UserViewStruct {
  underlyingBorrowTokenBalance: BigNumberish;
  underlyingCollateralTokenBalance: BigNumberish;
  userCopyLimitOrders: CopyLimitOrdersParamsStruct;
  pauser: boolean;
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
  const { config } = useContext(CustomWagmiContext);
  const { chainInfo: chain } = useContext(ConfigContext);
  const account = useAccount();
  const { creditPositions, debtPositions } = useContext(PositionsContext);
  const { market } = useContext(RegistryContext);
  const getUserView = useReadContract({
    chainId: chain?.chain.id,
    abi: Size.abi,
    address: market?.address,
    functionName: "getUserView",
    args: [account.address],
    config,
  });
  const userView = (getUserView?.data || {}) as UserViewStruct;

  const getUserCopyLimitOrders = useReadContract({
    chainId: chain?.chain.id,
    abi: Size.abi,
    address: market?.address,
    functionName: "getUserCopyLimitOrders",
    args: [account.address],
    config,
  });

  const userCopyLimitOrders = (getUserCopyLimitOrders?.data ||
    {}) as CopyLimitOrdersParamsStruct;

  const underlyingBorrowTokenBalance = useReadContract({
    chainId: chain?.chain.id,
    abi: erc20Abi,
    address: market?.data.underlyingBorrowToken as Address,
    functionName: "balanceOf",
    args: [account.address!],
    config,
  });

  const underlyingCollateralTokenBalance = useReadContract({
    chainId: chain?.chain.id,
    abi: erc20Abi,
    address: market?.data.underlyingCollateralToken as Address,
    functionName: "balanceOf",
    args: [account.address!],
    config,
  });

  const pauser = useReadContract({
    chainId: chain?.chain.id,
    abi: SizeFactory.abi,
    address: chain?.addresses.SizeFactory,
    functionName: "hasRole",
    args: [keccak256(toHex("PAUSER_ROLE")), account.address],
    config,
  });

  console.log("hasRole", account.address, pauser?.data);

  const user: User = {
    ...userView,
    underlyingBorrowTokenBalance:
      underlyingBorrowTokenBalance?.data as BigNumberish,
    underlyingCollateralTokenBalance:
      underlyingCollateralTokenBalance?.data as BigNumberish,
    userCopyLimitOrders: userCopyLimitOrders,
    pauser: pauser?.data as boolean,
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
