import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { config } from "../wagmi";
import PriceFeed from "../abi/PriceFeed.json";
import { readContract } from "wagmi/actions";
import { FactoryContext } from "./FactoryContext";
import { Address } from "viem";

interface PriceContext {
  price?: number;
}

export const PriceContext = createContext<PriceContext>({} as PriceContext);

type Props = {
  children: ReactNode;
};

export function PriceProvider({ children }: Props) {
  const { market } = useContext(FactoryContext);
  const [price, setPrice] = useState<number>();

  useEffect(() => {
    if (!market) return;

    (async () => {
      const p = await readContract(config, {
        abi: PriceFeed.abi,
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
