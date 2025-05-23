import { AgentDetails } from '@/types'
import { SuiClient } from '@mysten/sui/client'

export const fetchAgentDetailsViaObject = async (
  client: SuiClient,
  agentObjectId: string
): Promise<AgentDetails> => {
  try {
    const response = await client.getObject({
      id: agentObjectId,
      options: {
        showContent: true,
        showType: true,
      },
    })

    console.log('Agent object response:', response)

    if (!response.data?.content || response.data.content.dataType !== 'moveObject') {
      throw new Error('Invalid agent object')
    }

    const fields = (response.data.content as any).fields
    console.log('Agent fields:', fields)

    return {
      agent_id: fields.agent_id,
      agent_object_id: fields.id.id,
      creator: fields.creator,
      cost_per_message: Number(fields.cost_per_message),
      system_prompt: fields.system_prompt,
      balance: Number(fields.balance),
    }
  } catch (error) {
    console.error('Error fetching agent via getObject:', error)
    throw new Error('Failed to fetch agent details via object query')
  }
}
