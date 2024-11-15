import { Abi, Address } from "viem";
import SizeRegistry from "../abi/SizeRegistry.json";
import { erc20Abi } from "viem";

export default {
  SizeRegistry: {
    abi: SizeRegistry.abi as Abi,
    address: "0xB653e1eda8AB42ddF6B82696a4045A029D5f9d8c" as Address,
  },
  WETH: {
    abi: erc20Abi,
    address: "0x4200000000000000000000000000000000000006" as Address,
  },
};
