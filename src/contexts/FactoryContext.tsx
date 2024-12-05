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
import AggregatorV3Interface from "../abi/AggregatorV3Interface.json";
import {
  DataViewStruct,
  InitializeFeeConfigParamsStruct,
  InitializeOracleParamsStruct,
  InitializeRiskConfigParamsStruct,
} from "../typechain/Size";
import { readContract } from "wagmi/actions";
import { ConfigContext } from "./ConfigContext";
import { Address, erc20Abi } from "viem";

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
  base: Address;
  quote: Address;
  baseDescription: string;
  quoteDescription: string;
  baseStalePriceInterval: number;
  quoteStalePriceInterval: number;
  price: bigint;
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

interface FactoryContext {
  markets: Market[];
  market?: Market;
  progress: number;
  updateMarkets: () => Promise<void>;
  setMarketName: Dispatch<string>;
}

export const FactoryContext = createContext<FactoryContext>(
  {} as FactoryContext,
);

type Props = {
  children: ReactNode;
};

export function FactoryProvider({ children }: Props) {
  const { chain } = useContext(ConfigContext);
  const [progress, setProgress] = useState(0);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketName, setMarketName] = useState<string | undefined>(undefined);

  const market = markets.find((m) => m.description === marketName);

  const updateMarkets = async () => {
    setProgress(0);

    const addresses = (await readContract(config, {
      abi: SizeFactory.abi,
      address: chain.SizeFactory,
      functionName: "getMarkets",
    })) as Address[];

    const descriptions = (await readContract(config, {
      abi: SizeFactory.abi,
      address: chain.SizeFactory,
      functionName: "getMarketDescriptions",
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
        ] = await Promise.all(
          [
            "base",
            "quote",
            "baseStalePriceInterval",
            "quoteStalePriceInterval",
            "getPrice",
          ].map(
            async (param) =>
              readContract(config, {
                abi: PriceFeed.abi,
                address: oracles[i].priceFeed as Address,
                functionName: param,
              }) as Promise<unknown>,
          ),
        );
        console.log(baseStalePriceInterval);
        return {
          base: base as Address,
          quote: quote as Address,
          baseDescription: (await readContract(config, {
            abi: AggregatorV3Interface.abi,
            address: base as Address,
            functionName: "description",
          })) as string,
          quoteDescription: (await readContract(config, {
            abi: AggregatorV3Interface.abi,
            address: quote as Address,
            functionName: "description",
          })) as string,
          baseStalePriceInterval: Number(baseStalePriceInterval as bigint),
          quoteStalePriceInterval: Number(quoteStalePriceInterval as bigint),
          price: getPrice as bigint,
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
    updateMarkets();
  }, [chain]);

  return (
    <FactoryContext.Provider
      value={{
        markets,
        market,
        progress,
        updateMarkets,
        setMarketName,
      }}
    >
      {children}
    </FactoryContext.Provider>
  );
}
