/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { Transaction } from '@mysten/sui/transactions'
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { ConnectPrompt } from '@/components/ConnectPrompt'
import { MIST_PER_SUI, SUI_CONFIG } from '@/constants'
import { toast } from 'react-toastify'
import { hexToVector } from '@/lib/utils'
import { registerAgentUtil } from './utils'
import { useAgentObjectIds } from '@/hooks/useAgentObjectIds'
import { FundAgentModal } from '@/components/FundAgentModal'
import { SuccessModal } from '@/components/DefenderSuccessModal'

interface FormData {
  agentName: string
  systemPrompt: string
  feePerMessage: string
}

interface FormInputProps {
  label: string
  name: keyof FormData
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
  type?: string
  placeholder?: string
  required?: boolean
  isTextarea?: boolean
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required = false,
  isTextarea = false,
}) => {
  const InputComponent = isTextarea ? 'textarea' : 'input'

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <InputComponent
        name={name}
        type={isTextarea ? undefined : type}
        value={value}
        onChange={onChange}
        className={`w-full bg-[#12121266] backdrop-blur-lg border border-gray-600 rounded-lg p-3 ${
          isTextarea ? 'min-h-[200px] resize-vertical' : ''
        }`}
        placeholder={placeholder}
        required={required}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default function DefendPage() {
  const client = useSuiClient()
  const account = useCurrentAccount()
  const { addAgentObjectId } = useAgentObjectIds()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          // Raw effects are required so the effects can be reported back to the wallet
          showRawEffects: true,
          // Select additional data to return
          showObjectChanges: true,
        },
      }),
  })

  const [formData, setFormData] = useState<FormData>({
    agentName: '',
    systemPrompt: '',
    feePerMessage: '',
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isLoading, setIsLoading] = useState(false)

  const [deployedAgentObjectId, setDeployedAgentObjectId] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFundModal, setShowFundModal] = useState(false)
  const [transactionDigest, setTransactionDigest] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setDeployedAgentObjectId(null)
    setTransactionDigest('')
    // Reset form
    setFormData({
      agentName: '',
      systemPrompt: '',
      feePerMessage: '',
    })
  }

  const handleAddFunds = () => {
    setShowSuccessModal(false)
    setShowFundModal(true)
  }

  const handleCloseFundModal = () => {
    setShowFundModal(false)
    setDeployedAgentObjectId(null)
    setTransactionDigest('')
    // Reset form
    setFormData({
      agentName: '',
      systemPrompt: '',
      feePerMessage: '',
    })
  }

  const handleFundSuccess = () => {
    toast.success('Agent funded successfully!')
    handleCloseFundModal()
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.agentName.trim()) {
      newErrors.agentName = 'Agent name is required'
    } else if (formData.agentName.length > 31) {
      newErrors.agentName = 'Agent name must be 31 characters or less'
    }

    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt is required'
    }

    const fee = parseFloat(formData.feePerMessage)
    if (isNaN(fee) || fee < 0) {
      newErrors.feePerMessage = 'Fee must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createAgentTransaction = async (agentDetails: any) => {
    const tx = new Transaction()
    const sigVector = hexToVector(agentDetails.signature)

    tx.moveCall({
      target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::register_agent`,
      typeArguments: [
        `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::${SUI_CONFIG.OTW_NAME}`,
      ],
      arguments: [
        tx.object(SUI_CONFIG.AGENT_REGISTRY),
        tx.pure.string(agentDetails.response.data.agent_id),
        tx.pure.u64(agentDetails.response.timestamp_ms),
        tx.pure.u64(agentDetails.response.data.cost_per_message),
        tx.pure.string(agentDetails.response.data.system_prompt),
        tx.pure.vector('u8', sigVector),
        tx.object(SUI_CONFIG.ENCLAVE_OBJECT_ID),
      ],
    })

    return await signAndExecuteTransaction(
      { transaction: tx },
      {
        onSuccess: async (result) => {
          console.log('RESULT', result)
          console.log('object changes', result.objectChanges)

          const agentObject = result?.objectChanges?.find(
            (obj: any) =>
              obj.objectType ===
              `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::Agent`
          )

          if (agentObject) {
            console.log('agent object', agentObject)
            const agentObjectId = (agentObject as any).objectId
            await addAgentObjectId(agentObjectId)
            setDeployedAgentObjectId(agentObjectId)
            setTransactionDigest(result.digest.toString())
            setShowSuccessModal(true)
            console.log('Object id added to db successfully')
          }

          // Redirect to agent page
          // const agentId = agentDetails?.response?.data?.agent_id
          // if (agentId) {
          //   router.push(`/attack/${agentId}`)
          // }
        },
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !account) return

    setIsLoading(true)

    try {
      toast.info('Processing payment...')

      toast.info('Registering agent...')
      const feePerMessage = parseFloat(formData.feePerMessage) * MIST_PER_SUI
      const agentDetails = await registerAgentUtil(formData.systemPrompt, feePerMessage)

      toast.info('Creating blockchain transaction...')
      await createAgentTransaction(agentDetails)
    } catch (error) {
      console.error('Deployment error:', error)
      const message = error instanceof Error ? error.message : 'Deployment failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!account?.address) {
    return (
      <ConnectPrompt
        title="Welcome Defender"
        subtitle="Connect your wallet to deploy an agent"
        theme="defender"
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 pt-24 min-h-[calc(100vh-60px)]">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto space-y-6 relative"
      >
        <Link
          href="/"
          className="hidden lg:flex items-center gap-1 text-gray-400 hover:text-white transition-colors absolute top-2 -left-32"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <h1 className="text-4xl font-bold">Deploy Agent</h1>

        <FormInput
          label="Agent Name"
          name="agentName"
          value={formData.agentName}
          onChange={handleChange}
          error={errors.agentName}
          placeholder="Enter agent name"
          required
        />

        <FormInput
          label="System Prompt"
          name="systemPrompt"
          value={formData.systemPrompt}
          onChange={handleChange}
          error={errors.systemPrompt}
          placeholder="Enter system prompt..."
          required
          isTextarea
        />

        <FormInput
          label="Fee per Message (SUI)"
          name="feePerMessage"
          value={formData.feePerMessage}
          onChange={handleChange}
          error={errors.feePerMessage}
          type="number"
          placeholder="0.00"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-black rounded-full py-3 font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Deploying...
            </>
          ) : (
            'Deploy Agent'
          )}
        </button>
      </form>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        onAddFunds={handleAddFunds}
        agentName={formData.agentName}
        transactionDigest={transactionDigest}
        agentObjectId={deployedAgentObjectId}
      />

      {/* Fund Modal */}
      {deployedAgentObjectId && (
        <FundAgentModal
          open={showFundModal}
          onClose={handleCloseFundModal}
          agentObjectId={deployedAgentObjectId}
          onSuccess={handleFundSuccess}
        />
      )}
    </div>
  )
}
