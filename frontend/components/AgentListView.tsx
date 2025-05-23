'use client'
import { AgentsList } from './AgentsList'
import { useAllAgents } from '@/hooks/useAllAgents'

type AgentListViewProps = {
  heading: string
  subheading: string
}

export const AgentListView = ({ heading, subheading }: AgentListViewProps) => {
  //TODO: show toast for failed to load agents
  const { agents: allAgents, loading: isFetchingAllAgents, refetchAgent } = useAllAgents()
  console.log('Agents', allAgents)

  return (
    <div className="px-2 md:px-8 py-12 md:py-20 max-w-[1560px] mx-auto md:pt-36">
      <div className="mb-20">
        <p className="text-4xl md:text-[48px] font-bold text-center uppercase" id="leaderboard">
          {heading}
        </p>

        <div className="flex max-w-[800px] mx-auto my-3 md:my-6">
          <div className="white-gradient-border"></div>
          <div className="white-gradient-border rotate-180"></div>
        </div>
        <p className="text-[#B4B4B4] text-center max-w-[594px] mx-auto">{subheading}</p>
      </div>
      <div>
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h2>All Agents</h2>
        </div>
      </div>

      <AgentsList
        agents={allAgents}
        isFetchingAgents={isFetchingAllAgents}
        onRefreshAgent={refetchAgent}
      />
    </div>
  )
}
