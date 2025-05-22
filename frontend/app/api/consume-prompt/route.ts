import { LOCAL_API_PATH } from '@/constants'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${LOCAL_API_PATH}/consume-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`External API error! status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in consume-prompt API route:', error)
    return NextResponse.json({ error: 'Failed to consume agent' }, { status: 500 })
  }
}
