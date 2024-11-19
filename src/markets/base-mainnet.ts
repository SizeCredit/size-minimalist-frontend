import { Abi, Address } from "viem";
import SizeFactory from "../abi/SizeFactory.json";
import { erc20Abi } from "viem";

export default {
  SizeFactory: {
    abi: SizeFactory.abi as Abi,
    address: "0x330Dc31dB45672c1F565cf3EC91F9a01f8f3DF0b" as Address,
  },
  WETH: {
    abi: erc20Abi,
    address: "0x4200000000000000000000000000000000000006" as Address,
  },
};
