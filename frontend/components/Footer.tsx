import { NAUTILUS_URL } from '@/constants'
import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-[#121212] border-t border-[#558EB4]/30 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          {/* Main footer text */}
          <div className="text-[#B5B5B5] text-sm md:text-base">
            <span>Powered by </span>
            <a
              href={NAUTILUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#558EB4] hover:text-[#1388D5] transition-colors underline decoration-[#558EB4]/50 hover:decoration-[#1388D5]"
            >
              Nautilus Framework
            </a>
            <span> • Secured by TEE</span>
          </div>

          {/* Subtitle */}
          <div className="text-[#888888] text-xs md:text-sm">
            Sui Sentinel: The first verifiable off-chain AI platform on Sui blockchain
          </div>

          {/* Decorative gradient line */}
          <div className="flex max-w-[200px] mx-auto mt-4">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#558EB4] to-transparent opacity-50"></div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
