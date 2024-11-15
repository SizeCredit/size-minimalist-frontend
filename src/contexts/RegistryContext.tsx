import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { config } from "../wagmi";
import { Address, ConfigContext } from "./ConfigContext";
import {
  DataViewStruct,
  InitializeFeeConfigParamsStruct,
  InitializeOracleParamsStruct,
  InitializeRiskConfigParamsStruct,
} from "../typechain/Size";
import { readContract } from "wagmi/actions";

interface Market {
  address: Address;
  description: string;
  data: DataViewStruct;
  feeConfig: InitializeFeeConfigParamsStruct;
  riskConfig: InitializeRiskConfigParamsStruct;
  oracle: InitializeOracleParamsStruct;
}

interface RegistryContext {
  markets: Market[];
  progress: number;
  updateMarkets: () => Promise<void>;
}

export const RegistryContext = createContext<RegistryContext>(
  {} as RegistryContext,
);

type Props = {
  children: ReactNode;
};

export function RegistryProvider({ children }: Props) {
  const { chain, market } = useContext(ConfigContext);
  const { deployment } = market;
  const [progress, setProgress] = useState(0);
  const [markets, setMarkets] = useState<Market[]>([]);

  const updateMarkets = async () => {
    setProgress(0);

    const addresses = (await readContract(config, {
      abi: chain.SizeRegistry.abi,
      address: chain.SizeRegistry.address,
      functionName: "getMarkets",
    })) as Address[];

    const descriptions = (await readContract(config, {
      abi: chain.SizeRegistry.abi,
      address: chain.SizeRegistry.address,
      functionName: "getMarketsDescriptions",
    })) as string[];

    const datas = await Promise.all(
      addresses.map(
        (address) =>
          readContract(config, {
            abi: deployment.Size.abi,
            address,
            functionName: "data",
          }) as Promise<DataViewStruct>,
      ),
    );

    const feeConfigs = await Promise.all(
      addresses.map(
        (address) =>
          readContract(config, {
            abi: deployment.Size.abi,
            address,
            functionName: "feeConfig",
          }) as Promise<InitializeFeeConfigParamsStruct>,
      ),
    );

    const riskConfigs = await Promise.all(
      addresses.map(
        (address) =>
          readContract(config, {
            abi: deployment.Size.abi,
            address,
            functionName: "riskConfig",
          }) as Promise<InitializeRiskConfigParamsStruct>,
      ),
    );

    const oracles = await Promise.all(
      addresses.map(
        (address) =>
          readContract(config, {
            abi: deployment.Size.abi,
            address,
            functionName: "oracle",
          }) as Promise<InitializeOracleParamsStruct>,
      ),
    );

    setMarkets(
      addresses.map((address, i) => ({
        address,
        description: descriptions[i],
        data: datas[i],
        feeConfig: feeConfigs[i],
        riskConfig: riskConfigs[i],
        oracle: oracles[i],
      })),
    );

    setProgress(100);
  };

  useEffect(() => {
    updateMarkets();
  }, [deployment]);

  return (
    <RegistryContext.Provider
      value={{
        markets,
        progress,
        updateMarkets,
      }}
    >
      {children}
    </RegistryContext.Provider>
  );
}
