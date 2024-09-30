import { Buffer } from 'buffer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'

import App from './App.tsx'
import { config } from './wagmi.ts'

import './index.css'
import { ConfigProvider } from './contexts/ConfigContext.tsx'
import { UserProvider } from './contexts/UserContext.tsx'
import { PositionsProvider } from './contexts/PositionsContext.tsx'
import { LimitOrdersProvider } from './contexts/LimitOrders.tsx'

globalThis.Buffer = Buffer

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>
          <PositionsProvider>
            <LimitOrdersProvider>
              <UserProvider>
                <App />
              </UserProvider>
            </LimitOrdersProvider>
          </PositionsProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
