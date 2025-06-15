'use client'

import '@mysten/dapp-kit/dist/index.css'
import React, { useState } from 'react'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { Header } from '@/components/Header'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'

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
    testnet: { url: getFullnodeUrl('testnet') },
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networks}
        defaultNetwork="testnet"
      >
        <WalletProvider>
          <div className="bg-[url('/img/abstract_bg.png')] bg-cover bg-repeat-y ">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-gradient-to-r from-[#558EB4] via-[#1388D5] to-[#8F564E] p-[1px]">
                  <div className="bg-[#12121266] backdrop-blur-sm relative">
                    <div className="max-w-7xl mx-auto px-4 py-3 relative items-center text-center">
                      <div className="flex items-center space-x-4 text-center justify-center">
                        Launching on Mainnet Next Week
                      </div>
                    </div>

                    <div className="flex w-full">
                      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#558EB4] to-[#1388D5]"></div>
                      <div className="flex-1 h-[1px] bg-gradient-to-r from-[#1388D5] via-[#8F564E] to-transparent"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <Header />
            {children}
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
