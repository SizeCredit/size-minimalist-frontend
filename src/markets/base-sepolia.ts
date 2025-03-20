import { Address, zeroAddress } from "viem";
import { baseSepolia } from "wagmi/chains";

export default {
  chainId: baseSepolia.id,
  addresses: {
    SizeFactory: "0x1bC2Aa26D4F3eCD612ddC4aB2518B59E04468191" as Address,
    AaveV3Pool: "0xbE781D7Bdf469f3d94a62Cdcc407aCe106AEcA74" as Address,
    WETH: "0x4200000000000000000000000000000000000006" as Address,
    ChainlinkSequencerUptimeFeed: zeroAddress as Address,
    ChainlinkETHUSDPriceFeed: zeroAddress as Address,
  },
};
