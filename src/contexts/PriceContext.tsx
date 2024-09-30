import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ConfigContext } from './ConfigContext';
import { config } from '../wagmi'
import { readContract } from 'wagmi/actions';

interface PriceContext {
  price?: number
}

export const PriceContext = createContext<PriceContext>({} as PriceContext);

type Props = {
  children: ReactNode;
};

export function PriceProvider({ children }: Props) {
  const { deployment } = useContext(ConfigContext)
  const [price, setPrice] = useState<number>()

  useEffect(() => {
    ; (async () => {
      const p = await readContract(config, {
        abi: deployment.PriceFeed.abi,
        address: deployment.PriceFeed.address,
        functionName: 'getPrice',
      })

      setPrice(Number(p) / 1e18)
    })()
  }, [])

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
