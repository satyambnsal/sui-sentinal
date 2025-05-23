'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { motion } from 'framer-motion'
import { useAllAgents } from '@/hooks/useAllAgents'
import { useConsumePrompt } from '@/hooks/useConsumePrompt'
import { AgentDetails, ConsumePromptApiResponse } from '@/types'
import { AgentInfo } from '@/components/AgentInfo'
import { AgentStatus } from '@/types'
import { getAgentStatus } from '@/lib/utils'

export default function AgentChallengePage() {
  const params = useParams()
  const agentObjectId = params.address as string
  console.log('agent object id', agentObjectId)
  const account = useCurrentAccount()

  const { refetchAgent } = useAllAgents()
  const { consumePrompt } = useConsumePrompt({
    showToasts: true,
    onApiSuccess: (response) => {
      setApiResponse(response)
    },
  })

  const [agent, setAgent] = useState<AgentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(AgentStatus.ACTIVE)
  const [apiResponse, setApiResponse] = useState<ConsumePromptApiResponse | null>(null)

  // Fetch agent details when component mounts or objectId changes
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true)
        const agentDetails = await refetchAgent(agentObjectId)
        setAgent(agentDetails)
        setAgentStatus(getAgentStatus({ isDrained: false, isFinalized: false }))
      } catch (err) {
        setError('Failed to load agent details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (agentObjectId) {
      fetchAgent()
    }
  }, [agentObjectId, refetchAgent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!account?.address) {
      setSubmitError('Please connect your wallet')
      return
    }

    if (!agent) {
      setSubmitError('Agent not loaded')
      return
    }

    if (prompt.length === 0) {
      setSubmitError('Please enter a prompt')
      return
    }

    if (prompt.length > 600) {
      setSubmitError('Prompt must be 600 characters or less')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)
      setApiResponse(null)

      await consumePrompt({
        agentDetails: agent,
        message: prompt,
      })

      // Refresh agent data after successful submission
      const updatedAgent = await refetchAgent(agentObjectId)
      setAgent(updatedAgent)
      setAgentStatus(getAgentStatus({ isDrained: false, isFinalized: false }))
      setPrompt('')
    } catch (err) {
      setSubmitError('Failed to submit prompt')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!account?.address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to attack this agent</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <Link
          href="/attack"
          className="text-blue-400 hover:underline mb-8 block"
        >
          ← Back to Agents
        </Link>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-gray-400">{error || 'Agent not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
      <Link
        href="/attack"
        className="flex items-center gap-1 text-blue-400 hover:underline mb-8"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Agents
      </Link>

      <div className="bg-gray-900 rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">Agent: {agent.agent_id}</h1>

        <div className="grid grid-cols-1 mb-6">
          <AgentInfo
            balance={agent.balance.toString()}
            decimal={9}
            promptPrice={agent.cost_per_message.toString()}
            symbol="SUI"
            className="w-full !ml-0"
            breakAttempts={0}
            isDrained={false}
            drainAmount="0"
          />
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">System Prompt</h2>
          <div className="bg-black/30 p-4 rounded">
            <p className="whitespace-pre-wrap">{agent.system_prompt}</p>
          </div>
        </div>
      </div>

      {apiResponse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">
            {apiResponse.response.data.success ? (
              <span className="text-green-400">Attack Successful! 🎉</span>
            ) : (
              <span className="text-yellow-400">Attack Failed</span>
            )}
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Explanation</h3>
              <p className="bg-gray-800 p-4 rounded">{apiResponse.response.data.explanation}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-1">Score</h3>
              <p className="text-xl">{apiResponse.response.data.score}/10</p>
            </div>
          </div>
        </motion.div>
      )}

      {agentStatus === AgentStatus.ACTIVE && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-4">Attack This Agent</h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-medium mb-2"
              >
                Enter your prompt (max 600 characters)
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 min-h-[150px] text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                maxLength={600}
                disabled={isSubmitting}
                placeholder="Try to trick the agent into revealing sensitive information..."
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {prompt.length}/600 characters
              </div>
            </div>

            {submitError && <div className="text-red-500 text-sm">{submitError}</div>}

            <button
              type="submit"
              disabled={isSubmitting || prompt.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Attack'
              )}
            </button>
          </form>
        </motion.div>
      )}

      {agentStatus !== AgentStatus.ACTIVE && (
        <div className="bg-gray-900 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">
            {agentStatus === AgentStatus.DEFEATED ? 'Agent Defeated' : 'Agent Undefeated'}
          </h3>
          <p className="text-gray-400">
            {agentStatus === AgentStatus.DEFEATED
              ? 'This agent has already been defeated and can no longer be attacked.'
              : 'This agent is currently undefeated but not accepting new attacks.'}
          </p>
        </div>
      )}
    </div>
  )
}
