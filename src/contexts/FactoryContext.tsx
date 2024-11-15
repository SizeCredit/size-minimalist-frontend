import { createContext, ReactNode } from "react";

interface FactoryContext {
  createMarket: () => void;
  createPriceFeed: () => void;
  createBorrowATokenV1_5: () => void;
}

export const FactoryContext = createContext<FactoryContext>(
  {} as FactoryContext,
);

type Props = {
  children: ReactNode;
};

export function FactoryProvider({ children }: Props) {
  const createMarket = () => {
    console.log("createMarket");
  };
  const createPriceFeed = () => {
    console.log("createPriceFeed");
  };
  const createBorrowATokenV1_5 = () => {
    console.log("createBorrowATokenV1_5");
  };

  return (
    <FactoryContext.Provider
      value={{
        createMarket,
        createPriceFeed,
        createBorrowATokenV1_5,
      }}
    >
      {children}
    </FactoryContext.Provider>
  );
}
