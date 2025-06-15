import { useState, useEffect, useCallback } from 'react'
import type { ApiResponse } from '../app/api/agent-object-names/types'

export type Agent = {
  agentId: string
  agentName: string
}

interface UseAgentObjectIdsReturn {
  agentObjectNames: Agent[]
  loading: boolean
  error: string | null
  addAgentObjectIdWithName: (str: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useAgentObjectNames(): UseAgentObjectIdsReturn {
  const [agentObjectNames, setAgentObjectNames] = useState<Agent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgentObjectNames = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      const response = await fetch('/api/agent-object-names')
      const data: ApiResponse = await response.json()
      console.log('agent object names', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch strings')
      }
      setAgentObjectNames(data.agents || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Failed to fetch agent object ids:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addAgentObjectIdWithName = useCallback(
    async (agentObjectIdWithName: string): Promise<void> => {
      if (!agentObjectIdWithName.trim()) return

      try {
        setError(null)
        const response = await fetch('/api/agent-object-names', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentObjectIdWithName: agentObjectIdWithName.trim() }),
        })

        const data: ApiResponse = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to add agent object id')
        }

        setAgentObjectNames(data.agents || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Failed to add agent object id:', err)
      }
    },
    []
  )

  useEffect(() => {
    fetchAgentObjectNames()
  }, [fetchAgentObjectNames])

  return {
    agentObjectNames,
    loading,
    error,
    addAgentObjectIdWithName,
    refetch: fetchAgentObjectNames,
  }
}
