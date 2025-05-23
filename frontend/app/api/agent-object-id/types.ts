export interface ApiResponse<T = any> {
  success?: boolean
  error?: string
  agentObjectIds?: string[]
  data?: T
}

export interface AddAgentObjectIdRequest {
  agentObjectId: string
}

export interface UpdateArrayRequest {
  agentObjectIds: string[]
}

export interface DeleteAgentObjectIdRequest {
  agentObjectId: string
}
