import { Abi, Address } from "viem";
import Size from "../abi/Size.json";
import PriceFeed from "../abi/PriceFeed.json";
import { erc20Abi } from "viem";

export default {
  deployment: {
    Size: {
      abi: Size.abi as Abi,
      address: "0x3009B1049F2ef921Bb35A80A3D5ee0a47Bd0211A" as Address,
      block: 12778899,
    },
    PriceFeed: {
      abi: PriceFeed.abi as Abi,
      address: "0x4C4B6E64b5765196661E3FF80b5Da8c917392BDB" as Address,
      block: 0,
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
      address: "0x036cbd53842c5426634e7929541ec2318f3dcf7e" as Address,
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
