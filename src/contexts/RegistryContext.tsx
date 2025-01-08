import {
  createContext,
  ReactNode,
  Dispatch,
  useContext,
  useEffect,
  useState,
} from "react";
import { config } from "../wagmi";
import Size from "../abi/Size.json";
import SizeFactory from "../abi/SizeFactory.json";
import PriceFeed from "../abi/PriceFeed.json";
import UniswapV3PriceFeed from "../abi/UniswapV3PriceFeed.json";
import ChainlinkPriceFeed from "../abi/ChainlinkPriceFeed.json";
import AggregatorV3Interface from "../abi/AggregatorV3Interface.json";
import {
  DataViewStruct,
  InitializeFeeConfigParamsStruct,
  InitializeOracleParamsStruct,
  InitializeRiskConfigParamsStruct,
} from "../typechain/Size";
import { readContract } from "wagmi/actions";
import { ConfigContext } from "./ConfigContext";
import { Abi, Address, erc20Abi } from "viem";
import { Config } from "wagmi";

export type Token =
  | "underlyingCollateralToken"
  | "underlyingBorrowToken"
  | "collateralToken"
  | "borrowAToken"
  | "debtToken";

interface TokenInformation {
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  feeRecipientBalance: bigint;
}

interface PriceFeedInformation {
  base?: Address;
  quote?: Address;
  baseDescription?: string;
  quoteDescription?: string;
  baseStalePriceInterval?: number;
  quoteStalePriceInterval?: number;
  price: bigint;
  chainlinkPriceFeedPrice?: bigint;
  uniswapV3PriceFeedPrice?: bigint;
  uniswapV3PriceFeedTWAPWindow?: number;
}

export interface Market {
  address: Address;
  description: string;
  data: DataViewStruct;
  feeConfig: InitializeFeeConfigParamsStruct;
  riskConfig: InitializeRiskConfigParamsStruct;
  oracle: InitializeOracleParamsStruct;
  priceFeed: PriceFeedInformation;
  tokens: Record<Token, TokenInformation>;
}

interface RegistryContext {
  markets: Market[];
  market?: Market;
  progress: number;
  updateMarkets: () => Promise<void>;
  setMarketName: Dispatch<string>;
}

export const RegistryContext = createContext<RegistryContext>(
  {} as RegistryContext,
);

type Props = {
  children: ReactNode;
};

async function readContractWithDefault<T>(
  config: Config,
  {
    abi,
    address,
    functionName,
    defaultValue,
  }: {
    abi: Abi;
    address: Address;
    functionName: string;
    defaultValue: T;
  },
): Promise<T> {
  return readContract(config, {
    abi,
    address,
    functionName,
  })
    .then((value) => value as T)
    .catch(() => defaultValue);
}

