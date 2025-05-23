'use client'

import { useEffect, useState } from 'react'
import { Copy, X, Check } from 'lucide-react'
import clsx from 'clsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ConnectButton as SuiConnectButton,
  useCurrentAccount,
  useDisconnectWallet,
} from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { SUI_FAUCET_URL } from '@/constants'

//TODO: need to check the current network
export const client = new SuiClient({ url: getFullnodeUrl('testnet') })

interface ConnectButtonProps {
  className?: string
  showAddress?: boolean
}

export const ConnectButton = ({ className = '', showAddress = true }: ConnectButtonProps) => {
  const account = useCurrentAccount()
  const [copied, setCopied] = useState(false)
  const { mutate: disconnect } = useDisconnectWallet()
  const [suiBalance, setSuiBalance] = useState<number | undefined>(0)

  const handleCopyAddress = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account?.address) return

      try {
        const coins = await client.getCoins({
          owner: account.address,
          coinType: '0x2::sui::SUI',
        })

        const totalBalance = coins.data.reduce((sum, coin) => sum + Number(coin.balance), 0)

        setSuiBalance(totalBalance / 10 ** 9)
      } catch (err) {
        console.error('Error fetching SUI balance', err)
      }
    }

    fetchBalance()
  }, [account?.address])

  return (
    <AnimatePresence mode="wait">
      {account ? (
        showAddress ? (
          <motion.div
            key="connected"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Network Pill */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center px-3 py-1.5 bg-[#1A1B1F] rounded-full border border-[#383838] hover:border-[#4c4c4c] transition-colors"
            >
              <div className="w-2 h-2 bg-[#58F083] rounded-full mr-2" />
              <span className="text-sm text-[#FAFAFA] font-medium uppercase">Sui Testnet</span>
              <div className="mx-2 h-3 w-px bg-[#383838]" />
              <a
                href={SUI_FAUCET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#FFFFFF] hover:text-[#CCCCCC] transition-colors"
              >
                Get SUI
              </a>
            </motion.div>

            {/* Balance + Address Pill */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    onClick={handleCopyAddress}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1B1F] rounded-full border border-[#383838] hover:border-[#4c4c4c] transition-colors cursor-pointer"
                  >
                    {/* Balance */}
                    <div className="flex items-center border-r border-[#383838] pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#FAFAFA]">
                          {`${suiBalance} SUI`}
                        </span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#FAFAFA]">
                        {formatAddress(account.address)}
                      </span>
                      {copied ? <Check size={14} className="text-[#58F083]" /> : <Copy size={14} />}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                disconnect()
                              }}
                              className="hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Disconnect</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Address copied!' : 'Copy address'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        ) : null
      ) : (
        <motion.div
          key="connect"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <SuiConnectButton
            className={clsx(
              'px-4 py-2 bg-[#1A1B1F] rounded-full border border-[#383838] hover:border-[#424242] transition-colors text-[#FAFAFA] font-medium',
              className
            )}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
