import { ConsumePromptApiResponse } from '@/types'
import { Dialog } from './Dialog'

type AttackStatusModalProps = {
  apiResponse: ConsumePromptApiResponse
  showResultModal: boolean
  setShowResultModal: (show: boolean) => void
}

export const AttackStatusModal = ({
  apiResponse,
  showResultModal,
  setShowResultModal,
}: AttackStatusModalProps) => {
  const score = apiResponse?.response.data.score || 0

  return (
    <Dialog
      open={showResultModal && !!apiResponse}
      onClose={() => setShowResultModal(false)}
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">
          {apiResponse?.response.data.success ? (
            <span className="text-green-400">Attack Successful! 🎉</span>
          ) : (
            <span className="text-yellow-400">Attack Failed</span>
          )}
        </h2>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Explanation</h3>
          <p className="bg-gray-800 p-3 rounded text-sm">
            {apiResponse?.response.data.explanation}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Score</h3>
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-800 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="font-medium">{score}/100</span>
          </div>
        </div>

        <button
          onClick={() => setShowResultModal(false)}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Close
        </button>
      </div>
    </Dialog>
  )
}
