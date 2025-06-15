import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'
import type {
  ApiResponse,
  AddAgentObjectIdRequest,
  DeleteAgentObjectIdRequest,
  UpdateArrayRequest,
} from './types'

const ARRAY_KEY = 'ARRAY_OBJECT_IDS_WITH_NAMES'

// Get the array
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const params = await request.nextUrl.searchParams
    const agentId = params.get('agentId') || ''
    console.log('Agent ID', agentId)

    const agentObjectIdWithNames: string[] = (await kv.get(ARRAY_KEY)) || []
    let response = agentObjectIdWithNames.map((idWithName = '') => {
      const [agentObjectId, ...agentName] = idWithName.split(' ')
      return {
        agentId: agentObjectId,
        agentName: agentName.join(' '),
      }
    })
    if (agentId) {
      response = response.filter((agent) => agent.agentId === agentId)
    }

    return NextResponse.json({ agents: response })
  } catch (error) {
    console.error('Failed to fetch strings:', error)
    return NextResponse.json({ error: 'Failed to fetch strings' }, { status: 500 })
  }
}

// Update the entire array
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body: UpdateArrayRequest = await request.json()

    if (!Array.isArray(body.agentObjectIds)) {
      return NextResponse.json(
        { error: 'Invalid data: agentObjectIds must be an array' },
        { status: 400 }
      )
    }

    await kv.set(ARRAY_KEY, body.agentObjectIds)
    return NextResponse.json({ success: true, agentObjectIds: body.agentObjectIds })
  } catch (error) {
    console.error('Failed to save strings:', error)
    return NextResponse.json({ error: 'Failed to save strings' }, { status: 500 })
  }
}

// Add a string to the array
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body: AddAgentObjectIdRequest = await request.json()
    const agentObjectIdWithName = body.agentObjectIdWithName
    if (!agentObjectIdWithName || typeof agentObjectIdWithName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid data: agentObjectId is required' },
        { status: 400 }
      )
    }

    const currentObjectIdsWithName: string[] = (await kv.get(ARRAY_KEY)) || []
    if (currentObjectIdsWithName.includes(agentObjectIdWithName)) {
      const [agentId, ...agentName] = agentObjectIdWithName.split(' ')
      return NextResponse.json({
        success: false,
        agents: [{ agentId, agentName: agentName.join(' ') }],
        message: 'Already exists',
      })
    }

    const newIds = [...currentObjectIdsWithName, agentObjectIdWithName]
    await kv.set(ARRAY_KEY, newIds)

    const response = newIds.map((idWithName = '') => {
      const [agentObjectId, ...agentName] = idWithName.split(' ')
      return {
        agentId: agentObjectId,
        agentName: agentName.join(' '),
      }
    })
    return NextResponse.json({ success: true, agents: response })
  } catch (error) {
    console.error('Failed to add string:', error)
    return NextResponse.json({ error: 'Failed to add string' }, { status: 500 })
  }
}

// Delete a string from the array
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body: DeleteAgentObjectIdRequest = await request.json()

    if (!body.agentObjectId || typeof body.agentObjectId !== 'string') {
      return NextResponse.json({ error: 'Invalid data: string is required' }, { status: 400 })
    }

    const currentObjectIds: string[] = (await kv.get(ARRAY_KEY)) || []
    const newIds = currentObjectIds.filter((s) => s !== body.agentObjectId)
    await kv.set(ARRAY_KEY, newIds)

    return NextResponse.json({ success: true, agentObjectIds: newIds })
  } catch (error) {
    console.error('Failed to delete string:', error)
    return NextResponse.json({ error: 'Failed to delete string' }, { status: 500 })
  }
}
