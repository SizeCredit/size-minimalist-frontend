import { Abi, Address } from "viem";
import Size from "../abi/Size.json";
import PriceFeed from "../abi/PriceFeed.json";
import { erc20Abi } from "viem";

export default {
  deployment: {
    Size: {
      abi: Size.abi as Abi,
      address: "0xA5f2066647d22dfBd2Ed0dD43344dB9DCe4b4632" as Address,
      block: 17950234,
    },
    PriceFeed: {
      abi: PriceFeed.abi as Abi,
      address: "0xf336B38CD502C5cfE7c45572A7C39631bA180b63" as Address,
      block: 0,
    },
    WETH: {
      abi: erc20Abi,
      address: "0x4200000000000000000000000000000000000006" as Address,
      block: 0,
    },
    UnderlyingCollateralToken: {
      abi: erc20Abi,
      address: "0xe4ab69c077896252fafbd49efd26b5d171a32410" as Address,
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
    UnderlyingCollateralToken: { decimals: 18, symbol: "LINK" },
    CollateralToken: { decimals: 18, symbol: "szLINK" },
    DebtToken: { decimals: 6, symbol: "szDebtUSDC" },
  },
  minimumCreditAmount: 10,
};
