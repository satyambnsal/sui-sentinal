'use client'
import { FundAgentModal, FundAgentModalProps } from '@/components/FundAgentModal'
import React, { useState } from 'react'

interface UseFundAgentModalReturn {
  modalProps: {
    open: boolean
    onClose: () => void
    agentObjectId: string
  }
  openModal: (agentObjectId: string) => void
  Modal: React.FC<Omit<FundAgentModalProps, 'open' | 'onClose' | 'agentObjectId'>>
}

/**
 * Hook to manage the FundAgentModal state
 * @returns {object} An object containing:
 * - modalProps: The props to pass to the FundAgentModal
 * - openModal: Function to open the modal for a specific agent
 * - Modal: The modal component ready to be rendered
 */
export function useFundAgentModal(): UseFundAgentModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [currentAgentId, setCurrentAgentId] = useState('')

  const openModal = (agentObjectId: string) => {
    setCurrentAgentId(agentObjectId)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setCurrentAgentId('')
  }

  const Modal: React.FC<Omit<FundAgentModalProps, 'open' | 'onClose' | 'agentObjectId'>> = (
    props
  ) => (
    <FundAgentModal
      open={isOpen}
      onClose={closeModal}
      agentObjectId={currentAgentId}
      {...props}
    />
  )

  return {
    modalProps: {
      open: isOpen,
      onClose: closeModal,
      agentObjectId: currentAgentId,
    },
    openModal,
    Modal,
  }
}
