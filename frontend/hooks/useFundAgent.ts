import { useState, useCallback } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { MIST_PER_SUI, SUI_CONFIG } from '@/constants'
import { toast } from 'react-toastify'

const GAS_BUDGET = 10_000
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
        })

        if (!coins.data.length) {
          throw new Error('No SUI coins found in wallet')
        }

        const amountInMist = BigInt(amount * MIST_PER_SUI)
        const totalNeeded = amountInMist + GAS_OBJECT_MIN_BALANCE

        // Sort coins by balance (largest first)
        const sortedCoins = coins.data.sort((a, b) => Number(b.balance) - Number(a.balance))

        // Calculate total available balance
        const totalAvailable = sortedCoins.reduce(
          (sum, coin) => sum + BigInt(coin.balance),
          BigInt(0)
        )

        if (totalAvailable < totalNeeded) {
          throw new Error(
            `Insufficient SUI balance. Need ${amount} SUI + gas fees, have ${
              Number(totalAvailable) / MIST_PER_SUI
            } SUI`
          )
        }

        console.log({ totalAvailable, totalNeeded, amountInMist })

        // Create transaction
        const tx = new Transaction()

        // Find the best gas coin (smallest coin that can cover gas)
        let gasCoin = null
        const availablePaymentCoins = []

        // First pass: find smallest suitable gas coin
        for (const coin of sortedCoins.slice().reverse()) {
          // Start from smallest
          const balance = BigInt(coin.balance)
          if (!gasCoin && balance >= GAS_OBJECT_MIN_BALANCE) {
            gasCoin = coin
            console.log(`Selected gas coin ${coin.coinObjectId} with balance`, balance)
          } else {
            availablePaymentCoins.push(coin)
          }
        }

        // If no suitable gas coin found, use the largest coin for both gas and payment
        if (!gasCoin) {
          console.log('No dedicated gas coin found, will use largest coin for both')
          const largestCoin = sortedCoins[0]
          const largestBalance = BigInt(largestCoin.balance)

          if (largestBalance < totalNeeded) {
            throw new Error('Largest coin insufficient for payment + gas')
          }

          // Split payment amount from the largest coin first
          const [paymentCoin] = tx.splitCoins(largestCoin.coinObjectId, [tx.pure.u64(amountInMist)])

          // Now the original coin has reduced balance but still enough for gas
          // Set gas payment using the now-reduced original coin
          tx.setGasPayment([
            {
              objectId: largestCoin.coinObjectId,
              version: largestCoin.version,
              digest: largestCoin.digest,
            },
          ])

          // Call the fund_agent function
          tx.moveCall({
            target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::fund_agent`,
            arguments: [tx.object(agentObjectId), paymentCoin],
          })
        } else {
          console.log('Using separate coins for gas and payment')
          // We have a dedicated gas coin, now handle payment coins

          // Calculate total available for payment
          const paymentTotal = availablePaymentCoins.reduce(
            (sum, coin) => sum + BigInt(coin.balance),
            BigInt(0)
          )

          if (paymentTotal < amountInMist) {
            throw new Error(`Insufficient SUI balance for payment. Need ${amount} SUI`)
          }

          // Select payment coins
          const selectedPaymentCoins = []
          let runningTotal = BigInt(0)

          for (const coin of availablePaymentCoins.sort(
            (a, b) => Number(b.balance) - Number(a.balance)
          )) {
            selectedPaymentCoins.push(coin)
            runningTotal += BigInt(coin.balance)
            if (runningTotal >= amountInMist) break
          }

          console.log(
            `Selected ${selectedPaymentCoins.length} payment coins with total`,
            runningTotal
          )

          let paymentCoin
          if (selectedPaymentCoins.length === 1) {
            const singleCoin = selectedPaymentCoins[0]
            const coinBalance = BigInt(singleCoin.balance)

            if (coinBalance === amountInMist) {
              // Exact amount
              paymentCoin = singleCoin.coinObjectId
            } else {
              // Need to split
              const [splitCoin] = tx.splitCoins(singleCoin.coinObjectId, [
                tx.pure.u64(amountInMist),
              ])
              paymentCoin = splitCoin
            }
          } else {
            // Multiple payment coins - merge then split if needed
            const primaryCoin = selectedPaymentCoins[0].coinObjectId
            const coinsToMerge = selectedPaymentCoins.slice(1).map((coin) => coin.coinObjectId)

            // Merge all coins into the primary coin
            if (coinsToMerge.length > 0) {
              tx.mergeCoins(primaryCoin, coinsToMerge)
            }

            if (runningTotal === amountInMist) {
              // Exact amount after merging
              paymentCoin = primaryCoin
            } else {
              // Split exact amount after merging
              const [splitCoin] = tx.splitCoins(primaryCoin, [tx.pure.u64(amountInMist)])
              paymentCoin = splitCoin
            }
          }

          // Set gas payment (separate from payment coins)
          tx.setGasPayment([
            {
              objectId: gasCoin.coinObjectId,
              version: gasCoin.version,
              digest: gasCoin.digest,
            },
          ])

          // Call the fund_agent function
          tx.moveCall({
            target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::fund_agent`,
            arguments: [tx.object(agentObjectId), paymentCoin],
          })
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
