import { Address, zeroAddress } from "viem";
import { mainnet } from "wagmi/chains";

export default {
  chainId: mainnet.id,
  addresses: {
    admin: "0x462B545e8BBb6f9E5860928748Bfe9eCC712c3a7" as Address,
    feeRecipient: "0x12328eA44AB6D7B18aa9Cc030714763734b625dB" as Address,
    LeverageUp: "0xF4a21Ac7e51d17A0e1C8B59f7a98bb7A97806f14" as Address,
    "PendleMarket_PT-wstUSR-25SEP2025":
      "0x09fA04Aac9c6d1c6131352EE950CD67ecC6d4fB9" as Address,
    "PendleMarket_PT-sUSDE-31JUL2025":
      "0x4339Ffe2B7592Dc783ed13cCE310531aB366dEac" as Address,
    "PendleMarket_PT-sUSDE-29MAY2025":
      "0xB162B764044697cf03617C2EFbcB1f42e31E4766" as Address,
    PendleRouter: "0x888888888889758F76e7103c6CbF23ABbF58F946" as Address,
    SizeFactory: "0x3A9C05c3Da48E6E26f39928653258D7D4Eb594C1" as Address,
    AaveV3Pool: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" as Address,
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address,
    ChainlinkSequencerUptimeFeed: zeroAddress as Address,
    ChainlinkETHUSDPriceFeed:
      "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419" as Address,
  },
};
