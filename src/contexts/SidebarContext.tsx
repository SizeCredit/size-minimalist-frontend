import { createContext, ReactNode, useState } from "react";

interface SidebarContext {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const SidebarContext = createContext<SidebarContext>(
  {} as SidebarContext,
);

type Props = {
  children: ReactNode;
};

export function SidebarProvider({ children }: Props) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
