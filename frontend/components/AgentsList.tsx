'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { LeaderboardSkeleton } from './ui/skeletons/LeaderboardSkeleton'
import { AgentDetails } from '@/types'
import { formatBalance, getAgentStatus } from '@/lib/utils'
import CountdownTimer from './CountdownTimer'
import { AgentStatus } from '@/types'

import { useRouter } from 'next/navigation'

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
          <>
            (
            <div className="text-xs flex flex-col gap-1">
              {/* Table Header - Hidden on mobile */}
              <div className="hidden md:grid md:grid-cols-12 bg-[#2E40494D] backdrop-blur-xl p-3 rounded-lg mb-2">
                <div className="col-span-3 grid grid-cols-12 items-center">
                  <p className="pr-1 col-span-1">#</p>
                  <div className="h-full w-[1px] bg-[#6F6F6F]"></div>
                  <p className="col-span-10 pl-4">Agent Id</p>
                </div>
                <div className="col-span-3 border-l border-l-[#6F6F6F] ps-4">Balance</div>
                <div className="col-span-2 border-l border-l-[#6F6F6F] ps-4">Message price</div>
                <div className="col-span-2 border-l border-l-[#6F6F6F] ps-4">Status</div>
                <div className="col-span-2 border-l border-l-[#6F6F6F] ps-4">Actions</div>
              </div>

              {/* Agent Cards */}
              <AnimatePresence>
                {agents.map((agent, idx) => {
                  const costPerMessage = formatBalance(
                    BigInt(agent.cost_per_message),
                    9, // Assuming 9 decimal places for SUI
                    2,
                    true
                  )
                  const balance = formatBalance(BigInt(agent.balance), 9)
                  const agentStatus = getAgentStatus({ isDrained: false, isFinalized: false })

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className="bg-[#2E40494D] backdrop-blur-xl p-3 rounded-lg hover:bg-[#2E40497D] cursor-pointer"
                      key={agent.agent_id}
                    >
                      {/* Mobile Layout */}
                      <div className="md:hidden space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">#{idx + 1}</span>
                            <span className="font-medium overflow-hidden">{agent.agent_id}</span>
                          </div>
                          {agentStatus === AgentStatus.ACTIVE && (
                            <CountdownTimer endTime={0} size="sm" />
                          )}
                          {agentStatus === AgentStatus.DEFEATED && (
                            <div className="w-24 flex justify-center text-xs font-semibold bg-[#FF3F26]/20 text-[#FF3F26] py-1 rounded-full">
                              DEFEATED
                            </div>
                          )}
                          {agentStatus === AgentStatus.UNDEFEATED && (
                            <div className="w-24 flex justify-center text-xs font-semibold bg-[#1388D5]/20 text-[#1388D5] py-1 rounded-full">
                              UNDEFEATED
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">Reward</p>
                            <p>{`${balance} SUI`}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Message price</p>
                            <p>{`${costPerMessage} SUI`}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Creator</p>
                            <p className="truncate">{agent.creator}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleRefresh(e, agent.agent_id)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Refresh
                        </button>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:grid md:grid-cols-12 items-center">
                        <div className="col-span-3 grid grid-cols-12 items-center">
                          <p className="pr-1 col-span-1">{idx + 1}</p>
                          <div className="h-full w-[1px] bg-[#6F6F6F]"></div>
                          <div className="col-span-10 pl-4 overflow-hidden">{agent.agent_id}</div>
                        </div>
                        <div className="col-span-3 ps-4">{`${balance} SUI`}</div>
                        <div className="col-span-2 ps-4">{`${costPerMessage} SUI`}</div>
                        <div className="col-span-2 ps-4">
                          {agentStatus === AgentStatus.ACTIVE && (
                            <CountdownTimer endTime={0} size="md" />
                          )}
                          {agentStatus === AgentStatus.DEFEATED && (
                            <div className="w-32 flex justify-center text-center text-sm font-bold tracking-wider bg-[#FF3F26]/20 text-[#FF3F26] py-2 rounded-full">
                              DEFEATED
                            </div>
                          )}
                          {agentStatus === AgentStatus.UNDEFEATED && (
                            <div className="w-32 flex justify-center text-sm text-center font-bold bg-[#1388D5]/20 text-[#1388D5] py-2 rounded-full">
                              UNDEFEATED
                            </div>
                          )}
                        </div>
                        <div className="col-span-2 ps-4 flex gap-4">
                          <button
                            onClick={() => {
                              router.push(`/attack/${agent.agent_object_id}`)
                            }}
                            className="text-sm text-red-700 font-bold hover:text-red-500"
                          >
                            Attack
                          </button>
                          <button
                            onClick={(e) => {
                              handleRefresh(e, agent.agent_object_id)
                            }}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
            )
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
