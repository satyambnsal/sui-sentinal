'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { LeaderboardSkeleton } from './ui/skeletons/LeaderboardSkeleton'
import { AgentDetails } from '@/types'
import { formatBalance } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useFundAgentModal } from '@/hooks/useFundAgentModal'
import { useCurrentAccount } from '@mysten/dapp-kit'

export enum TabType {
  AgentRanking = 'AGENT_RANKING',
  ActiveAgents = 'ACTIVE_AGENTS',
  TopAttackers = 'TOP_ATTACKERS',
}

export const AgentsList = ({
  agents,
  isFetchingAgents,
  onRefreshAgent,
}: {
  agents: AgentDetails[]
  isFetchingAgents: boolean
  onRefreshAgent: (objectId: string) => Promise<AgentDetails>
}) => {
  const router = useRouter()
  const account = useCurrentAccount()
  const { Modal, openModal } = useFundAgentModal()

  const isAgentOwner = (creator: string) => creator === account?.address

  const handleRefresh = async (e: React.MouseEvent, objectId: string) => {
    e.preventDefault()
    e.stopPropagation()
    await onRefreshAgent(objectId)
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isFetchingAgents ? 'loading' : 'content'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {isFetchingAgents ? (
          <LeaderboardSkeleton />
        ) : (
          <div className="text-xs flex flex-col gap-1">
            {/* Table Header - Hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-12 bg-[#2E40494D] backdrop-blur-xl p-3 rounded-lg mb-2 font-semibold">
              <div className="col-span-3 grid grid-cols-12 items-center">
                <p className="pr-1 col-span-1">#</p>
                <div className="h-full w-[1px] bg-[#6F6F6F]" />
                <p className="col-span-10 pl-4">Agent Id</p>
              </div>
              <div className="col-span-3 border-l border-l-[#6F6F6F] ps-4">Balance</div>
              <div className="col-span-2 border-l border-l-[#6F6F6F] ps-4">Message Price</div>
              <div className="col-span-4 border-l border-l-[#6F6F6F] ps-4">Actions</div>
            </div>

            {/* Agent Rows */}
            <AnimatePresence>
              {agents.map((agent, idx) => {
                const balance = formatBalance(BigInt(agent.balance), 9)
                const costPerMessage = agent.cost_per_message

                return (
                  <motion.div
                    key={agent.agent_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className="bg-[#2E40494D] backdrop-blur-xl p-3 rounded-lg hover:bg-[#2E40497D] cursor-pointer"
                  >
                    {/* Mobile */}
                    <div className="md:hidden space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">#{idx + 1}</span>
                          <span className="font-medium truncate">{agent.agent_id}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs">Reward</p>
                          <p>{`${balance} SUI`}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Message Price</p>
                          <p>{`${costPerMessage} SUI`}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Creator</p>
                          <p className="truncate">{agent.creator}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <button
                          onClick={(e) => handleRefresh(e, agent.agent_id)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Refresh
                        </button>
                        <button
                          onClick={() => router.push(`/attack/${agent.agent_object_id}`)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Attack
                        </button>
                        {isAgentOwner(agent.creator) && (
                          <button
                            onClick={() => openModal(agent.agent_object_id)}
                            className="text-green-500 hover:text-green-400"
                          >
                            Fund
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:grid md:grid-cols-12 items-center">
                      <div className="col-span-3 grid grid-cols-12 items-center">
                        <p className="pr-1 col-span-1">{idx + 1}</p>
                        <div className="h-full w-[1px] bg-[#6F6F6F]" />
                        <div className="col-span-10 pl-4">{agent.agent_id}</div>
                      </div>
                      <div className="col-span-3 ps-4">{`${balance} SUI`}</div>
                      <div className="col-span-2 ps-4">{`${costPerMessage} SUI`}</div>
                      <div className="col-span-4 ps-4 flex gap-4">
                        <button
                          onClick={() => router.push(`/attack/${agent.agent_object_id}`)}
                          className="text-sm text-red-700 font-bold hover:text-red-500"
                        >
                          Attack
                        </button>
                        <button
                          onClick={(e) => handleRefresh(e, agent.agent_object_id)}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          Refresh
                        </button>
                        {isAgentOwner(agent.creator) && (
                          <button
                            onClick={() => openModal(agent.agent_object_id)}
                            className="text-sm text-green-500 hover:text-green-400"
                          >
                            Fund
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      <Modal onSuccess={() => console.log('Funded successfully!')} />
    </AnimatePresence>
  )
}
