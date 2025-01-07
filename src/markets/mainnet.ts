import { Address, zeroAddress } from "viem";
import { mainnet } from "wagmi/chains";

export default {
  chain: mainnet,
  explorer: "https://etherscan.io",
  addresses: {
    SizeFactory: "0x3A9C05c3Da48E6E26f39928653258D7D4Eb594C1" as Address,
    AaveV3Pool: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" as Address,
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address,
    ChainlinkSequencerUptimeFeed:
      zeroAddress as Address,
    ChainlinkETHUSDPriceFeed:
      "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419" as Address,
  },
};
