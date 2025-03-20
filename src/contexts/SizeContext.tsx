import { createContext, ReactNode, useContext } from "react";
import { useAccount } from "wagmi";
import { ConfigContext } from "./ConfigContext";
import { PositionsContext } from "./PositionsContext";
import { Address, encodeFunctionData, erc20Abi } from "viem";
import Size from "../abi/Size.json";
import { readContract, sendTransaction, writeContract } from "wagmi/actions";
import { toast } from "react-toastify";
import { Quote } from "./SwapContext";
import { ethers } from "ethers";
import { PriceContext } from "./PriceContext";
import { RegistryContext } from "./RegistryContext";
import { CustomWagmiContext } from "./CustomWagmiContext";

interface SizeContext {
  repay: (debtPositionId: string) => Promise<void>;
  deposit: (token: string, amount: bigint) => Promise<void>;
  withdraw: (token: string, amount: bigint) => Promise<void>;
  buyCreditLimit: (tenors: bigint[], aprs: bigint[]) => Promise<void>;
  sellCreditLimit: (tenors: bigint[], aprs: bigint[]) => Promise<void>;
  sellCreditMarket: (
    quote: Quote,
    amount: bigint,
    tenor: number,
    creditPositionId?: bigint,
  ) => Promise<void>;
  buyCreditMarket: (
    quote: Quote,
    amount: bigint,
    tenor: number,
  ) => Promise<void>;
  compensate: (
    creditPositionWithDebtToRepayId: string,
    creditPositionToCompensateId: string,
  ) => Promise<void>;
  claim: (creditPositionId: string) => Promise<void>;
  liquidate: (debtPositionId: string) => Promise<void>;
  copyLimitOrders: (
    copyAddress: string,
    loanOffsetAPR: bigint,
    borrowOffsetAPR: bigint,
  ) => Promise<void>;
}

export const SizeContext = createContext<SizeContext>({} as SizeContext);

type Props = {
  children: ReactNode;
};

