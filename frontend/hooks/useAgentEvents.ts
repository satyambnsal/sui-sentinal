/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import { useSuiClient } from '@mysten/dapp-kit'
import { SuiClient } from '@mysten/sui/client'
import { SUI_CONFIG } from '@/constants'

export interface AgentEvents {
  agentDefeated: any[]
  promptConsumed: any[]
}

interface UseAgentEventsResult {
  events: AgentEvents
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAgentEvents(): UseAgentEventsResult {
  const client = useSuiClient()
  const [events, setEvents] = useState({
    agentDefeated: [],
    promptConsumed: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      //TODO: Implement cursor here
      const result = await getAgentEvents(client)
      setEvents(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}

async function getAgentEvents(client: SuiClient) {
  const packageId = SUI_CONFIG.EXAMPLES_PACKAGE_ID
  const moduleName = SUI_CONFIG.MODULE_NAME
  try {
    // Fetch AgentDefeated events
    const agentDefeatedEvents = await client.queryEvents({
      query: {
        MoveEventType: `${packageId}::${moduleName}::AgentDefeated`,
      },
      limit: 50,
      order: 'descending',
    })

    // Fetch PromptConsumed events
    const promptConsumedEvents = await client.queryEvents({
      query: {
        MoveEventType: `${packageId}::${moduleName}::PromptConsumed`,
      },
      limit: 50,
      order: 'descending',
    })

    console.log({ agentDefeatedEvents, promptConsumedEvents })

    return {
      agentDefeated: agentDefeatedEvents.data,
      promptConsumed: promptConsumedEvents.data,
    }
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}
