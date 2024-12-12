import { Address } from "viem";
import { baseSepolia } from "wagmi/chains";

export default {
  chain: baseSepolia,
  SizeFactory: "0x1bC2Aa26D4F3eCD612ddC4aB2518B59E04468191" as Address,
  UniswapV3Factory: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24" as Address,
  WETH: "0x4200000000000000000000000000000000000006" as Address,
};
