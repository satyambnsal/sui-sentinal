/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CONFIG } from '@/constants'
import { toast } from 'react-toastify'
import { AgentDetails, ConsumePromptApiResponse } from '@/types'
import { hexToVector } from '@/lib/utils'

const MIST_PER_SUI = 1_000_000_000
const GAS_BUDGET = 50_000_000

// Define response types

interface UseConsumePromptOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  onPaymentSuccess?: (result: any) => void
  onApiSuccess?: (response: ConsumePromptApiResponse) => void
  showToasts?: boolean
}

interface ConsumePromptParams {
  agentDetails: AgentDetails
  message: string
}

export const useConsumePrompt = (options: UseConsumePromptOptions = {}) => {
  const client = useSuiClient()
  const { onSuccess, onError, onPaymentSuccess, onApiSuccess, showToasts = true } = options

  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)

  const account = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showObjectChanges: true,
        },
      }),
  })

  // Step 2: Transfer payment to agent creator
  const transferPayment = async (agentDetails: AgentDetails): Promise<any> => {
    if (!account?.address) {
      throw new Error('Wallet not connected')
    }

    const costInMist = BigInt(agentDetails.cost_per_message)

    // Check if user has enough balance
    const balance = await client.getBalance({
      owner: account.address,
      coinType: '0x2::sui::SUI',
    })

    const totalBalance = BigInt(balance.totalBalance)
    const gasBuffer = BigInt(GAS_BUDGET)
    const totalNeeded = costInMist + gasBuffer

    if (totalBalance < totalNeeded) {
      throw new Error(
        `Insufficient balance. Need ${agentDetails.cost_per_message / MIST_PER_SUI} SUI + gas fees`
      )
    }

    const tx = new Transaction()

    // Split payment amount from gas coin
    const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(costInMist)])

    // Transfer to agent creator
    tx.transferObjects([paymentCoin], tx.pure.address(agentDetails.creator))

    tx.setGasBudget(GAS_BUDGET)

    return new Promise((resolve, reject) => {
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Payment transaction success:', result)
            onPaymentSuccess?.(result)
            resolve(result)
          },
          onError: (txError) => {
            console.error('Payment transaction failed:', txError)
            reject(new Error(txError?.message || 'Payment failed'))
          },
        }
      )
    })
  }

  // Step 3: Call consume prompt API
  const callConsumePromptApi = async (
    agentId: string,
    message: string
  ): Promise<ConsumePromptApiResponse> => {
    const response = await fetch('/api/consume-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agentId,
        message: message,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const apiResponse: ConsumePromptApiResponse = await response.json()
    onApiSuccess?.(apiResponse)
    return apiResponse
  }

  // Step 4: Execute consume prompt transaction
  const executeConsumePrompt = async (
    agentObjectId: string,
    agentDetails: AgentDetails,
    apiResponse: ConsumePromptApiResponse
  ): Promise<any> => {
    const tx = new Transaction()
    const sigVector = hexToVector(apiResponse.signature)

    // Extract data from API response
    const { response: apiData } = apiResponse

    tx.moveCall({
      target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::consume_prompt`,
      typeArguments: [
        `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::${SUI_CONFIG.OTW_NAME}`,
      ],
      arguments: [
        tx.object(SUI_CONFIG.AGENT_REGISTRY), // registry: &AgentRegistry
        tx.object(agentObjectId), // agent: &mut Agent
        tx.pure.string(apiData.data.agent_id), // agent_id: String
        tx.pure.bool(apiData.data.success), // success: bool
        tx.pure.string(apiData.data.explanation), // explanation: String
        tx.pure.u8(apiData.data.score), // score: u8
        tx.pure.u64(apiData.timestamp_ms), // timestamp_ms: u64
        tx.pure.vector('u8', sigVector), // sig: &vector<u8>
        tx.object(SUI_CONFIG.ENCLAVE_OBJECT_ID), // enclave: &Enclave<T>
      ],
    })

    tx.setGasBudget(GAS_BUDGET)

    return new Promise((resolve, reject) => {
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Consume prompt transaction success:', result)
            setLastResult(result)
            onSuccess?.(result)
            resolve(result)
          },
          onError: (txError) => {
            console.error('Consume prompt transaction failed:', txError)
            reject(new Error(txError?.message || 'Consume prompt failed'))
          },
        }
      )
    })
  }

  // Main function that orchestrates all steps
  const consumePrompt = useCallback(
    async ({ agentDetails, message }: ConsumePromptParams) => {
      if (!account?.address) {
        const errorMsg = 'Wallet not connected'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      if (!agentDetails?.agent_object_id || !message?.trim()) {
        const errorMsg = 'Invalid agent ID or message'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      setIsLoading(true)
      setError(null)
      setCurrentStep('Fetching agent details...')

      try {
        // Step 2: Transfer payment to creator
        setCurrentStep('Processing payment...')
        if (showToasts) toast.info('Processing payment...')
        await transferPayment(agentDetails)

        // Step 3: Call consume prompt API
        setCurrentStep('Processing prompt...')
        if (showToasts) toast.info('Processing prompt...')
        const apiResponse = await callConsumePromptApi(agentDetails.agent_id, message)
        console.log('API response:', apiResponse)

        // Step 4: Execute consume prompt transaction
        setCurrentStep('Finalizing transaction...')
        if (showToasts) toast.info('Finalizing transaction...')
        const result = await executeConsumePrompt(
          agentDetails.agent_object_id,
          agentDetails,
          apiResponse
        )

        // Success
        const success = apiResponse.response.data.success
        if (showToasts) {
          if (success) {
            toast.success('🎉 Agent defeated! You won the challenge!')
          } else {
            toast.success('Prompt processed successfully')
          }
        }

        setCurrentStep('')
        return result
      } catch (error) {
        console.error('Error in consume prompt process:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to consume prompt'
        setError(errorMessage)

        if (showToasts) {
          toast.error(errorMessage)
        }

        const finalError = error instanceof Error ? error : new Error(errorMessage)
        onError?.(finalError)
        throw finalError
      } finally {
        setIsLoading(false)
        setCurrentStep('')
      }
    },
    [
      account?.address,
      signAndExecuteTransaction,
      onSuccess,
      onError,
      onPaymentSuccess,
      onApiSuccess,
      showToasts,
    ]
  )

  const reset = useCallback(() => {
    setError(null)
    setLastResult(null)
    setCurrentStep('')
  }, [])

  return {
    consumePrompt,
    isLoading,
    currentStep,
    error,
    lastResult,
    reset,
    isConnected: !!account?.address,
  }
}

// Export types for convenience
export type { ConsumePromptParams, UseConsumePromptOptions, AgentDetails }
