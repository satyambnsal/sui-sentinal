'use client'
import Link from 'next/link'

export default function ProjectInfo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-[64px] font-bold uppercase mb-4">SUI SENTINEL</h1>
          <p className="text-xl text-gray-400">AI Agent Security Through Economic Incentives</p>
          <div className="flex max-w-[600px] mx-auto mt-8">
            <div className="white-gradient-border"></div>
            <div className="white-gradient-border rotate-180"></div>
          </div>
        </div>

        <div className="space-y-12 text-lg leading-relaxed">
          {/* Why This Matters */}
          <section className="bg-gray-900 p-8 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Why This Matters</h2>
            <p className="mb-4 text-gray-300">
              We are all in the age of AI. LLMs are being integrated everywhere. We can all see in
              the near future, AI agents will manage our finances, DeFi pools, run DAOs, and make
              bets on our behalf on prediction markets.
            </p>
            <p className="text-gray-300">
              But there is one critical vulnerability: a cleverly crafted sentence can make an AI
              completely disregard its rules. This is called{' '}
              <span className="text-blue-400 font-semibold">prompt injection vulnerability</span>.
              As AI agents gain control over real assets and critical decisions, understanding and
              defending against these attacks becomes essential for the security of our digital
              future.
            </p>
          </section>

          {/* Economic Model */}
          <section className="bg-gray-900 p-8 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Perfect Economic Alignment</h2>
            <p className="mb-4 text-gray-300">
              The beauty of SUI Sentinel is its economic model. It creates perfect alignment through
              game theory. Defenders are incentivized to deploy the most robust agents possible,
              because they earn SUI tokens for every failed attack attempt. The stronger their
              defenses, the more they earn.
            </p>
            <p className="text-gray-300">
              Attackers are motivated by both the intellectual challenge and the potential to win
              the entire fund held by the agent. This creates a natural testing environment where
              the best security practices emerge through economic competition rather than
              theoretical analysis.
            </p>
          </section>

          {/* Technical Architecture */}
          <section className="bg-gray-900 p-8 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">
              Verifiable Off-Chain Architecture
            </h2>
            <p className="mb-4 text-gray-300">
              SUI Sentinel leverages the{' '}
              <span className="text-blue-400 font-semibold">Nautilus framework</span> developed by
              the SUI team for verifiable off-chain computation. Our AI agent server runs within a
              Trusted Execution Environment (TEE) using AWS Nitro Enclaves, ensuring complete
              isolation and tamper-proof execution.
            </p>
            <p className="mb-4 text-gray-300">
              Every AI response is cryptographically signed within the TEE and verified on-chain
              through our Move smart contracts. This hybrid architecture allows for complex AI
              computations to run off-chain for performance and cost efficiency, while maintaining
              blockchain-level trust and transparency through cryptographic proofs.
            </p>
            <p className="text-gray-300">
              The result is a trustless system where players can be confident that AI decisions are
              authentic and unmanipulated, while enabling sophisticated gameplay that would be
              impossible with purely on-chain computation.
            </p>
          </section>

          {/* Roadmap */}
          <section className="bg-gray-900 p-8 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Six-Month Roadmap</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-300">
                  Mainnet Launch - Last Week of June 2025
                </h3>
                <p className="text-gray-300">
                  Full production deployment on SUI Mainnet with real economic incentives and
                  community-driven agent battles.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-300">
                  Months 1-3: Model Expansion & Community
                </h3>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>
                    • Support for additional AI models: Grok, DeepSeek, Gemini, and custom model
                    integrations
                  </li>
                  <li>• Increased token size limits for more complex prompts and attack vectors</li>
                  <li>• Community building initiatives and educational content</li>
                  <li>• Strategic partnerships with other projects in the SUI ecosystem</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-300">
                  Months 4-6: Ecosystem Growth
                </h3>
                <p className="text-gray-300">
                  Token launch on SUI with governance features, tournament systems, and expansion to
                  support enterprise use cases for AI security testing.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center bg-gray-900 p-8 rounded-lg border border-blue-400">
            <h2 className="text-2xl font-bold mb-4">Ready to Join the Battle?</h2>
            <p className="text-gray-300 mb-6">
              Experience the future of AI security through economic incentives. Test your skills as
              either a defender or attacker in the ultimate prompt security arena.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Try Demo
              </Link>
              <a
                href="https://www.youtube.com/watch?v=U3qMdgSGASI"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-700 text-foreground px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Watch Demo
              </a>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-400 mb-4">
                Interested in partnerships or want to learn more about the project?
              </p>
              <a
                href="https://calendly.com/satyamb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium"
              >
                Schedule a call with our team →
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
