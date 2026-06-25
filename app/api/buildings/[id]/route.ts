import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache for 5 minutes, stale-while-revalidate for 60s
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ifNoneMatch = request.headers.get('if-none-match')
  
  try {
    const building = await prisma.building.findUnique({
      where: { id },
      include: {
        zones: {
          include: {
            sensors: true,
            hvacUnits: true,
            lightZones: true,
            doors: true,
          },
        },
        elevators: { include: { cars: true } },
        firePanels: { include: { devices: true } },
        meters: { include: { readings: { orderBy: { timestamp: 'desc' }, take: 48 } } },
        cameras: true,
        tenants: true,
      },
    })

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 })
    }

    // Fetch alarms separately (no direct relation on Building model)
    const alarms = await prisma.alarm.findMany({
      where: { buildingId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const data = { ...building, alarms }
    const etag = generateETag(data)

    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }

    const response = NextResponse.json(data)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    response.headers.set('ETag', etag)

    return response
  } catch (error) {
    console.error('Failed to fetch building:', error)
    return NextResponse.json({ error: 'Failed to fetch building' }, { status: 500 })
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