export function RegistryProvider({ children }: Props) {
  const { chain } = useContext(ConfigContext);
  const [progress, setProgress] = useState(0);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketName, setMarketName] = useState<string | undefined>(undefined);

  const market = markets.find((m) => m.description === marketName);

  const updateMarkets = async () => {
    if (!chain) return;

    setProgress(0);

    const addresses = (await readContract(config, {
      abi: SizeFactory.abi,
      address: chain.addresses.SizeFactory,
      functionName: "getMarkets",
    })) as Address[];

    const descriptions = (await readContractWithDefault(config, {
      abi: SizeFactory.abi as Abi,
      address: chain.addresses.SizeFactory,
      functionName: "getMarketDescriptions",
      defaultValue: Array.from({ length: addresses.length }, () => "N/A"),
    })) as string[];

    const datas = await Promise.all(
      addresses.map(
        (address) =>
          readContract(config, {
            abi: Size.abi,
            address,
            functionName: "data",
          }) as Promise<DataViewStruct>,
      ),
    );

    const feeConfigs = await Promise.all(
      addresses.map(
        (address) =>
          readContract(config, {
            abi: Size.abi,
            address,
            functionName: "feeConfig",
          }) as Promise<InitializeFeeConfigParamsStruct>,
      ),
    );

    const riskConfigs = await Promise.all(
      addresses.map(
        (address) =>
          readContract(config, {
            abi: Size.abi,
            address,
            functionName: "riskConfig",
          }) as Promise<InitializeRiskConfigParamsStruct>,
      ),
    );

    const oracles = await Promise.all(
      addresses.map(
        (address) =>
          readContract(config, {
            abi: Size.abi,
            address,
            functionName: "oracle",
          }) as Promise<InitializeOracleParamsStruct>,
      ),
    );

    const priceFeedInformation = await Promise.all(
      addresses.map(async (_, i) => {
        const [
          base,
          quote,
          baseStalePriceInterval,
          quoteStalePriceInterval,
          getPrice,
          chainlinkPriceFeed,
          uniswapV3PriceFeed,
        ] = await Promise.all(
          [
            "base",
            "quote",
            "baseStalePriceInterval",
            "quoteStalePriceInterval",
            "getPrice",
            "chainlinkPriceFeed",
            "uniswapV3PriceFeed",
          ].map(
            async (param) =>
              readContractWithDefault(config, {
                abi: PriceFeed.abi as Abi,
                address: oracles[i].priceFeed as Address,
                functionName: param,
                defaultValue: undefined,
              }) as Promise<unknown>,
          ),
        );
        return {
          base: base as Address,
          quote: quote as Address,
          baseDescription: (await readContractWithDefault(config, {
            abi: AggregatorV3Interface.abi as Abi,
            address: base as Address,
            functionName: "description",
            defaultValue: undefined,
          })) as string | undefined,
          quoteDescription: (await readContractWithDefault(config, {
            abi: AggregatorV3Interface.abi as Abi,
            address: quote as Address,
            functionName: "description",
            defaultValue: undefined,
          })) as string | undefined,
          baseStalePriceInterval: Number(baseStalePriceInterval as bigint),
          quoteStalePriceInterval: Number(quoteStalePriceInterval as bigint),
          price: getPrice as bigint,
          chainlinkPriceFeedPrice: (await readContractWithDefault(config, {
            abi: ChainlinkPriceFeed.abi as Abi,
            address: chainlinkPriceFeed as Address,
            functionName: "getPrice",
            defaultValue: undefined,
          })) as bigint | undefined,
          uniswapV3PriceFeedPrice: (await readContractWithDefault(config, {
            abi: UniswapV3PriceFeed.abi as Abi,
            address: uniswapV3PriceFeed as Address,
            functionName: "getPrice",
            defaultValue: undefined,
          })) as bigint | undefined,
          uniswapV3PriceFeedTWAPWindow: (await readContractWithDefault(config, {
            abi: UniswapV3PriceFeed.abi as Abi,
            address: uniswapV3PriceFeed as Address,
            functionName: "twapWindow",
            defaultValue: undefined,
          })) as number | undefined,
        };
      }),
    );

    const tokens = await Promise.all(
      addresses.map(async (_, i) => {
        const tokensArray = await Promise.all(
          [
            "underlyingCollateralToken",
            "underlyingBorrowToken",
            "collateralToken",
            "borrowAToken",
            "debtToken",
          ].map(async (tokenName) => {
            const symbol = await readContract(config, {
              abi: erc20Abi,
              address: (datas[i] as any)[tokenName],
              functionName: "symbol",
            });
            const decimals = await readContract(config, {
              abi: erc20Abi,
              address: (datas[i] as any)[tokenName],
              functionName: "decimals",
            });
            const totalSupply = await readContract(config, {
              abi: erc20Abi,
              address: (datas[i] as any)[tokenName],
              functionName: "totalSupply",
            });
            const feeRecipientBalance = await readContract(config, {
              abi: erc20Abi,
              address: (datas[i] as any)[tokenName],
              functionName: "balanceOf",
              args: [feeConfigs[i].feeRecipient as Address],
            });
            return {
              symbol,
              decimals,
              totalSupply,
              feeRecipientBalance,
              tokenName,
            };
          }),
        );
        return tokensArray.reduce(
          (acc, { tokenName, ...rest }) => {
            acc[tokenName as Token] = { ...rest };
            return acc;
          },
          {} as Record<Token, TokenInformation>,
        );
      }),
    );

    setMarkets(
      addresses.map((address, i) => ({
        address,
        description: descriptions[i],
        data: datas[i],
        feeConfig: feeConfigs[i],
        riskConfig: riskConfigs[i],
        oracle: oracles[i],
        tokens: tokens[i],
        priceFeed: priceFeedInformation[i],
      })),
    );

    setMarketName(descriptions[descriptions.length - 1]);

    setProgress(100);
  };

  useEffect(() => {
    if (!chain) return;

    updateMarkets();
  }, [chain]);

  return (
    <RegistryContext.Provider
      value={{
        markets,
        market,
        progress,
        updateMarkets,
        setMarketName,
      }}
    >
      {children}
    </RegistryContext.Provider>
  );
}
