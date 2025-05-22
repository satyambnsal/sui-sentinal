'use client'

import '@mysten/dapp-kit/dist/index.css'
import React, { useState } from 'react'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { Header } from '@/components/Header'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )
  const networks = {
    devnet: { url: getFullnodeUrl('devnet') },
    testnet: { url: getFullnodeUrl('testnet') },
    mainnet: { url: getFullnodeUrl('mainnet') },
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networks}
        defaultNetwork="testnet"
      >
        <WalletProvider>
          <div className="bg-[url('/img/abstract_bg.png')] bg-cover bg-repeat-y">
            <Header />
            {children}
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
