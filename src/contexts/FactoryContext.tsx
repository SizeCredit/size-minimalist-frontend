import { createContext, ReactNode } from "react";

interface FactoryContext {}

export const FactoryContext = createContext<FactoryContext>(
  {} as FactoryContext,
);

type Props = {
  children: ReactNode;
};

export function FactoryProvider({ children }: Props) {
  return (
    <FactoryContext.Provider value={{}}>{children}</FactoryContext.Provider>
  );
}
