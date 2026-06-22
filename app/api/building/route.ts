import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const buildings = await prisma.building.findMany()
    return NextResponse.json(buildings)
  } catch (error) {
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
