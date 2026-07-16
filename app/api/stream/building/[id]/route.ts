import { prisma } from '@/lib/prisma'

export function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: buildingId } = await params

  const stream = new ReadableStream({
    start: async (controller) => {
      // Fetch full snapshot
      const [zones, sensors, hvacUnits, lightZones, doors, alarms, elevators, firePanels, meters] =
        await Promise.all([
          prisma.zone.findMany({ where: { buildingId } }),
          prisma.sensor.findMany({
            where: { zone: { buildingId } },
          }),
          prisma.hVACUnit.findMany({
            where: { zone: { buildingId } },
          }),
          prisma.lightZone.findMany({
            where: { zone: { buildingId } },
          }),
          prisma.door.findMany({
            where: { zone: { buildingId } },
          }),
          prisma.alarm.findMany({
            where: { buildingId, status: 'open' },
          }),
          prisma.elevator.findMany({
            where: { buildingId },
            include: { cars: true },
          }),
          prisma.firePanel.findMany({
            where: { buildingId },
            include: { devices: true },
          }),
          prisma.meter.findMany({ where: { buildingId } }),
        ])

      const snapshot = {
        buildingId,
        zones,
        sensors,
        hvac: hvacUnits,
        lights: lightZones,
        doors,
        alarms,
        elevators,
        firePanels,
        meters,
      }

      controller.enqueue(
        new TextEncoder().encode(sseEvent('snapshot', snapshot))
      )

      // Periodic telemetry + heartbeat
      let seq = 0
      const telemetryTimer = setInterval(async () => {
        try {
          // Update a random sensor value
          const sensorsList = await prisma.sensor.findMany({
            where: { zone: { buildingId }, type: 'TEMPERATURE' },
          })

          if (sensorsList.length > 0) {
            const target = sensorsList[Math.floor(Math.random() * sensorsList.length)]
            const delta = (Math.random() - 0.5) * 1.0 // ±0.5°C
            const newValue = Math.round((target.value + delta) * 10) / 10

            await prisma.sensor.update({
              where: { id: target.id },
              data: { value: newValue, timestamp: new Date() },
            })

            controller.enqueue(
              new TextEncoder().encode(
                sseEvent('telemetry', {
                  zoneId: target.zoneId,
                  type: 'TEMPERATURE',
                  value: newValue,
                  unit: '°C',
                  ts: new Date().toISOString(),
                })
              )
            )
          }
        } catch {
          // Ignore telemetry send errors
        }
      }, 3000)

      const heartbeatTimer = setInterval(() => {
        seq++
        controller.enqueue(
          new TextEncoder().encode(
            sseEvent('heartbeat', {
              ts: new Date().toISOString(),
              sequence: seq,
            })
          )
        )
      }, 15000)

      // Cleanup on cancel
      ;(stream as any).cancel = () => {
        clearInterval(telemetryTimer)
        clearInterval(heartbeatTimer)
      }
    },

    cancel() {
      // No-op: cleanup happens above
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
