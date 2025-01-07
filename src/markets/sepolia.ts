import { Address, zeroAddress } from "viem";
import { sepolia } from "wagmi/chains";

export default {
  chain: sepolia,
  explorer: "https://sepolia.etherscan.io",
  addresses: {
    SizeFactory: "0x9089e45c85575945e41b80c547d5fc6ddb08bffd" as Address,
    AaveV3Pool: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951" as Address,
    WETH: "0x7b79995e5f793a07bc00c21412e50ecae098e7f9" as Address,
    ChainlinkSequencerUptimeFeed: zeroAddress as Address,
    ChainlinkETHUSDPriceFeed:
      "0x694AA1769357215DE4FAC081bf1f309aDC325306" as Address,
  },
};