export function SizeProvider({ children }: Props) {
  const { config } = useContext(CustomWagmiContext);
  const account = useAccount();
  const { updatePositions, debtPositions } = useContext(PositionsContext);
  const { chain } = useContext(ConfigContext);
  const { market } = useContext(RegistryContext);
  const { price } = useContext(PriceContext);

  const repay = async (debtPositionId: string) => {
    if (!chain) return;

    const borrower = account.address;
    const arg = {
      debtPositionId,
      borrower,
    };
    console.log(arg);
    const data = encodeFunctionData({
      abi: [Size.abi.find((e) => e.name === "repay")],
      functionName: "repay",
      args: [arg],
    });
    console.log(data);
    try {
      const tx = await sendTransaction(config, {
        to: market!.address,
        data,
      });
      toast.success(
        <a
          target="_blank"
          href={`${chain.chain.blockExplorers?.default?.url}/tx/${tx}`}
        >
          {tx}
        </a>,
      );
      updatePositions();
    } catch (e: any) {
      // const data: string = err?.error?.data?.originalError?.data;
      console.error(Object.keys(e));
      console.error(e.cause, e.details);
      toast.error(e.shortMessage);
    }
  };

  const deposit = async (token: string, amount: bigint) => {
    if (!chain) return;

    const to = account.address;
    const arg = {
      to,
      token,
      amount,
    };
    console.log(arg);
    const data = encodeFunctionData({
      abi: [Size.abi.find((e) => e.name === "deposit")],
      functionName: "deposit",
      args: [arg],
    });
    console.log(data);
    try {
      if (token !== chain.addresses.WETH) {
        const allowance = await readContract(config, {
          abi: erc20Abi,
          functionName: "allowance",
          args: [account.address!, market!.address],
          address: token as Address,
        });
        if (allowance < amount) {
          const approve = await writeContract(config, {
            abi: erc20Abi,
            functionName: "approve",
            args: [market!.address, amount],
            address: token as Address,
          });
          toast.success(
            <a
              target="_blank"
              href={`${chain.chain.blockExplorers?.default?.url}/tx/${approve}`}
            >
              {approve}
            </a>,
          );
          await new Promise((resolve) => setTimeout(resolve, 7000));
        }
      }
      const tx = await sendTransaction(config, {
        to: market!.address,
        data,
        value: token === chain.addresses.WETH ? amount : BigInt(0),
      });
      toast.success(
        <a
          target="_blank"
          href={`${chain.chain.blockExplorers?.default?.url}/tx/${tx}`}
        >
          {tx}
        </a>,
      );
    } catch (e: any) {
      toast.error(e.shortMessage);
    }
  };

  const withdraw = async (token: string, amount: bigint) => {
    if (!chain) return;

    const to = account.address;
    const arg = {
      to,
      token,
      amount,
    };
    console.log(arg);
    const data = encodeFunctionData({
      abi: [Size.abi.find((e) => e.name === "withdraw")],
      functionName: "withdraw",
      args: [arg],
    });
    console.log(data);
    try {
      const tx = await sendTransaction(config, {
        to: market!.address,
        data,
      });
      toast.success(
        <a
          target="_blank"
          href={`${chain.chain.blockExplorers?.default?.url}/tx/${tx}`}
        >
          {tx}
        </a>,
      );
    } catch (e: any) {
      toast.error(e.shortMessage);
    }
  };

  const buyCreditLimit = async (tenors: bigint[], aprs: bigint[]) => {
    if (!chain) return;

    const marketRateMultipliers = tenors.map(() => 0);
    const maxDueDate =
      tenors.length === 0
        ? 0
        : Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24 * 365) / 1000);
    const arg = {
      maxDueDate,
      curveRelativeTime: {
        tenors,
        aprs,
        marketRateMultipliers,
      },
    };
    console.log(arg);
    const data = encodeFunctionData({
      abi: [Size.abi.find((e) => e.name === "buyCreditLimit")],
      functionName: "buyCreditLimit",
      args: [arg],
    });
    console.log(data);
    try {
      const tx = await sendTransaction(config, {
        to: market!.address,
        data,
      });
      toast.success(
        <a
          target="_blank"
          href={`${chain.chain.blockExplorers?.default?.url}/tx/${tx}`}
        >
          {tx}
        </a>,
      );
    } catch (e: any) {
      toast.error(e.shortMessage);
    }
  };

  const sellCreditLimit = async (tenors: bigint[], aprs: bigint[]) => {
    if (!chain) return;

    const marketRateMultipliers = tenors.map(() => 0);
    const maxDueDate =
      tenors.length === 0
        ? 0
        : Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24 * 365) / 1000);
    const arg = {
      maxDueDate,
      curveRelativeTime: {
        tenors,
        aprs,
        marketRateMultipliers,
      },
    };
    console.log(arg);
    const data = encodeFunctionData({
      abi: [Size.abi.find((e) => e.name === "sellCreditLimit")],
      functionName: "sellCreditLimit",
      args: [arg],
    });
    console.log(data);
    try {
      const tx = await sendTransaction(config, {
        to: market!.address,
        data,
      });
      toast.success(
        <a
          target="_blank"
          href={`${chain.chain.blockExplorers?.default?.url}/tx/${tx}`}
        >
          {tx}
        </a>,
      );
    } catch (e: any) {
      toast.error(e.shortMessage);
    }
  };

  const sellCreditMarket = async (
    quote: Quote,
    amount: bigint,
    tenor: number,
    creditPositionId?: bigint,
  ): Promise<void> => {
    if (!chain) return;

    const { user: lender, rate } = quote;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60;
    const maxAPR = Math.floor(rate * 1.05 * 1e18);
    const exactAmountIn = true;
    creditPositionId = creditPositionId || ethers.MaxUint256;
    const arg = {
      lender,
      creditPositionId,
      amount,
      tenor,
      deadline,
      maxAPR,
      exactAmountIn,
    };
    console.log(arg);
    const data = encodeFunctionData({
      abi: [Size.abi.find((e) => e.name === "sellCreditMarket")],
      functionName: "sellCreditMarket",
      args: [arg],
    });
    console.log(data);
    try {
      const tx = await sendTransaction(config, {
        to: market!.address,
        data,
      });
      toast.success(
        <a
          target="_blank"
          href={`${chain.chain.blockExplorers?.default?.url}/tx/${tx}`}
        >
          {tx}
        </a>,
      );
      updatePositions();
    } catch (e: any) {
      toast.error(e.shortMessage);
    }
  };

  const buyCreditMarket = async (
    quote: Quote,
    amount: bigint,
    tenor: number,
  ): Promise<void> => {
    if (!chain) return;

    const { user: borrower, rate } = quote;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60;
    const minAPR = Math.floor((rate * 1e18) / 1.05);
    const exactAmountIn = false;
    const creditPositionId = ethers.MaxUint256;
    const arg = {
      borrower,
      creditPositionId,
      amount,
      tenor,
      deadline,
      minAPR,
      exactAmountIn,
    };
    console.log(arg);
    const data = encodeFunctionData({
      abi: [Size.abi.find((e) => e.name === "buyCreditMarket")],
      functionName: "buyCreditMarket",
      args: [arg],
    });
    console.log(data);
    try {
      const tx = await sendTransaction(config, {
        to: market!.address,
        data,
      });
      toast.success(
        <a
          target="_blank"
          href={`${chain.chain.blockExplorers?.default?.url}/tx/${tx}`}
        >
          {tx}
        </a>,
      );
      updatePositions();
    } catch (e: any) {
      toast.error(e.shortMessage);
    }
  };

  const compensate = async (
    creditPositionWithDebtToRepayId: string,
    creditPositionToCompensateId: string,
  ) => {
    if (!chain) return;

    const arg = {
      creditPositionWithDebtToRepayId,
      creditPositionToCompensateId,
      amount: ethers.MaxUint256,
    };
    console.log(arg);
    const data = encodeFunctionData({
      abi: [Size.abi.find((e) => e.name === "compensate")],
      functionName: "compensate",
      args: [arg],
    });
    console.log(data);
    try {
      const tx = await sendTransaction(config, {
        to: market!.address,
        data,
      });
      toast.success(
        <a
          target="_blank"
          href={`${chain.chain.blockExplorers?.default?.url}/tx/${tx}`}
        >
          {tx}
        </a>,
      );
      updatePositions();
    } catch (e: any) {
      toast.error(e.shortMessage);
    }
  };

  const claim = async (creditPositionId: string) => {
    if (!chain) return;

    const arg = {
      creditPositionId,
    };
    console.log(arg);
    const data = encodeFunctionData({
      abi: [Size.abi.find((e) => e.name === "claim")],
      functionName: "claim",
      args: [arg],
    });
    console.log(data);
    try {
      const tx = await sendTransaction(config, {
        to: market!.address,
        data,
      });
      toast.success(
        <a
          target="_blank"
          href={`${chain.chain.blockExplorers?.default?.url}/tx/${tx}`}
        >
          {tx}
        </a>,
      );
      updatePositions();
    } catch (e: any) {
      toast.error(e.shortMessage);
    }
  };

  const liquidate = async (debtPositionId: string) => {
    if (!chain) return;

    const debtPosition = debtPositions.find(
      (e) => e.debtPositionId === debtPositionId,
    )!;
    const minimumCollateralProfit =
      (0.98 *
        ((Number(debtPosition.futureValue) *
          10 ** market!.tokens.collateralToken.decimals) /
          10 ** market!.tokens.borrowAToken.decimals)) /
      price!;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60;
    const arg = {
      debtPositionId,
      minimumCollateralProfit,
      deadline,
    };
    console.log(arg);
    const data = encodeFunctionData({
      abi: [Size.abi.find((e) => e.name === "liquidate")],
      functionName: "liquidate",
      args: [arg],
    });
    console.log(data);
    try {
      const tx = await sendTransaction(config, {
        to: market!.address,
        data,
      });
      toast.success(
        <a
          target="_blank"
          href={`${chain.chain.blockExplorers?.default?.url}/tx/${tx}`}
        >
          {tx}
        </a>,
      );
      updatePositions();
    } catch (e: any) {
      toast.error(e.shortMessage);
    }
  };

  const copyLimitOrders = async (
    copyAddress: string,
    loanOffsetAPR: bigint,
    borrowOffsetAPR: bigint,
  ) => {
    if (!chain) return;

    const arg = {
      copyAddress,
      copyLoanOffer: {
        minTenor: 0,
        maxTenor: ethers.MaxUint256,
        minAPR: 0,
        maxAPR: ethers.MaxUint256,
        offsetAPR: loanOffsetAPR,
      },
      copyBorrowOffer: {
        minTenor: 0,
        maxTenor: ethers.MaxUint256,
        minAPR: 0,
        maxAPR: ethers.MaxUint256,
        offsetAPR: borrowOffsetAPR,
      },
    };
    console.log(arg);
    const data = encodeFunctionData({
      abi: [Size.abi.find((e) => e.name === "copyLimitOrders")],
      functionName: "copyLimitOrders",
      args: [arg],
    });
    console.log(data);
    try {
      const tx = await sendTransaction(config, {
        to: market!.address,
        data,
      });
      toast.success(
        <a
          target="_blank"
          href={`${chain.chain.blockExplorers?.default?.url}/tx/${tx}`}
        >
          {tx}
        </a>,
      );
    } catch (e: any) {
      toast.error(e.shortMessage);
    }
  };

  return (
    <SizeContext.Provider
      value={{
        repay,
        deposit,
        withdraw,
        sellCreditLimit,
        buyCreditLimit,
        sellCreditMarket,
        buyCreditMarket,
        compensate,
        claim,
        liquidate,
        copyLimitOrders,
      }}
    >
      {children}
    </SizeContext.Provider>
  );
}
