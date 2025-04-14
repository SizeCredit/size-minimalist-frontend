import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import IPriceFeed from "../abi/IPriceFeed.json";
import { readContract } from "wagmi/actions";
import { RegistryContext } from "./RegistryContext";
import { Address } from "viem";
import { CustomWagmiContext } from "./CustomWagmiContext";

interface PriceContext {
  price?: number;
}

export const PriceContext = createContext<PriceContext>({} as PriceContext);

type Props = {
  children: ReactNode;
};

export function PriceProvider({ children }: Props) {
  const { config } = useContext(CustomWagmiContext);
  const { market } = useContext(RegistryContext);
  const [price, setPrice] = useState<number>();

  useEffect(() => {
    if (!market) return;

    (async () => {
      const p = await readContract(config, {
        chainId: market.chainInfo.chain.id,
        abi: IPriceFeed.abi,
        address: market.oracle.priceFeed as Address,
        functionName: "getPrice",
      });

      setPrice(Number(p) / 1e18);
    })();
  }, [market]);

  return (
    <PriceContext.Provider
      value={{
        price,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
}
