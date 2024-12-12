import { Address } from "viem";
import { base } from "wagmi/chains";

export default {
  chain: base,
  addresses: {
    SizeFactory: "0x330Dc31dB45672c1F565cf3EC91F9a01f8f3DF0b" as Address,
    UniswapV3Factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD" as Address,
    AaveV3Pool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5" as Address,
    WETH: "0x4200000000000000000000000000000000000006" as Address,
    ChainlinkSequencerUptimeFeed:
      "0xBCF85224fc0756B9Fa45aA7892530B47e10b6433" as Address,
  },
};
