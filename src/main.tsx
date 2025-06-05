import { Buffer } from "buffer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";

import "./index.css";
import { CustomWagmiProvider } from "./contexts/CustomWagmiContext.tsx";
import { ConfigProvider } from "./contexts/ConfigContext.tsx";
import { UserProvider } from "./contexts/UserContext.tsx";
import { PositionsProvider } from "./contexts/PositionsContext.tsx";
import { LimitOrdersProvider } from "./contexts/LimitOrdersContext.tsx";
import { PriceProvider } from "./contexts/PriceContext.tsx";
import { SwapProvider } from "./contexts/SwapContext.tsx";
import { SidebarProvider } from "./contexts/SidebarContext.tsx";
import { SizeProvider } from "./contexts/SizeContext.tsx";
import { FactoryProvider } from "./contexts/FactoryContext.tsx";
import { RegistryProvider } from "./contexts/RegistryContext.tsx";
import { AuthorizationProvider } from "./contexts/AuthorizationContext.tsx";
import { LeverageProvider } from "./contexts/LeverageContext.tsx";

globalThis.Buffer = Buffer;

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CustomWagmiProvider>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider>
            <RegistryProvider>
              <FactoryProvider>
                <PriceProvider>
                  <PositionsProvider>
                    <AuthorizationProvider>
                      <LimitOrdersProvider>
                        <UserProvider>
                          <SwapProvider>
                            <SidebarProvider>
                              <SizeProvider>
                                <LeverageProvider>
                                  <App />
                                </LeverageProvider>
                              </SizeProvider>
                            </SidebarProvider>
                          </SwapProvider>
                        </UserProvider>
                      </LimitOrdersProvider>
                    </AuthorizationProvider>
                  </PositionsProvider>
                </PriceProvider>
              </FactoryProvider>
            </RegistryProvider>
          </ConfigProvider>
        </QueryClientProvider>
      </CustomWagmiProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
