import { createContext, ReactNode, useContext } from "react";
import { Action, getActionsBitmap } from "../services/Authorization";
import { Address, encodeFunctionData } from "viem";
import { ConfigContext } from "./ConfigContext";
import SizeFactory from "../abi/SizeFactory.json";
import { readContract, sendTransaction } from "wagmi/actions";
import { toast } from "react-toastify";
import { txUrl } from "../services/txUrl";
import { CustomWagmiContext } from "./CustomWagmiContext";
import { useAccount } from "wagmi";

interface AuthorizationContext {
  setAuthorization: (operator: Address, actions: Action[]) => Promise<void>;
  revokeAllAuthorizations: () => Promise<void>;
  isAuthorized: (operator: Address, action: Action) => Promise<boolean>;
  isAuthorizedAll: (operator: Address, actions: Action[]) => Promise<boolean>;
}

export const AuthorizationContext = createContext<AuthorizationContext>(
  {} as AuthorizationContext,
);

type Props = {
  children: ReactNode;
};

export function AuthorizationProvider({ children }: Props) {
  const { config } = useContext(CustomWagmiContext);
  const { chainInfo } = useContext(ConfigContext);
  const account = useAccount();

  const isAuthorized = async (operator: Address, action: Action) => {
    if (!chainInfo) return false;

    const onBehalfOf = account.address;

    const args = [operator, onBehalfOf, action];

    const result = (await readContract(config, {
      chainId: chainInfo.chain.id,
      abi: [SizeFactory.abi.find((e) => e.name === "isAuthorized")],
      address: chainInfo.addresses.SizeFactory,
      functionName: "isAuthorized",
      args,
    })) as boolean;

    return result;
  };

  const isAuthorizedAll = async (operator: Address, actions: Action[]) => {
    if (!chainInfo) return false;

    const onBehalfOf = account.address;

    const actionsBitmap = getActionsBitmap(actions);

    const args = [operator, onBehalfOf, actionsBitmap];
    console.log(args);

    const result = (await readContract(config, {
      chainId: chainInfo.chain.id,
      abi: [SizeFactory.abi.find((e) => e.name === "isAuthorizedAll")],
      address: chainInfo.addresses.SizeFactory,
      functionName: "isAuthorizedAll",
      args,
    })) as boolean;

    return result;
  };

  const setAuthorization = async (operator: Address, actions: Action[]) => {
    if (!chainInfo) return;

    const actionsBitmap = getActionsBitmap(actions);

    const args = [operator, actionsBitmap];

    const data = encodeFunctionData({
      abi: [SizeFactory.abi.find((e) => e.name === "setAuthorization")],
      functionName: "setAuthorization",
      args,
    });

    try {
      const tx = await sendTransaction(config, {
        chainId: chainInfo.chain.id,
        to: chainInfo.addresses.SizeFactory,
        data,
      });
      toast.success(
        <a target="_blank" href={txUrl(chainInfo.chain, tx)}>
          {tx}
        </a>,
      );
    } catch (e: any) {
      console.error(Object.keys(e));
      console.error(e.cause, e.details);
      toast.error(e.shortMessage);
    }
  };

  const revokeAllAuthorizations = async () => {
    if (!chainInfo) return;

    const data = encodeFunctionData({
      abi: [SizeFactory.abi.find((e) => e.name === "revokeAllAuthorizations")],
      functionName: "revokeAllAuthorizations",
      args: [],
    });
    try {
      const tx = await sendTransaction(config, {
        chainId: chainInfo.chain.id,
        to: chainInfo.addresses.SizeFactory,
        data,
      });
      toast.success(
        <a target="_blank" href={txUrl(chainInfo.chain, tx)}>
          {tx}
        </a>,
      );
    } catch (e: any) {
      console.error(Object.keys(e));
      console.error(e.cause, e.details);
      toast.error(e.shortMessage);
    }
  };

  return (
    <AuthorizationContext.Provider
      value={{
        setAuthorization,
        revokeAllAuthorizations,
        isAuthorized,
        isAuthorizedAll,
      }}
    >
      {children}
    </AuthorizationContext.Provider>
  );
}
