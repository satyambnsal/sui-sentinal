'use client'
import React, { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { Dialog } from '@/components/Dialog'
import { useFundAgent } from '@/hooks/useFundAgent' // Adjust import path as needed

export interface FundAgentModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback when the modal should close */
  onClose: () => void
  /** Agent object ID to fund */
  agentObjectId: string
  /** Optional callback when funding is successful */
  onSuccess?: () => void
}

/**
 * Modal component for funding an agent
 * Features:
 * - Amount input with validation
 * - Fund button with loading state
 * - Error handling
 * - Success callback
 */
export const FundAgentModal = ({
  open,
  onClose,
  agentObjectId,
  onSuccess,
}: FundAgentModalProps) => {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const { fundAgent, isLoading } = useFundAgent()

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)

    if (error) {
      setError('')
    }
  }

  const validateAmount = (): boolean => {
    const numAmount = parseFloat(amount)

    if (!amount.trim()) {
      setError('Amount is required')
      return false
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number')
      return false
    }

    if (numAmount < 0.001) {
      setError('Minimum amount is 0.001 SUI')
      return false
    }

    return true
  }

  const handleFundAgent = async () => {
    if (!validateAmount()) return

    try {
      await fundAgent({ agentObjectId, amount: +amount })

      // Reset form
      setAmount('')
      setError('')

      // Call success callback
      onSuccess?.()

      // Close modal
      onClose()
    } catch (err) {
      console.error('Funding error:', err)
      const message = err instanceof Error ? err.message : 'Failed to fund agent'
      setError(message)
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setAmount('')
    setError('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add Funds</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Amount (SUI)</label>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className="w-full bg-[#12121266] backdrop-blur-lg border border-gray-600 rounded-lg p-3"
            placeholder="0.00"
            min="0"
            step="0.001"
            disabled={isLoading}
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>

        {/* Fund Button */}
        <button
          onClick={handleFundAgent}
          disabled={isLoading || !amount.trim()}
          className="w-full bg-white text-black rounded-full py-3 font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Adding Funds...
            </>
          ) : (
            'Add Funds'
          )}
        </button>
      </div>
    </Dialog>
  )
}
