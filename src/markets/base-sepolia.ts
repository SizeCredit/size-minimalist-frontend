import { Abi, Address } from "viem";
import SizeFactory from "../abi/SizeFactory.json";
import { erc20Abi } from "viem";
import { baseSepolia } from "wagmi/chains";

export default {
  chain: baseSepolia,
  SizeFactory: {
    abi: SizeFactory.abi as Abi,
    address: "0x1bC2Aa26D4F3eCD612ddC4aB2518B59E04468191" as Address,
  },
  WETH: {
    abi: erc20Abi,
    address: "0x4200000000000000000000000000000000000006" as Address,
  },
};
