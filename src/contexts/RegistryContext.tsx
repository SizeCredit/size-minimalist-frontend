import {
  createContext,
  ReactNode,
  Dispatch,
  useContext,
  useEffect,
  useState,
} from "react";
import Size from "../abi/Size.json";
import SizeFactory from "../abi/SizeFactory.json";
import {
  DataViewStruct,
  InitializeFeeConfigParamsStruct,
  InitializeOracleParamsStruct,
  InitializeRiskConfigParamsStruct,
} from "../types/ethers-contracts/Size";
import { readContract } from "wagmi/actions";
import { ChainInfo, ConfigContext } from "./ConfigContext";
import { Abi, Address, erc20Abi, zeroAddress, zeroHash } from "viem";
import { Config } from "wagmi";
import { CustomWagmiContext } from "./CustomWagmiContext";
import IPriceFeed from "../abi/IPriceFeed.json";

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
  price: bigint;
}

export interface Market {
  chainInfo: ChainInfo;
  address: Address;
  description: string;
  data: DataViewStruct;
  feeConfig: InitializeFeeConfigParamsStruct;
  riskConfig: InitializeRiskConfigParamsStruct;
  oracle: InitializeOracleParamsStruct;
  priceFeed: PriceFeedInformation;
  admin: Address;
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
    chainId,
    abi,
    address,
    functionName,
    args,
    defaultValue,
  }: {
    chainId: number;
    abi: Abi;
    address: Address;
    functionName: string;
    args?: any[];
    defaultValue: T;
  },
): Promise<T> {
  return readContract(config, {
    chainId,
    abi,
    address,
    args,
    functionName,
  })
    .then((value) => value as T)
    .catch(() => defaultValue);
}

export function RegistryProvider({ children }: Props) {
  const { config } = useContext(CustomWagmiContext);
  const { chainInfos } = useContext(ConfigContext);
  const [progress, setProgress] = useState(0);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketName, setMarketName] = useState<string | undefined>(undefined);

  const market = markets.find((m) => m.description === marketName);

  const updateMarkets = async () => {
    setProgress(0);

    const marketChainArray = await Promise.all(
      chainInfos.map(async (chainInfo) => {
        const addresses = (await readContract(config, {
          chainId: chainInfo.chain.id,
          abi: SizeFactory.abi,
          address: chainInfo.addresses.SizeFactory,
          functionName: "getMarkets",
        })) as Address[];

        const descriptions = (await readContractWithDefault(config, {
          chainId: chainInfo.chain.id,
          abi: SizeFactory.abi as Abi,
          address: chainInfo.addresses.SizeFactory,
          functionName: "getMarketDescriptions",
          defaultValue: Array.from({ length: addresses.length }, () => "N/A"),
        })) as string[];

        const datas = await Promise.all(
          addresses.map(
            (address) =>
              readContract(config, {
                chainId: chainInfo.chain.id,
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
                chainId: chainInfo.chain.id,
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
                chainId: chainInfo.chain.id,
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
                chainId: chainInfo.chain.id,
                abi: Size.abi,
                address,
                functionName: "oracle",
              }) as Promise<InitializeOracleParamsStruct>,
          ),
        );

        const priceFeedInformation = await Promise.all(
          addresses.map(async (_, i) => {
            return {
              price: (await readContract(config, {
                chainId: chainInfo.chain.id,
                abi: IPriceFeed.abi as Abi,
                address: oracles[i].priceFeed as Address,
                functionName: "getPrice",
              })) as bigint,
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
                  chainId: chainInfo.chain.id,
                  abi: erc20Abi,
                  address: (datas[i] as any)[tokenName],
                  functionName: "symbol",
                });
                const decimals = await readContract(config, {
                  chainId: chainInfo.chain.id,
                  abi: erc20Abi,
                  address: (datas[i] as any)[tokenName],
                  functionName: "decimals",
                });
                const totalSupply = await readContract(config, {
                  chainId: chainInfo.chain.id,
                  abi: erc20Abi,
                  address: (datas[i] as any)[tokenName],
                  functionName: "totalSupply",
                });
                const feeRecipientBalance = await readContract(config, {
                  chainId: chainInfo.chain.id,
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

        const adminAddresses = await Promise.all(
          addresses.map(async (address) => {
            const admin = chainInfo.addresses.admin;
            const owner = (await readContractWithDefault(config, {
              chainId: chainInfo.chain.id,
              abi: [
                {
                  inputs: [],
                  name: "owner",
                  outputs: [
                    { internalType: "address", name: "", type: "address" },
                  ],
                  stateMutability: "view",
                  type: "function",
                },
              ] as Abi,
              address,
              functionName: "owner",
              defaultValue: zeroAddress,
            })) as Address;
            const hasRole = (await readContractWithDefault(config, {
              chainId: chainInfo.chain.id,
              abi: Size.abi as Abi,
              address,
              functionName: "hasRole",
              args: [zeroHash, admin],
              defaultValue: false,
            })) as boolean;
            return hasRole ? admin : owner;
          }),
        );

        const ms = addresses.map((address, i) => ({
          chainInfo,
          address,
          description: descriptions[i],
          data: datas[i],
          feeConfig: feeConfigs[i],
          riskConfig: riskConfigs[i],
          oracle: oracles[i],
          tokens: tokens[i],
          priceFeed: priceFeedInformation[i],
          admin: adminAddresses[i],
        }));

        return ms;
      }),
    );

    const marketsArray = marketChainArray.reduce((acc, m) => {
      acc.push(...m);
      return acc;
    }, [] as Market[]);

    setMarkets(marketsArray);

    const productionMarkets = marketsArray.filter(
      (m) => !m.chainInfo.chain.testnet,
    );

    setMarketName(productionMarkets[productionMarkets.length - 1].description);
    setProgress(100);
  };

  useEffect(() => {
    if (!chainInfos.length) return;

    updateMarkets();
  }, [chainInfos]);

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
