import { createContext, ReactNode, useContext } from "react";
import { Address, encodeAbiParameters, erc20Abi } from "viem";
import { readContract, writeContract } from "wagmi/actions";
import { CustomWagmiContext } from "./CustomWagmiContext";
import { ConfigContext } from "./ConfigContext";
import { toast } from "react-toastify";
import { txUrl } from "../services/txUrl";
import LeverageUp from "../abi/LeverageUp.json";
import Size from "../abi/Size.json";
import IPMarket from "../abi/IPMarket.json";
import { RegistryContext } from "./RegistryContext";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

enum SwapMethod {
  OneInch,
  Unoswap,
  UniswapV2,
  UniswapV3,
  GenericRoute,
  BoringPtSeller,
  BuyPt,
}

interface LeverageContext {
  approve: (token: Address, amount: bigint) => Promise<void>;
  leverageUpWithSwap: (
    token: Address,
    amount: bigint,
    lender: Address,
    leveragePercent: bigint,
    borrowPercent: bigint,
  ) => Promise<void>;
  currentLeveragePercent: () => Promise<bigint | undefined>;
  maxLeveragePercent: () => Promise<bigint | undefined>;
}

export const LeverageContext = createContext<LeverageContext>(
  {} as LeverageContext,
);

type Props = {
  children: ReactNode;
};

export function LeverageProvider({ children }: Props) {
  const { config } = useContext(CustomWagmiContext);
  const { chainInfo } = useContext(ConfigContext);
  const { market } = useContext(RegistryContext);
  const { address } = useAccount();

  const approve = async (token: Address, amount: bigint) => {
    if (!chainInfo) return;

    try {
      const tx = await writeContract(config, {
        chainId: chainInfo.chain.id,
        abi: erc20Abi,
        functionName: "approve",
        args: [chainInfo.addresses.LeverageUp, amount],
        address: token as Address,
      });

      toast.success(
        <a target="_blank" href={txUrl(chainInfo.chain, tx)}>
          {tx}
        </a>,
      );
    } catch (e: any) {
      toast.error(e.shortMessage);
      console.error(e);
    }
  };

  const leverageUpWithSwap = async (
    token: Address,
    amount: bigint,
    lender: Address,
    leveragePercent: bigint,
    borrowPercent: bigint,
  ) => {
    if (!chainInfo || !market) return;

    const pendleMarket =
      chainInfo.addresses[
        "PendleMarket_" + market.tokens.underlyingCollateralToken.symbol
      ];

    const timestamp = Math.floor(new Date().getTime() / 1000);

    const expiry = await readContract(config, {
      chainId: chainInfo.chain.id,
      abi: IPMarket.abi,
      address: pendleMarket,
      functionName: "expiry",
      args: [],
    });

    const tenor = (expiry as bigint) - BigInt(timestamp);

    const apr = await readContract(config, {
      chainId: chainInfo.chain.id,
      abi: Size.abi,
      address: market.address,
      functionName: "getLoanOfferAPR",
      args: [lender, tenor],
    });

    const deadline = timestamp + 60 * 60;
    const maxAPR = apr;
    const exactAmountIn = false;
    const creditPositionId = ethers.MaxUint256;

    const tokenOutIsYieldToken =
      market.tokens.underlyingCollateralToken.symbol.includes("sUSDE");

    const tokenOut = (await readContract(config, {
      chainId: chainInfo.chain.id,
      abi: LeverageUp.abi,
      address: chainInfo.addresses.LeverageUp,
      functionName: "getPtSellerTokenOut",
      args: [pendleMarket, tokenOutIsYieldToken],
    })) as Address;

    const sellCreditMarketParamsArray = [
      {
        lender,
        creditPositionId,
        amount,
        tenor,
        deadline,
        maxAPR,
        exactAmountIn,
      },
    ];

    const buyPtParams = {
      market: pendleMarket,
      tokenIn: tokenOut,
      router: chainInfo.addresses.PendleRouter,
      minPtOut: 0n,
    };

    const uniswapV3Params = {
      tokenIn: market.tokens.underlyingBorrowToken.address,
      tokenOut,
      fee: 500,
      sqrtPriceLimitX96: 0n,
      amountOutMinimum: 0n,
    };

    const swapParamsArray = [
      {
        method: SwapMethod.UniswapV3,
        data: encodeAbiParameters(
          [
            {
              type: "tuple",
              components: [
                { type: "address", name: "tokenIn" },
                { type: "address", name: "tokenOut" },
                { type: "uint24", name: "fee" },
                { type: "uint160", name: "sqrtPriceLimitX96" },
                { type: "uint256", name: "amountOutMinimum" },
              ],
            },
          ],
          [uniswapV3Params],
        ),
      },
      {
        method: SwapMethod.BuyPt,
        data: encodeAbiParameters(
          [
            {
              type: "tuple",
              components: [
                { type: "address", name: "market" },
                { type: "address", name: "tokenIn" },
                { type: "address", name: "router" },
                { type: "uint256", name: "minPtOut" },
              ],
            },
          ],
          [buyPtParams],
        ),
      },
    ];

    try {
      const tx = await writeContract(config, {
        chainId: chainInfo.chain.id,
        abi: LeverageUp.abi,
        functionName: "leverageUpWithSwap",
        args: [
          market.address,
          sellCreditMarketParamsArray,
          token,
          amount,
          leveragePercent,
          borrowPercent,
          swapParamsArray,
        ],
        address: chainInfo.addresses.LeverageUp,
      });

      toast.success(
        <a target="_blank" href={txUrl(chainInfo.chain, tx)}>
          {tx}
        </a>,
      );
    } catch (e: any) {
      toast.error(e.shortMessage);
      console.error(e);
    }
  };

  const currentLeveragePercent = async () => {
    if (!chainInfo || !market || !address) return;

    const leveragePercent = await readContract(config, {
      chainId: chainInfo.chain.id,
      abi: LeverageUp.abi,
      address: chainInfo.addresses.LeverageUp,
      functionName: "currentLeveragePercent",
      args: [market.address, address],
    });

    return leveragePercent as bigint;
  };

  const maxLeveragePercent = async () => {
    if (!chainInfo || !market) return;

    const maxLeveragePercent = await readContract(config, {
      chainId: chainInfo.chain.id,
      abi: LeverageUp.abi,
      address: chainInfo.addresses.LeverageUp,
      functionName: "maxLeveragePercent",
      args: [market.address],
    });

    return maxLeveragePercent as bigint;
  };

  return (
    <LeverageContext.Provider
      value={{
        approve,
        leverageUpWithSwap,
        currentLeveragePercent,
        maxLeveragePercent,
      }}
    >
      {children}
    </LeverageContext.Provider>
  );
}
