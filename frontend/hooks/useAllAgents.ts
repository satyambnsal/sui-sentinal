import { useState, useEffect, useCallback } from 'react'
import { useAgentObjectIds } from './useAgentObjectIds'
import { AgentDetails } from '@/types'
import { fetchAgentDetailsViaObject } from '@/lib/sui-utils'
import { useSuiClient } from '@mysten/dapp-kit'

interface UseAllAgentsReturn {
  agents: AgentDetails[]
  loading: boolean
  error: string | null
  refetchAll: () => Promise<void>
  refetchAgent: (objectId: string) => Promise<AgentDetails>
}

export const useAllAgents = (): UseAllAgentsReturn => {
  const {
    agentObjectIds,
    loading: idsLoading,
    error: idsError,
    refetch: refetchIds,
  } = useAgentObjectIds()
  const client = useSuiClient()
  const [agents, setAgents] = useState<AgentDetails[]>([])

  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  const fetchAgentDetails = useCallback(
    async (objectIds: string[]) => {
      objectIds = objectIds.filter((objectId) => objectId.startsWith('0x'))
      setDetailsLoading(true)
      setDetailsError(null)

      try {
        const detailsPromises = objectIds.map(async (objectId) => {
          try {
            return await fetchAgentDetailsViaObject(client, objectId)
          } catch (error) {
            console.error(`Error fetching agent ${objectId}:`, error)
            return null
          }
        })

        const settledResults = await Promise.all(detailsPromises)

        const successfulAgents = settledResults.filter(
          (agent): agent is AgentDetails => agent !== null
        )
        setAgents(successfulAgents)

        if (successfulAgents.length !== objectIds.length) {
          setDetailsError(`Failed to fetch ${objectIds.length - successfulAgents.length} agents`)
        }
      } catch (error) {
        console.error('Unexpected error in fetchAgentDetails:', error)
        setDetailsError('An unexpected error occurred while fetching agents')
      } finally {
        setDetailsLoading(false)
      }
    },
    [client]
  )

  useEffect(() => {
    if (agentObjectIds.length > 0 && !idsLoading && !idsError) {
      fetchAgentDetails(agentObjectIds)
    }
  }, [agentObjectIds, idsLoading, idsError, fetchAgentDetails])

  const refetchAll = useCallback(async () => {
    try {
      await refetchIds()
      if (agentObjectIds.length > 0) {
        await fetchAgentDetails(agentObjectIds)
      }
    } catch (error) {
      console.error('Error refetching all agents:', error)
    }
  }, [refetchIds, agentObjectIds, fetchAgentDetails])

  const refetchAgent = useCallback(
    async (objectId: string) => {
      try {
        console.log('agetnt object id', objectId)
        const updatedAgent = await fetchAgentDetailsViaObject(client, objectId)
        setAgents((prevAgents) =>
          prevAgents.map((agent) =>
            agent.agent_id === updatedAgent.agent_id ? updatedAgent : agent
          )
        )
        return updatedAgent
      } catch (error) {
        console.error(`Error refetching agent ${objectId}:`, error)
        throw new Error(`Failed to refetch agent ${objectId}`)
      }
    },
    [client]
  )

  return {
    agents,
    loading: idsLoading || detailsLoading,
    error: idsError || detailsError,
    refetchAll,
    refetchAgent,
  }
}
