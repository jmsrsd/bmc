import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
        elevators: {
          include: { cars: true },
        },
        firePanels: {
          include: { devices: true },
        },
        meters: {
          include: { readings: { orderBy: { timestamp: 'desc' }, take: 48 } },
        },
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

    return NextResponse.json({ ...building, alarms })
  } catch (error) {
    console.error('Failed to fetch building:', error)
    return NextResponse.json({ error: 'Failed to fetch building' }, { status: 500 })
  }
}
