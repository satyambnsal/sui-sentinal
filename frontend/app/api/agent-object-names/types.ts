/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse<T = any> {
  success?: boolean
  error?: string
  agents?: { agentId: string; agentName: string }[]
  data?: T
}

export interface AddAgentObjectIdRequest {
  agentObjectIdWithName: string
}

export interface UpdateArrayRequest {
  agentObjectIds: string[]
}

export interface DeleteAgentObjectIdRequest {
  agentObjectId: string
}
