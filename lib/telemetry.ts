import { z } from 'zod'

// DESIGN.md §4.2 — MQTT telemetry payload schema
// BACnet/Modbus/MQTT Sparkplug B message format
export const TelemetrySchema = z.object({
  buildingId: z.string().min(1),
  deviceId: z.string().min(1),
  type: z.enum([
    'analog-input',
    'analog-output',
    'binary-input',
    'binary-output',
    'multi-state-input',
    'multi-state-output',
  ]),
  value: z.number().finite(),
  unit: z.string().min(1),
  ts: z
    .string()
    .datetime()
    .refine((val) => new Date(val) <= new Date(), {
      message: 'Timestamp must not be in the future',
    }),
  quality: z.number().int().min(0).max(100),
})

export type Telemetry = z.infer<typeof TelemetrySchema>

export function validateTelemetry(data: unknown): Telemetry {
  return TelemetrySchema.parse(data)
}
