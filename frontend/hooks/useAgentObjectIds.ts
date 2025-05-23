import { useState, useEffect, useCallback } from 'react'
import type { ApiResponse } from '../app/api/agent-object-id/types'

interface UseAgentObjectIdsReturn {
  agentObjectIds: string[]
  loading: boolean
  error: string | null
  addAgentObjectId: (str: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useAgentObjectIds(): UseAgentObjectIdsReturn {
  const [agentObjectIds, setAgentObjectIds] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgentObjectIds = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      const response = await fetch('/api/agent-object-id')
      const data: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch strings')
      }

      setAgentObjectIds(data.agentObjectIds || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Failed to fetch agent object ids:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addAgentObjectId = useCallback(async (agentObjectId: string): Promise<void> => {
    if (!agentObjectId.trim()) return

    try {
      setError(null)
      const response = await fetch('/api/agent-object-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentObjectId: agentObjectId.trim() }),
      })

      const data: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add agent object id')
      }

      setAgentObjectIds(data.agentObjectIds || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Failed to add agent object id:', err)
    }
  }, [])

  useEffect(() => {
    fetchAgentObjectIds()
  }, [fetchAgentObjectIds])

  return {
    agentObjectIds,
    loading,
    error,
    addAgentObjectId,
    refetch: fetchAgentObjectIds,
  }
}
