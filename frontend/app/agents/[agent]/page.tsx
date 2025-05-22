'use client'

import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AgentChat } from '@/components/AgentChat'
import { useAgent } from '@/hooks/useAgent'
import { useParams } from 'next/navigation'
import { formatBalance, truncateAddress } from '@/lib/utils'
import { AgentStates } from '@/components/AgentStates'
import { Copy } from 'lucide-react'
import { useState } from 'react'
import { AgentInfo } from '@/components/AgentInfo'

const AddressDisplay = ({ address, label }: { address: string; label: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#D3E7F0]">{label}:</span>
      <button
        onClick={handleCopy}
        className="p-1 hover:bg-[#35546266] rounded-md transition-colors"
        title="Copy address"
      >
        <Copy size={16} className={copied ? 'text-green-500' : 'text-[#D3E7F0]'} />
      </button>
    </div>
  )
}

export default function Agent() {
  const params = useParams()
  const agentName = decodeURIComponent(params.agent as string)
  const { agent, loading, error } = useAgent({ fetchBy: 'name', value: agentName })

  if (loading || error || !agent) {
    return <AgentStates loading={!!loading} error={error} isNotFound={!agent} />
  }

  const messagePrice = formatBalance(BigInt(agent.promptPrice), agent.decimal, 2, true)

  return (
    <div className="bg-cover bg-center bg-no-repeat text-white flex-col items-end md:items-center justify-center">
      <div className="mt-16 max-w-[1560px] mx-auto py-5 md:py-10 px-2">
        <div className="text-center">
          <div className="mb-6">
            <div className="flex items-center gap-3 w-fit mx-auto mb-4">
              <div className="w-7 h-7 rounded-full">
                <Image
                  src="/img/twoRobots.png"
                  width="28"
                  height="28"
                  alt="profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div>
                <h2 className="text-[2rem] font-bold">{agent.name}</h2>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 mt-4">
              <AddressDisplay address={agent.address} label="Agent Address" />
              <AddressDisplay address={agent.creator} label="Creator Address" />
            </div>
          </div>

          <div className="max-w-[972px] mx-auto mb-8">
            <h3 className="text-xl font-bold mb-2">Agent prompt</h3>
            <p className="text-sm text-[#D3E7F0] px-4 py-8">{agent.systemPrompt}</p>
            Challenge this agent with your prompts. Each attempt costs {messagePrice} {agent.symbol}
            <div className="mt-4">
              <a
                href={`/attack/${agent.address}`}
                className="inline-block border border-[#8F564E] rounded-lg w-48 min-h-11 p-2 transition-all text-[#8F564E] hover:bg-[#E53922] hover:text-black hover:border-[#E53922] font-medium"
              >
                Challenge an Agent
              </a>
            </div>
          </div>
          <AgentInfo
            balance={agent.balance}
            decimal={agent.decimal}
            promptPrice={agent.promptPrice}
            symbol={agent.symbol}
            breakAttempts={agent.breakAttempts}
            isDrained={agent.isDrained}
            drainAmount={agent.drainAmount}
          />
        </div>
        <div className="mt-8">
          <div className="">
            <Tabs defaultValue="latest-prompts" className="w-full">
              <div className="mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between ">
                  <TabsList className="flex w-full">
                    <TabsTrigger
                      className="text-white font-light px-1 sm:px-2 text-xs md:text-sm md:px-5"
                      value="latest-prompts"
                    >
                      Latest prompts ({agent.latestPrompts.length})
                    </TabsTrigger>
                    <TabsTrigger
                      className="text-white font-light px-1 sm:px-2 text-xs md:text-sm md:px-5"
                      value="successful-attempts"
                    >
                      Successful attempts ({agent.latestPrompts.filter((p) => p.is_success).length})
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="h-[3px] w-full bg-[#132531] -mt-[6px]"></div>
              </div>

              <TabsContent value="latest-prompts">
                <AgentChat prompts={agent.latestPrompts} />
              </TabsContent>
              <TabsContent value="successful-attempts">
                <AgentChat prompts={agent.latestPrompts.filter((p) => p.is_success)} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
