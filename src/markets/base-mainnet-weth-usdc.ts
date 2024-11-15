import { Abi, Address } from "viem";
import Size from "../abi/Size.json";
import PriceFeed from "../abi/PriceFeed.json";
import { erc20Abi } from "viem";

export default {
  deployment: {
    Size: {
      abi: Size.abi as Abi,
      address: "0xC2a429681CAd7C1ce36442fbf7A4a68B11eFF940" as Address,
      block: 17147278,
    },
    PriceFeed: {
      abi: PriceFeed.abi as Abi,
      address: "0xd6938E55cc5f4B553948Cc153d360E8a8FA0de72" as Address,
      block: 17147277,
    },
    WETH: {
      abi: erc20Abi,
      address: "0x4200000000000000000000000000000000000006" as Address,
      block: 0,
    },
    UnderlyingCollateralToken: {
      abi: erc20Abi,
      address: "0x4200000000000000000000000000000000000006" as Address,
      block: 0,
    },
    UnderlyingBorrowToken: {
      abi: erc20Abi,
      address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" as Address,
      block: 0,
    },
  },
  tokens: {
    BorrowAToken: { decimals: 6, symbol: "szUSDC" },
    UnderlyingBorrowToken: { decimals: 6, symbol: "USDC" },
    UnderlyingCollateralToken: { decimals: 18, symbol: "WETH" },
    CollateralToken: { decimals: 18, symbol: "szWETH" },
    DebtToken: { decimals: 6, symbol: "szDebtUSDC" },
  },
  minimumCreditAmount: 10,
};
