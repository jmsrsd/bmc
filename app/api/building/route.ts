import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache for 5 minutes, stale-while-revalidate for 60s
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const buildings = await prisma.building.findMany()
    const response = NextResponse.json(buildings)
    
    // Cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    response.headers.set('ETag', generateETag(buildings))
    
    return response
  } catch (error) {
    console.error('Failed to fetch buildings:', error)
    return NextResponse.json({ error: 'Failed to fetch buildings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const building = await prisma.building.create({
      data: {
        name: body.name,
        address: body.address,
      },
    })
    return NextResponse.json(building, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create building' }, { status: 500 })
  }
}

function generateETag(data: unknown): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `"${hash.toString(16)}"`
}