import { useState, useCallback } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CONFIG } from '@/constants'
import { toast } from 'react-toastify'

const MIST_PER_SUI = 1_000_000_000
const GAS_BUDGET = 50_000_000

interface UseFundAgentOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface FundAgentParams {
  agentObjectId: string
  amount: number // Amount in SUI
}

export const useFundAgent = (options: UseFundAgentOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
  const client = useSuiClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)

  const account = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          // Raw effects are required so the effects can be reported back to the wallet
          showRawEffects: true,
          // Select additional data to return
          showObjectChanges: true,
        },
      }),
  })

  const fundAgent = useCallback(
    async ({ agentObjectId, amount }: FundAgentParams) => {
      if (!account?.address) {
        const errorMsg = 'Wallet not connected'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      if (!agentObjectId || !amount || amount <= 0) {
        const errorMsg = 'Invalid agent ID or amount'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Get user's SUI coins
        const coins = await client.getCoins({
          owner: account.address,
          coinType: '0x2::sui::SUI',
        })

        if (!coins.data.length) {
          throw new Error('No SUI coins found in wallet')
        }

        const amountInMist = BigInt(amount * MIST_PER_SUI)

        // Find and select coins that cover the amount
        const sortedCoins = coins.data.sort((a, b) => Number(b.balance) - Number(a.balance))
        const selectedCoins: string[] = []
        let total = BigInt(0)

        for (const coin of sortedCoins) {
          selectedCoins.push(coin.coinObjectId)
          total += BigInt(coin.balance)
          if (total >= amountInMist) break
        }

        if (total < amountInMist) {
          throw new Error(`Insufficient SUI balance. Need ${amount} SUI`)
        }

        // Create transaction
        const tx = new Transaction()

        // Handle coin merging if multiple coins needed
        const paymentCoin = selectedCoins[0]
        if (selectedCoins.length > 1) {
          for (let i = 1; i < selectedCoins.length; i++) {
            tx.mergeCoins(paymentCoin, [selectedCoins[i]])
          }
        }

        // Split the exact amount needed for payment
        const [exactCoin] = tx.splitCoins(paymentCoin, [tx.pure.u64(amountInMist)])

        // Call the fund_agent function
        tx.moveCall({
          target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::fund_agent`,
          arguments: [
            tx.object(agentObjectId), // agent: &mut Agent
            exactCoin, // payment: Coin<SUI>
          ],
        })
        tx.setGasBudget(GAS_BUDGET)

        // Execute transaction with promise-based approach
        return new Promise((resolve, reject) => {
          signAndExecuteTransaction(
            { transaction: tx },
            {
              onSuccess: (result) => {
                console.log('Fund agent transaction success:', result)
                setLastResult(result)

                if (showToasts) {
                  toast.success(`Successfully funded agent with ${amount} SUI`)
                }

                onSuccess?.(result)
                resolve(result)
              },
              onError: (txError) => {
                console.error('Transaction failed:', txError)
                const errorMsg = 'Transaction failed'
                setError(errorMsg)

                if (showToasts) {
                  toast.error(errorMsg)
                }

                const error = new Error(errorMsg)
                onError?.(error)
                reject(error)
              },
            }
          )
        })
      } catch (error) {
        console.error('Error funding agent:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fund agent'
        setError(errorMessage)

        if (showToasts) {
          toast.error(errorMessage)
        }

        const finalError = error instanceof Error ? error : new Error(errorMessage)
        onError?.(finalError)
        throw finalError
      } finally {
        setIsLoading(false)
      }
    },
    [account?.address, signAndExecuteTransaction, onSuccess, onError, showToasts]
  )

  const reset = useCallback(() => {
    setError(null)
    setLastResult(null)
  }, [])

  return {
    fundAgent,
    isLoading,
    error,
    lastResult,
    reset,
    isConnected: !!account?.address,
  }
}

// Export types for convenience
export type { FundAgentParams, UseFundAgentOptions }
