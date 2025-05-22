import React from 'react'
import { Dialog } from '@/components/Dialog'
import { Check, ExternalLink, X } from 'lucide-react'

import Link from 'next/link'

interface SuccessModalProps {
  open: boolean
  agentAddress: string
  onClose: () => void
}

export const AgentLaunchSuccessModal = ({
  open,
  agentAddress = '',
  onClose,
}: SuccessModalProps) => {
  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <div className="p-6 space-y-5 relative">
        <button
          onClick={handleClose}
          className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Agent Launched Successfully!</h2>

          <div className="space-y-3 mb-4">
            <Link
              href={`/attack/${agentAddress}`}
              className="w-full bg-gray-800 text-white rounded-lg py-2.5 font-medium hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Your Agent
            </Link>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
