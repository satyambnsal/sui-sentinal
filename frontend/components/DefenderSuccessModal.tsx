import { SUI_TESTNET_BASE_URL } from "@/constants"
import { CheckCircle, X } from "lucide-react"
import Link from "next/link"

interface SuccessModalProps {
  open: boolean
  onClose: () => void
  onAddFunds: () => void
  agentName: string
  transactionDigest: string
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  onAddFunds,
  agentName,
  transactionDigest,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Agent Deployed Successfully!</h2>

          <p className="text-gray-300 mb-4">
            Your agent &quot;<span className="font-semibold text-white">{agentName}</span>&quot; has
            been deployed to the blockchain.
          </p>

          <div className="bg-[#12121266] border border-gray-600 rounded p-3 mb-6">
            <p className="text-sm text-gray-400 mb-1">Transaction Block:</p>
            <Link
              href={`${SUI_TESTNET_BASE_URL}/${transactionDigest}`}
              className="text-xs font-mono break-all text-green-400"
              target="_blank"
            >
              {transactionDigest}
            </Link>
          </div>

          <div className="space-y-3">
            <button
              onClick={onAddFunds}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-medium transition-colors"
            >
              Add Funds Now
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg py-3 font-medium transition-colors"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
