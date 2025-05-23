/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { MIST_PER_SUI, SUI_CONFIG } from '@/constants'
import { toast } from 'react-toastify'

const GAS_BUDGET = 1_000_000
const GAS_OBJECT_MIN_BALANCE = BigInt(GAS_BUDGET) * BigInt(2)

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
      console.log({ agentObjectId, amount })
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
          limit: 100,
        })

        if (!coins.data.length) {
          throw new Error('No SUI coins found in wallet')
        }

        const amountInMist = BigInt(Math.floor(amount * MIST_PER_SUI))
        const totalNeeded = amountInMist + GAS_OBJECT_MIN_BALANCE

        // Sort coins by balance (largest first)
        const sortedCoins = coins.data.sort((a, b) => Number(b.balance) - Number(a.balance))

        // Calculate total available balance
        const totalAvailable = sortedCoins.reduce(
          (sum, coin) => sum + BigInt(coin.balance),
          BigInt(0)
        )
        console.log('Amount needed (SUI):', amount)
        console.log('Gas needed (SUI):', Number(GAS_OBJECT_MIN_BALANCE) / MIST_PER_SUI)
        console.log('Total needed (SUI):', Number(totalNeeded) / MIST_PER_SUI)
        console.log('Total available (SUI):', Number(totalAvailable) / MIST_PER_SUI)

        if (totalAvailable < totalNeeded) {
          console.log({ totalAvailable, totalNeeded })
          throw new Error(
            `Insufficient SUI balance. Need ${amount} SUI + gas fees, have ${
              Number(totalAvailable) / MIST_PER_SUI
            } SUI`
          )
        }

        // Create transaction
        const tx = new Transaction()

        const largestCoin = sortedCoins[0]
        const largestBalance = BigInt(largestCoin.balance)

        if (largestBalance >= totalNeeded) {
          console.log('✅ Using single coin for both payment and gas')

          // Split exact payment amount from largest coin
          const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)])

          // Use remaining balance in original coin for gas
          tx.setGasPayment([
            {
              objectId: largestCoin.coinObjectId,
              version: largestCoin.version,
              digest: largestCoin.digest,
            },
          ])

          // Call fund_agent function
          tx.moveCall({
            target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::fund_agent`,
            arguments: [tx.object(agentObjectId), paymentCoin],
          })
        } else {
          console.log('📋 Need multiple coins - using merge strategy')

          // Merge coins to create a single large coin
          const selectedCoins = []
          let runningTotal = BigInt(0)

          // Select minimum coins needed for total amount
          for (const coin of sortedCoins) {
            selectedCoins.push(coin)
            runningTotal += BigInt(coin.balance)
            if (runningTotal >= totalNeeded) break
          }

          console.log(
            `Merging ${selectedCoins.length} coins with total: ${
              Number(runningTotal) / MIST_PER_SUI
            } SUI`
          )

          if (selectedCoins.length === 1) {
            // Single coin, use it directly
            const singleCoin = selectedCoins[0]
            const [paymentCoin] = tx.splitCoins(singleCoin.coinObjectId, [
              tx.pure.u64(amountInMist),
            ])

            tx.setGasPayment([
              {
                objectId: singleCoin.coinObjectId,
                version: singleCoin.version,
                digest: singleCoin.digest,
              },
            ])

            tx.moveCall({
              target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::fund_agent`,
              arguments: [tx.object(agentObjectId), paymentCoin],
            })
          } else {
            // Multiple coins - merge them first
            const primaryCoin = selectedCoins[0]
            const coinsToMerge = selectedCoins.slice(1)

            // Merge all selected coins into the primary coin
            tx.mergeCoins(
              primaryCoin.coinObjectId,
              coinsToMerge.map((coin) => coin.coinObjectId)
            )

            // Now the primary coin has the merged balance
            // Split payment amount from the merged coin
            const [paymentCoin] = tx.splitCoins(primaryCoin.coinObjectId, [
              tx.pure.u64(amountInMist),
            ])

            // Use remaining merged balance for gas
            tx.setGasPayment([
              {
                objectId: primaryCoin.coinObjectId,
                version: primaryCoin.version,
                digest: primaryCoin.digest,
              },
            ])

            tx.moveCall({
              target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::fund_agent`,
              arguments: [tx.object(agentObjectId), paymentCoin],
            })
          }
        }

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
