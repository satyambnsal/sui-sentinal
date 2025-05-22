'use client'

import { AgentListView } from '@/components/AgentListView'
import { LandingPage } from '@/components/LandingPage'
import { TEXT_COPIES } from '@/constants'

export default function Home() {
  return (
    <>
      <div className="min-h-screen flex flex-col justify-center">
        <LandingPage />
      </div>
      <AgentListView
        heading={TEXT_COPIES.leaderboard.heading}
        subheading={TEXT_COPIES.leaderboard.subheading}
      />
      <div className="md:py-20">
        <div className="px-8 md:py-20 max-w-[1560px] mx-auto hidden">
          <p className="text-4xl md:text-[48px] font-bold text-center uppercase mb-1">
            TEE TRUSTED EXECUTION ENVIROMENT
          </p>
          <h3 className="text-center mb-5">Unbreakable Security with AWS Nitro Enclave Security</h3>
          <div className="flex max-w-[800px] mx-auto">
            <div className="white-gradient-border"></div>
            <div className="white-gradient-border rotate-180"></div>
          </div>

          <ul className="list-disc flex items-center justify-center flex-col text-[#B4B4B4] gap-2 mt-8">
            <li>AI agents code operate autonomously within a secure TEE</li>
            <li>On-chain verifiability guarantees transparency for every interaction.</li>
          </ul>
        </div>
      </div>
    </>
  )
}
