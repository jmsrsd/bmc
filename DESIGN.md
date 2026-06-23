# BMC — Design Document

> **Status:** Active — MVP deployed
> **Building:** Biomedical Campus (BMC) — Indonesia's first integrated smart building for healthcare, technology, and education. Dual-tower (Knowledge Tower + Science Tower), Digital Hub SEZ, BSD City.
> **Stack:** Next.js 16 App Router + React 19 + Prisma + SQLite + Tailwind v4 + Vercel
> **Developer:** BMC Engineering Team
> **Architect:** BMC Systems Architecture
> **Certification Target:** ISO 50001 (Energy), ISO 27001 (Security), WELL Building Standard
> **Architecture Authority:** `DESIGN.md` (12 sections)
> **Testing Mandate:** `TESTING.md` (10 sections, TDD compulsory)
> **Use Case Authority:** `USECASE.md` (40 requirements, 37 use cases, 8 actors)
> **Agent Rules:** `AGENTS.md` (operational precedence, TDD enforcement)
> **Alias:** These four docs are referred to as `FOUR.md`
> **Graphify:** Use `graphify query` and `graphify path` for codebase reasoning before any architectural analysis
> **Directive D1:** When modifying this doc, web-search all referenced library APIs and patterns for current correctness. Append "(web-validated YYYY-MM-DD)" to header after doing so.
> **Testing Context:** See `TESTING.md` for verification contracts and test patterns
> **Use Case Context:** See `USECASE.md` for actor workflows, pre/post conditions, and scenario outputs

---

## Table of Contents

1. [System Context & Architecture](#1-system-context--architecture)
2. [Data Model](#2-data-model)
3. [API Design](#3-api-design)
4. [Real-Time Pipeline](#4-real-time-pipeline)
5. [IoT Integration Layer](#5-iot-integration-layer)
6. [Auth & Authorization](#6-auth--authorization)
7. [Frontend Architecture](#7-frontend-architecture)
8. [AI/ML Pipeline](#8-aiml-pipeline)
9. [Deployment & Infrastructure](#9-deployment--infrastructure)
10. [Key Design Decisions & Trade-offs](#10-key-design-decisions--trade-offs)
11. [Security Considerations](#11-security-considerations)
12. [Monitoring & Observability](#12-monitoring--observability)

---

## 1. System Context & Architecture

> **Use case alignment:** UC-SYS-01 (ingest), UC-SYS-02 (write setpoint), UC-STRM-01 (subscribe), UC-AUTH-01 (authenticate)
> **Testing alignment:** TESTING.md §2.1 (unit tests), §3.1 (SSE hook tests), §3.2 (telemetry schema tests)

### 1.1 High-Level Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Client     │     │   Edge       │     │   Application    │
│   (Browser)  │────▶│   (CDN/      │────▶│   (Next.js 16    │
│   React 19   │ SSE │   Vercel)    │     │   App Router)    │
└──────────────┘     └──────────────┘     └────────┬─────────┘
                                                    │
                                          ┌─────────▼─────────┐
                                          │   Data Layer      │
                                          │   (Prisma + SQLite)│
                                          └─────────┬─────────┘
                                                    │
                                          ┌─────────▼─────────┐
                                          │   IoT Gateway     │
                                          │   (Python/Docker)  │
                                          │   BACnet/Modbus/MQTT│
                                          └─────────┬─────────┘
                                                    │
                                          ┌─────────▼─────────┐
                                          │   Devices         │
                                          │   (HVAC, Lights,  │
                                          │   Doors, Sensors, │
                                          │   Elevators)      │
                                          └───────────────────┘
```

The system follows a **layered architecture** with clear separation of concerns:

| Layer | Technology | Responsibility |
|-------|-----------|---------------|
| Client | React 19, Server Components | UI rendering, SSE consumption |
| Edge | Vercel CDN, Edge Middleware | Auth checks, redirects, caching |
| Application | Next.js 16 App Router | Server Actions, API routes, RSC data fetching |
| Data | Prisma ORM, SQLite | Persistent state, audit logs, entity relationships |
| IoT Gateway | Python, Docker/RPi4 | Protocol translation (BACnet/Modbus → MQTT) |
| Devices | BACnet/IP, Modbus RTU/TCP | Physical actuators and sensors |

### 1.2 Architectural Philosophy

**Server-first rendering.** Pages are React Server Components by default. `'use client'` is used only for components requiring browser APIs: SSE subscriptions (`useSSE`), sliders/toggles, real-time gauges, and form inputs. This maximizes SSR coverage and minimizes client bundle size.

**Streaming, not polling.** All live data arrives via Server-Sent Events (SSE). No polling on any dashboard. The `useSSE` hook manages connection lifecycle with automatic reconnection via the browser's native `EventSource` API.

**No global state library.** Each Client Component manages its own SSE subscription via the `useSSE` hook from `@/lib/useSSE`. No Redux, Zustand, or Jotai. Server Components fetch data via `React.cache` for deduplication within a single render pass.

**Server Actions for all mutations.** Every control action (setpoint change, lock/unlock, scene activation) flows through a Server Action with Zod validation, `checkAccess` authorization, Prisma persistence, audit logging, and `revalidatePath` cache invalidation.

**Edge middleware for auth only.** Edge Runtime handles authentication checks and redirects. No business logic at the edge.

> **Use case alignment:** UC-HVAC-01 (setpoint → Server Action), UC-SEC-01 (lock/unlock → Server Action), UC-LGT-01 (dimming → Server Action), UC-STRM-01 (SSE subscription)
> **Testing alignment:** TESTING.md §2.2 (component tests), §2.1 (pure function tests), §3.1 (SSE hook tests)

---

## 2. Data Model

> **Use case alignment:** UC-SYS-01 (telemetry ingested to Sensor), UC-HVAC-01 (HVACUnit setpoint), UC-SEC-01 (Door state), UC-ENR-01 (Meter/EnergyReading), UC-AUDIT-01 (AuditLog)
> **Testing alignment:** TESTING.md §8.1 (factories aligned to schema), §8.2 (SQLite DB)

### 2.1 Entity-Relationship Diagram

```
Building (1)────(N) Zone (1)────(N) Sensor
  │                  │
  │                  ├────(N) HVACUnit
  │                  ├────(N) LightZone
  │                  ├────(N) Door
  │                  └──(0..1) Schedule
  │
  ├────(N) Meter (1)────(N) EnergyReading
  ├────(N) Camera
  ├────(N) FirePanel (1)────(N) FireDevice
  ├────(N) Elevator (1)────(N) ElevatorCar
  └────(N) Tenant

Zone (1)────(N) Sensor ── [compound index: zoneId, type, timestamp]

Alarm ── [standalone, indexed by buildingId+status+createdAt]
AuditLog ── [standalone, indexed by buildingId+createdAt, userId+createdAt]
```

### 2.2 Prisma Schema (Core Entities)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Building {
  id        String   @id @default(cuid())
  name      String
  address   String   @default("")
  timezone  String   @default("Asia/Jakarta")
  lat       Float?
  lng       Float?
  zones     Zone[]
  meters    Meter[]
  firePanels FirePanel[]
  cameras   Camera[]
  elevators Elevator[]
  tenants   Tenant[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Zone {
  id          String     @id @default(cuid())
  buildingId  String
  building    Building   @relation(fields: [buildingId], references: [id])
  name        String
  floor       Int        @default(1)
  area        Float?     @default(0)
  type        String     @default("OFFICE")
  hvacUnits   HVACUnit[]
  lightZones  LightZone[]
  sensors     Sensor[]
  doors       Door[]
  scheduleId  String?
  schedule    Schedule?  @relation(fields: [scheduleId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([buildingId])
}

model Sensor {
  id        String   @id @default(cuid())
  zoneId    String
  zone      Zone     @relation(fields: [zoneId], references: [id])
  type      String   @default("TEMPERATURE")
  unit      String   @default("°C")
  value     Float    @default(0)
  quality   Int      @default(100)
  timestamp DateTime @default(now())
  metadata  String   @default("{}")

  @@index([zoneId, type, timestamp])
  @@index([type, timestamp])
}

model HVACUnit {
  id              String   @id @default(cuid())
  zoneId          String
  zone            Zone     @relation(fields: [zoneId], references: [id])
  type            String   @default("AHU")
  subtype         String   @default("")
  state           String   @default("ON")
  mode            String   @default("AUTO")
  supplyTemp      Float?   @default(0)
  returnTemp      Float?   @default(0)
  setpoint        Float?   @default(22)
  fanSpeed        String   @default("AUTO")
  occupancyMode   Boolean  @default(false)
  runHours        Int      @default(0)
  lastMaintenance DateTime?
  alarmPriority   Int?     @default(0)
  metadata        String   @default("{}")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([zoneId])
}

model LightZone {
  id          String   @id @default(cuid())
  zoneId      String
  zone        Zone     @relation(fields: [zoneId], references: [id])
  name        String   @default("")
  dimLevel    Int      @default(100)
  state       String   @default("ON")
  scene       String   @default("NORMAL")
  power       Float    @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([zoneId])
}

model Door {
  id          String   @id @default(cuid())
  zoneId      String
  zone        Zone     @relation(fields: [zoneId], references: [id])
  name        String   @default("")
  state       String   @default("LOCKED")
  alarmState  String   @default("NORMAL")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([zoneId])
}

model Camera {
  id          String   @id @default(cuid())
  buildingId  String
  building    Building @relation(fields: [buildingId], references: [id])
  name        String   @default("")
  state       String   @default("ONLINE")
  streamUrl   String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([buildingId])
}

model FirePanel {
  id          String       @id @default(cuid())
  buildingId  String
  building    Building     @relation(fields: [buildingId], references: [id])
  name        String       @default("")
  state       String       @default("NORMAL")
  devices     FireDevice[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([buildingId])
}

model FireDevice {
  id           String    @id @default(cuid())
  panelId      String
  panel        FirePanel @relation(fields: [panelId], references: [id])
  type         String    @default("SMOKE")
  state        String    @default("NORMAL")
  zone         String    @default("")
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([panelId])
}

model Elevator {
  id          String         @id @default(cuid())
  buildingId  String
  building    Building       @relation(fields: [buildingId], references: [id])
  name        String         @default("")
  cars        ElevatorCar[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([buildingId])
}

model ElevatorCar {
  id         String  @id @default(cuid())
  elevatorId String
  elevator   Elevator @relation(fields: [elevatorId], references: [id])
  name       String  @default("")
  floor      Int     @default(1)
  direction  String  @default("IDLE")
  doorState  String  @default("CLOSED")
  state      String  @default("NORMAL")
  recallFloor Int?   @default(0)

  @@index([elevatorId])
}

model Meter {
  id          String          @id @default(cuid())
  buildingId  String
  building    Building        @relation(fields: [buildingId], references: [id])
  type        String          @default("ELECTRIC")
  name        String          @default("")
  unit        String          @default("kW")
  value       Float           @default(0)
  cumulative  Float           @default(0)
  readings    EnergyReading[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([buildingId])
}

model EnergyReading {
  id        String   @id @default(cuid())
  meterId   String
  meter     Meter    @relation(fields: [meterId], references: [id])
  value     Float    @default(0)
  timestamp DateTime @default(now())

  @@index([meterId, timestamp])
}

model Alarm {
  id          String   @id @default(cuid())
  buildingId  String
  zoneId      String?
  zoneName    String   @default("")
  type        String   @default("GENERAL")
  severity    String   @default("warning")
  message     String   @default("")
  status      String   @default("open")
  acknowledgedBy String?
  acknowledgedAt DateTime?
  comment     String   @default("")
  source      String   @default("system")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([buildingId, status, createdAt])
  @@index([severity, status])
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String   @default("system")
  action     String   @default("")
  target     String   @default("")
  detail     String   @default("{}")
  buildingId String   @default("")
  ip         String   @default("")
  userAgent  String   @default("")
  createdAt  DateTime @default(now())

  @@index([buildingId, createdAt])
  @@index([userId, createdAt])
}

model Schedule {
  id        String   @id @default(cuid())
  name      String   @default("")
  zones     Zone[]
  config    String   @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Tenant {
  id         String   @id @default(cuid())
  buildingId String
  building   Building @relation(fields: [buildingId], references: [id])
  name       String   @default("")
  unit       String   @default("")
  contact    String   @default("")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([buildingId])
}
```

**Enums (encoded as strings in SQLite):**

| Enum | Values | Prisma Field |
|------|--------|-------------|
| HVACType | AHU, VAV, FCU, CHILLER, BOILER, HP, EXHAUST_FAN, HEPA_FILTER, BIOSAFETY_CABINET | `HVACUnit.type` |
| HVACMode | COOL, HEAT, AUTO, VENT | `HVACUnit.mode` |
| FanSpeed | OFF, LOW, MEDIUM, HIGH, AUTO | `HVACUnit.fanSpeed` |
| HVACState | ON, OFF, STANDBY, FAULT | `HVACUnit.state` |
| ZoneType | OFFICE, LOBBY, CORRIDOR, PARKING, MECHANICAL, WAREHOUSE, STAIR, LAB, CLINIC, CLEANROOM, PHARMACY, BIOSAFETY, RETAIL, FOOD_COURT | `Zone.type` |
| SensorType | TEMPERATURE, HUMIDITY, CO2, PIR, LIGHT, PRESSURE, FLOW, VIBRATION, SMOKE, VOC, PARTICLE_COUNT, MEDICAL_GAS, DOOR_CONTACT, GAS_PRESSURE | `Sensor.type` |
| AlarmSeverity | info, warning, critical | `Alarm.severity` |
| AlarmStatus | open, acknowledged, resolved | `Alarm.status` |
| DoorState | LOCKED, UNLOCKED, OPEN, FORCED | `Door.state` |
| FirePanelState | NORMAL, ALARM, FAULT, DISCONNECTED | `FirePanel.state` |
| ElevatorDirection | UP, DOWN, IDLE | `ElevatorCar.direction` |
| ElevatorDoorState | OPEN, CLOSED, OPENING, CLOSING | `ElevatorCar.doorState` |

### 2.3 Design Notes

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| CUID for all IDs | URL-safe, no sequential leak, collision-resistant | Less human-readable than integers |
| String enums (not Prisma enums) | SQLite lacks native enum type; string allows flexible migration | No DB-level constraint on valid values; enforced by Zod at app layer |
| `metadata` as JSON string | Flexible schema for device-specific data without schema changes | No DB-level query on metadata fields; must parse at app layer |
| Compound indexes on Sensor | `(zoneId, type, timestamp)` supports dashboard queries efficiently | Write overhead on every telemetry insert |
| Single `AuditLog` table | Simpler query, single compliance audit trail | Table grows fast; needs periodic archival |
| `Schedule.config` as JSON string | Flexible scheduling rules (time-of-day, day-of-week, holiday) without rigid schema | No DB-level validation of schedule structure |
| SQLite as primary DB | Zero-ops for MVP, embedded, fast reads | Limited concurrent write throughput; migration path to PostgreSQL for production scale |

> **Use case alignment:** UC-SYS-01 (Sensor writes), UC-HVAC-01 (HVACUnit.setpoint), UC-SEC-01 (Door.state), UC-AUDIT-01 (AuditLog.create)
> **Testing alignment:** TESTING.md §8.1 (factories), §8.2 (SQLite DB setup), §2.3 (Server Action tests verify schema shape)

---

## 3. API Design

> **Use case alignment:** UC-HVAC-01 (Server Action pattern), UC-STRM-01 (SSE endpoints), UC-SYS-01 (telemetry ingest)
> **Testing alignment:** TESTING.md §2.3 (Server Action tests), §2.4 (API route tests), §3.1 (SSE hook tests)

### 3.1 Principles

1. **Server Actions over REST for mutations.** All control actions (setpoint, lock/unlock, dimming, alarm ack) use Next.js Server Actions with `FormData` input. This eliminates manual CSRF handling (Next.js signs Server Action payloads) and provides type-safe RPC.

2. **REST for reads and queries.** `GET /api/buildings`, `GET /api/buildings/[id]` for data retrieval. Simple, cacheable, standard.

3. **SSE for real-time.** `GET /api/stream/building/[id]` opens an `EventSource`-compatible stream. Snapshot on connect, incremental updates thereafter.

4. **Zod validation on every input.** All Server Actions validate with Zod `.strict()` schemas before touching the database.

5. **Audit log on every mutation.** Every control action writes to `AuditLog` before returning success. Fail-closed: if audit write fails, the mutation is rolled back.

### 3.2 URL Schema

| Method | URL | Purpose | Auth |
|--------|-----|---------|------|
| GET | `/api/buildings` | List all buildings | Viewer+ |
| GET | `/api/buildings/[id]` | Get building with zones, sensors, HVAC | Viewer+ |
| GET | `/api/stream/building/[id]` | SSE telemetry stream | Viewer+ |
| POST | `/api/login` | Authenticate (password gate) | Public |
| POST | `/api/logout` | Clear session | Authenticated |
| Action | `setTemperature` | Set zone HVAC setpoint (16-30°C) | Operator+ |
| Action | `setFanSpeed` | Set fan speed (OFF/LOW/MED/HIGH/AUTO) | Operator+ |
| Action | `setHvacMode` | Set HVAC mode (COOL/HEAT/AUTO/VENT) | Operator+ |
| Action | `setDimLevel` | Set lighting dim level (0-100%) | Operator+ |
| Action | `toggleLight` | Toggle lights ON/OFF | Operator+ |
| Action | `setDoorState` | Lock/unlock door | Security+ |
| Action | `acknowledgeAlarm` | Acknowledge alarm with comment | Operator+ |
| Action | `recallElevator` | Recall elevator to floor | Security+ |
| Action | `clearElevatorRecall` | Clear elevator recall state | Security+ |
| Action | `clearFireAlarm` | Clear fire alarm (false alarm) | Security+ |

### 3.3 SSE Stream Format

The SSE endpoint (`/api/stream/building/[id]`) emits three event types:

```
event: snapshot
data: {"buildingId":"b1","zones":[...],"sensors":[...],"hvac":[...],"lights":[...],"doors":[...],"alarms":[...],"elevators":[...],"firePanels":[...],"meters":[...]}

event: telemetry
data: {"zoneId":"z1","type":"TEMPERATURE","value":22.5,"unit":"°C","ts":"2026-06-21T10:30:00Z"}

event: heartbeat
data: {"ts":"2026-06-21T10:30:00Z","sequence":42}
```

| Event | Timing | Purpose |
|-------|--------|---------|
| `snapshot` | On connect | Full building state for initial render |
| `telemetry` | Every 3s | Incremental sensor value updates |
| `heartbeat` | Every 15s | Keep-alive, detect stale connections |

**Response headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

> **Use case alignment:** UC-STRM-01 (subscribe to telemetry stream), UC-SYS-01 (telemetry format)
> **Testing alignment:** TESTING.md §3.1 (SSE hook tests with mock EventSource), §3.2 (telemetry message schema)

### 3.4 Server Action Pattern

Every Server Action follows this pattern:

```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession, checkAccess } from '@/lib/auth'
import { BUILDING_ID } from '@/lib/types'

export async function setTemperature(prevState: any, formData: FormData) {
  const session = await getSession()
  try {
    // 1. Authorize (UC-AUTH-02)
    checkAccess(session?.user ?? null, BUILDING_ID, 'operator')

    // 2. Validate input
    const zoneId = formData.get('zoneId') as string
    const setpoint = Number(formData.get('setpoint'))
    if (!zoneId || isNaN(setpoint) || setpoint < 16 || setpoint > 30) {
      return { error: 'Invalid input: setpoint must be 16-30°C' }
    }

    // 3. Read current value for audit
    const current = await prisma.hVACUnit.findFirst({
      where: { zoneId }, select: { setpoint: true }
    })

    // 4. Persist mutation
    await prisma.hVACUnit.updateMany({
      where: { zoneId },
      data: { setpoint },
    })

    // 5. Audit log (UC-AUDIT-01)
    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: 'SET_SETPOINT',
        target: zoneId,
        detail: JSON.stringify({ before: current?.setpoint ?? null, after: setpoint }),
        buildingId: BUILDING_ID,
      },
    })

    // 6. Invalidate RSC cache
    revalidatePath('/building/hvac')
    return { success: true, setpoint, zoneId }
  } catch (e: any) {
    return { error: e.message || 'Failed to set temperature' }
  }
}
```

**Pattern invariants:**
1. `getSession()` → authenticate
2. `checkAccess(session, buildingId, minRole)` → authorize
3. Zod/manual validation → reject bad input
4. `prisma.<model>.updateMany/update/create` → persist
5. `prisma.auditLog.create` → audit trail
6. `revalidatePath()` → bust RSC cache
7. Return `{ success, ... }` or `{ error }`

> **Use case alignment:** UC-HVAC-01 (setpoint flow), UC-LGT-01 (dimming flow), UC-SEC-01 (lock/unlock flow)
> **Testing alignment:** TESTING.md §2.3 (Server Action tests with mock Prisma + auth)

---

## 4. Real-Time Pipeline

> **Use case alignment:** UC-SYS-01 (ingest), UC-SYS-05/06 (buffer/replay), UC-STRM-01 (SSE subscription), UC-SYS-02 (write setpoint to BACnet)
> **Testing alignment:** TESTING.md §3.1 (SSE hook tests), §3.2 (telemetry schema), §3.4 (gateway Python tests)

### 4.1 Data Flow

```
┌──────────────┐    BACnet/IP    ┌──────────────┐    MQTT/TLS     ┌──────────────┐
│  BACnet      │───────────────▶│  Gateway     │───────────────▶│  MQTT Broker │
│  Device      │                │  (RPi4/Docker)│                │  (Cloud)     │
└──────────────┘                └──────────────┘                └──────┬───────┘
                                                                       │
                                                              MQTT Subscribe
                                                                       │
                                                              ┌────────▼────────┐
                                                              │  Edge Processor  │
                                                              │  (Node.js)       │
                                                              └───┬────────┬────┘
                                                                  │        │
                                                           Zod validate   │
                                                                  │        │
                                                     ┌────────────▼┐  ┌───▼──────────┐
                                                     │  Prisma DB  │  │  SSE Broadcast│
                                                     │  (SQLite)    │  │  (EventSource) │
                                                     └─────────────┘  └──────────────┘
```

### 4.2 Edge Processing

The gateway (Python, runs on building LAN) polls BACnet devices and publishes MQTT messages:

```python
# gateway/processor.py
import json
import time
from paho.mqtt import client as mqtt_client

def build_telemetry(building_id: str, device_id: str, value: float, unit: str) -> dict:
    return {
        "buildingId": building_id,
        "deviceId": device_id,
        "type": "analog-input",
        "value": round(value, 2),
        "unit": unit,
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "quality": 95,
    }

def on_message(client, userdata, msg):
    payload = json.loads(msg.payload.decode())
    # Forward to cloud MQTT broker
    client.publish(
        f"bmc/{payload['buildingId']}/telemetry",
        json.dumps(payload),
        qos=1,
    )
```

### 4.3 Stream Distribution

The SSE endpoint (`app/api/stream/building/[id]/route.ts`) manages per-connection state:

1. **On connect:** Fetch full building snapshot (zones, sensors, HVAC, lights, doors, alarms, elevators, fire panels, meters) via parallel Prisma queries. Send `snapshot` event.
2. **Periodic telemetry (3s):** Simulate sensor fluctuations (±0.5°C random walk). Send `telemetry` events. In production, this is replaced by MQTT → SSE bridge.
3. **Heartbeat (15s):** Send `heartbeat` event with incrementing sequence number. Client detects stale connections if no heartbeat within 30s.
4. **On disconnect:** `ReadableStream.cancel()` clears all timers. Browser `EventSource` auto-reconnects.

### 4.4 Reconnection Strategy

| Scenario | Client Behavior | Server Behavior | Max Downtime |
|----------|----------------|-----------------|-------------|
| Network blip | EventSource auto-reconnect (browser native) | Stream cleanup, new snapshot on reconnect | 3s (default retry) |
| CDN timeout | Retry with exponential backoff (1s, 2s, 4s, max 30s) | New connection gets fresh snapshot | 30s |
| Server restart | EventSource reconnect → 502 → retry | Full snapshot on new connection | 10s |
| Token expiry | EventSource reconnect → 401 → redirect to login | Edge middleware returns 401 | Until user re-authenticates |
| Gateway offline | No SSE impact (snapshot from DB) | DB shows stale values, quality degrades | Indefinite (data stale) |

### 4.5 Backpressure & Throttling

- **Telemetry rate:** 1 event per 3s per building (configurable). Production: rate-limited by gateway poll interval.
- **SSE fan-out:** In-memory per-process. For >500 concurrent connections/building, horizontal scaling via Vercel serverless instances.
- **MQTT QoS:** QoS 1 (at-least-once) for telemetry. Gateway buffers locally if broker unreachable.
- **DB write batching:** Batch sensor updates every 1s to reduce SQLite write contention.

### 4.6 SSE Chaos Testing Scenarios

> **Use case alignment:** UC-STRM-01 (SSE subscription lifecycle)
> **Testing alignment:** TESTING.md §3.1 (SSE hook tests), §10 (verification checklist)

| # | Scenario | Trigger | Expected Behavior | Recovery |
|---|----------|---------|-------------------|----------|
| 1 | **Gateway disconnect → snapshot** | Kill gateway process during active telemetry stream | SSE stream continues with stale DB values; quality field degrades to 0; heartbeat continues; no crash on client | Restart gateway → telemetry resumes, quality restored |
| 2 | **CDN timeout → reconnect** | Simulate Vercel edge node timeout (120s) | EventSource detects connection loss; client retries after 1s; server sends fresh snapshot on reconnect; no data loss between disconnect and reconnect | Automatic — EventSource native retry |
| 3 | **Network partition → stale state** | Block MQTT traffic for 60s (iptables) | Gateway buffers telemetry locally (SQLite); SSE clients see last-known values; alarm thresholds not triggered on stale data; quality field shows staleness | Partition heals → gateway replays buffered telemetry (UC-SYS-06) |
| 4 | **Concurrent reconnect → no duplicates** | Force 10 simultaneous EventSource reconnects (tab refresh storm) | Each connection gets independent snapshot; no shared mutable state between connections; no duplicate telemetry events within a single connection | Each connection independent — no coordination needed |
| 5 | **Telemetry burst → backpressure** | Generate 1000 telemetry messages in 1s (flood MQTT topic) | Edge processor drops messages beyond rate limit (1/sensor/3s); SSE broadcast throttled; no OOM; DB writes batched | Rate limiter absorbs burst; downstream sees smoothed telemetry |

> **Use case alignment:** UC-STRM-01 (SSE lifecycle), UC-SYS-05/06 (buffer/replay)
> **Testing alignment:** TESTING.md §3.1 (SSE tests), §3.4 (gateway tests), §10 (chaos test checklist)

---

## 5. IoT Integration Layer

> **Use case alignment:** UC-SYS-01 (ingest), UC-SYS-02 (write setpoint), UC-SYS-03 (device discovery), UC-SYS-05/06 (buffer/replay)
> **Testing alignment:** TESTING.md §3.2 (telemetry schema), §3.4 (gateway Python tests)

### 5.1 Gateway Architecture

```
┌─────────────────────────────────────────────────┐
│  IoT Gateway (Python, Docker, RPi4 or x86)      │
│                                                   │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │  BACnet   │  │  Modbus   │  │  MQTT     │   │
│  │  Driver   │  │  Driver   │  │  Client   │   │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘   │
│        │               │               │         │
│        └───────┬───────┘               │         │
│                │                       │         │
│         ┌──────▼──────┐        ┌──────▼──────┐  │
│         │  Protocol   │        │  MQTT       │  │
│         │  Adapter    │        │  Publisher  │  │
│         └──────┬──────┘        └──────┬──────┘  │
│                │                       │         │
│         ┌──────▼──────┐               │         │
│         │  Local      │        ┌──────▼──────┐  │
│         │  Buffer     │        │  Cloud      │  │
│         │  (SQLite)   │        │  MQTT       │  │
│         └─────────────┘        └──────┬──────┘  │
│                                       │         │
└───────────────────────────────────────┼─────────┘
                                        │
                                   ┌────▼────┐
                                   │  Cloud  │
                                   │  Broker │
                                   └─────────┘
```

### 5.2 Supported Protocols

| Protocol | Use Case | Data Rate | Gateway Support |
|----------|----------|-----------|----------------|
| **BACnet/IP** | Commercial HVAC (AHUs, chillers, VAVs) | 1-5s poll | Native Python BACpypes |
| **Modbus RTU** | Legacy power meters, lighting controllers | 1-10s poll | pymodbus over serial/TCP |
| **Modbus TCP** | Modern power meters, VFDs | 1-5s poll | pymodbus TCP client |
| **MQTT Sparkplug B** | IoT-native sensors, smart devices | Event-driven | paho-mqtt subscriber |
| **DALI** | Lighting control (dimming, scenes) | On-command | DALI-to-Modbus bridge |
| **OPC-UA** | Building automation systems (BMS integration) | 1-5s poll | opcua Python library |

### 5.3 Device Discovery

1. **BACnet Who-Is broadcast** on building LAN subnet
2. **Modbus scan** of configured register ranges (0-255 addresses)
3. **MQTT subscription** on `spBv1.0/+/DCMD/#` (Sparkplug B command topics)
4. Discovered devices registered in Prisma `Zone` + `Sensor` / `HVACUnit` models
5. Device metadata stored in `metadata` JSON field

### 5.4 Offline Resilience

| Scenario | Gateway Behavior | Cloud Behavior | Recovery |
|----------|-----------------|----------------|----------|
| MQTT broker unreachable | Buffer telemetry in local SQLite (7-day capacity) | N/A (no data received) | On reconnect: replay buffered messages in chronological order (UC-SYS-06) |
| BACnet device offline | Skip device in poll cycle, log warning, use last-known value | Stale value in DB, quality degrades | Device responds → resume polling |
| Gateway power loss | Local buffer lost (volatile) | Shows last snapshot until gateway restarts | Gateway restarts → resumes normal operation |
| Network partition (partial) | Buffer all outbound, continue local polling | No new data, alarms freeze | Partition heals → replay + catch up |

> **Use case alignment:** UC-SYS-01 (ingest), UC-SYS-05 (buffer offline), UC-SYS-06 (replay)
> **Testing alignment:** TESTING.md §3.4 (gateway Python tests), §3.2 (telemetry schema)

---

## 6. Auth & Authorization

> **Use case alignment:** UC-AUTH-01 (authenticate), UC-AUTH-02 (authorize), UC-SEC-08 (credential revocation)
> **Testing alignment:** TESTING.md §3.3 (auth matrix tests — 7 role combos)

### 6.1 Auth Flow (NextAuth + JWT)

**MVP (current):** Password-gate authentication. Single password (`bmc2024`) creates an `HttpOnly` session cookie. Simplified for demo.

**Production target:** NextAuth.js with JWT strategy (Edge-readable tokens). Providers: LDAP (campus directory), SSO (SAML 2.0 for enterprise tenants), email/password (fallback).

```
Browser ──POST /api/login──▶ Edge Middleware
                                  │
                                  ▼
                          verifyPassword()
                                  │
                          ┌───────┴───────┐
                          │  Valid        │  Invalid
                          ▼               ▼
                   Set HttpOnly     Return 401
                   session cookie   "Invalid credentials"
                          │
                          ▼
                   Redirect to /building
```

### 6.2 Session Management

| Property | Value |
|----------|-------|
| Cookie name | `bmc_session` |
| Cookie type | `HttpOnly`, `SameSite: Lax` |
| Max age | 12 hours |
| Storage | Server-side cookie (no JWT payload in MVP) |
| Clearing | `POST /api/logout` → zero-max-age cookie |
| SSE auth | EventSource inherits cookies; 401 triggers redirect via edge middleware |

### 6.3 Authorization Matrix

The `checkAccess(user, buildingId, minRole)` function enforces RBAC:

```typescript
export function checkAccess(
  user: User | null,
  _buildingId?: string,
  minRole?: Role
): void {
  if (!user) throw new Error('Unauthenticated')
  if (!minRole) return
  if (ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minRole]) {
    throw new Error('Forbidden: insufficient role')
  }
}
```

**Role hierarchy** (ascending privilege):

| Level | Role | Capabilities |
|-------|------|-------------|
| 0 | `viewer` | Read-only dashboard access |
| 1 | `tech` | View device diagnostics, acknowledge alarms |
| 2 | `operator` | Control HVAC, lighting, acknowledge alarms |
| 3 | `security` | Lock/unlock doors, elevator recall, fire alarm clear |
| 4 | `energy` | Energy reports, demand response, schedule management |
| 5 | `admin` | User management, building config, credential revocation |
| 6 | `superadmin` | Portfolio-wide access, system overrides, RBAC config |

**Action-to-role mapping:**

| Action | Required Role | Server Action |
|--------|--------------|---------------|
| View dashboard | `viewer` | — (RSC) |
| Set temperature | `operator` | `setTemperature` |
| Set fan speed | `operator` | `setFanSpeed` |
| Set HVAC mode | `operator` | `setHvacMode` |
| Dim lighting | `operator` | `setDimLevel` |
| Toggle lights | `operator` | `toggleLight` |
| Acknowledge alarm | `operator` | `acknowledgeAlarm` |
| Lock/unlock door | `security` | `setDoorState` |
| Elevator recall | `security` | `recallElevator` |
| Clear fire alarm | `security` | `clearFireAlarm` |
| Manage users | `admin` | — (future) |
| Portfolio config | `superadmin` | — (future) |

> **Use case alignment:** UC-AUTH-01 (authenticate), UC-AUTH-02 (authorize — included by every control UC), UC-SEC-08 (credential revocation)
> **Testing alignment:** TESTING.md §3.3 (auth matrix tests with 7 role combos + building scope)

---

## 7. Frontend Architecture

> **Use case alignment:** UC-HVAC-01 (HVAC controls), UC-LGT-01 (lighting controls), UC-SEC-01 (door controls), UC-STRM-01 (SSE subscription)
> **Testing alignment:** TESTING.md §2.2 (component tests), §3.1 (SSE hook tests)

### 7.1 Page Structure

```
app/
├── layout.tsx                          # Root layout (navigation, providers)
├── page.tsx                            # Dashboard home (building overview)
├── loading.tsx                         # Global loading skeleton
├── error.tsx                           # Global error boundary
├── not-found.tsx                       # 404 page
├── login/
│   ├── layout.tsx                      # Login layout (no navigation)
│   └── page.tsx                        # Password gate login form
├── (routes)/
│   ├── building/
│   │   ├── page.tsx                    # Building overview
│   │   ├── loading.tsx                 # Building loading skeleton
│   │   ├── error.tsx                   # Building error boundary
│   │   ├── hvac/page.tsx              # HVAC controls (UC-HVAC-01)
│   │   ├── lighting/page.tsx          # Lighting controls (UC-LGT-01)
│   │   └── security/page.tsx          # Security/door controls (UC-SEC-01)
│   ├── energy/page.tsx                # Energy dashboard (UC-ENR-01)
│   ├── alarms/
│   │   ├── page.tsx                    # Alarm list + ack (UC-ALM-01)
│   │   └── ack-button.tsx             # Ack alarm client component
│   ├── fire/
│   │   ├── page.tsx                    # Fire panel status (UC-FIR-01)
│   │   └── fire-clear-form.tsx         # Fire alarm clear form
│   └── elevators/
│       ├── page.tsx                    # Elevator status (UC-FIR-04)
│       ├── elevator-recall-form.tsx    # Recall form
│       ├── elevator-clear-recall.tsx   # Clear recall form
│       └── error.tsx                   # Elevator error boundary
└── api/
    ├── buildings/[id]/route.ts         # GET building data
    ├── building/route.ts               # GET all buildings
    ├── stream/building/[id]/route.ts   # SSE telemetry stream
    ├── login/route.ts                  # POST authenticate
    └── logout/route.ts                 # POST logout
```

### 7.2 Component Hierarchy

```
RootLayout
├── Navigation (ui/navigation.tsx)              ← Client Component
├── PageWrapper
│   ├── Building Overview (RSC)
│   │   ├── Zone Cards (RSC)
│   │   └── Summary Stats (RSC)
│   ├── HVAC Controls (ui/hvac-controls.tsx)    ← Client Component
│   │   ├── TemperatureSlider
│   │   ├── FanSpeedSelector
│   │   └── ModeSwitcher
│   ├── Lighting Controls (ui/lighting-controls.tsx) ← Client Component
│   │   ├── DimSlider
│   │   ├── OnOffToggle
│   │   └── SceneSelector
│   ├── Security Controls (ui/door-controls.tsx) ← Client Component
│   │   ├── DoorLockToggle
│   │   └── DoorStatusIndicator
│   ├── Alarm List (RSC + ack-button.tsx Client)
│   ├── Fire Panel (RSC + fire-clear-form.tsx Client)
│   └── Elevator Status (RSC + forms Client)
```

**State management:** No global state library. Each Client Component manages its own state via `useState` + `useSSE`.

| Pattern | Implementation | Example |
|---------|---------------|---------|
| Real-time data | `useSSE(url, initialState)` | HVAC page subscribes to `/api/stream/building/b1` |
| Form mutations | `useActionState` + Server Actions | `setTemperature`, `setDoorState` |
| Optimistic updates | Local `useState` before Server Action resolves | Door toggle shows new state immediately |
| Error handling | `try/catch` in Server Actions, return `{ error }` | Validation errors displayed inline |

> **Use case alignment:** UC-HVAC-01 (HVAC page), UC-LGT-01 (lighting page), UC-SEC-01 (security page)
> **Testing alignment:** TESTING.md §2.2 (component behavior tests, no snapshots)

### 7.3 Real-Time Integration (useSSE hook)

```typescript
'use client'

import { useState, useEffect } from 'react'

export function useSSE<T>(url: string, initial: T): T {
  const [data, setData] = useState<T>(initial)

  useEffect(() => {
    const es = new EventSource(url)

    es.onmessage = (e) => {
      try {
        setData(JSON.parse(e.data))
      } catch {
        // Ignore malformed messages
      }
    }

    es.onerror = () => {
      // EventSource auto-reconnects; no explicit action needed
    }

    return () => es.close()
  }, [url])

  return data
}
```

**Key properties:**
- **Auto-reconnect:** Browser `EventSource` natively retries on disconnect (default 3s interval)
- **No polling:** Connection stays open; data pushed from server
- **Cleanup:** `es.close()` called on component unmount
- **Type-safe:** Generic `T` parameter matches initial data shape
- **No global state:** Each component instance has its own SSE subscription

> **Use case alignment:** UC-STRM-01 (subscribe to telemetry stream)
> **Testing alignment:** TESTING.md §3.1 (mock EventSource, verify lifecycle)

---

## 8. AI/ML Pipeline

> **Use case alignment:** UC-SYS-04 (publish ML anomaly score), UC-ENR-04 (EUI trend), UC-ENR-06 (carbon dashboard)
> **Testing alignment:** TESTING.md §3.5 (ML inference tests)

### 8.1 Data Ingestion

Telemetry data flows from the IoT pipeline (§4) into feature stores:

| Source | Frequency | Storage | Retention |
|--------|-----------|---------|-----------|
| HVAC telemetry | 5s | Sensor table + time-series | 90 days raw, 1 year aggregated |
| Energy readings | 60s | EnergyReading table | 1 year raw, 5 years daily aggregates |
| Alarm events | On-event | Alarm table | 2 years |
| Occupancy (PIR) | 5s | Sensor table (PIR type) | 90 days |
| Weather (external API) | 15min | External cache | 30 days |

### 8.2 Feature Engineering (128-dim Embeddings)

Raw telemetry is transformed into 128-dimensional feature vectors for ML models:

| Feature Group | Dimensions | Source | Description |
|---------------|-----------|--------|-------------|
| Temperature profile | 16 | Sensor (TEMPERATURE) | Per-zone temp, supply/return temp, setpoint delta |
| Humidity profile | 8 | Sensor (HUMIDITY) | Zone humidity, dew point, comfort index |
| Energy signature | 16 | Meter + EnergyReading | kW demand, kWh cumulative, load factor, peak/trough ratio |
| HVAC operating state | 12 | HVACUnit | Mode, fan speed, supply/return delta, runtime hours |
| Occupancy pattern | 8 | Sensor (PIR) | Zone occupancy count, density, trend |
| Time features | 8 | Derived | Hour-of-day, day-of-week, is-holiday, season |
| Weather context | 8 | External API | Outdoor temp, humidity, solar radiation, wind |
| Alarm history | 8 | Alarm | Recent alarm count, severity distribution, MTBF |
| Building metadata | 4 | Building/Zone | Floor area, zone type encoding, orientation |
| Cross-correlations | 52 | Derived | Lagged correlations, cross-zone coupling, trend residuals |
| **Total** | **128** | | |

### 8.3 Model Serving (ONNX)

Models are exported to ONNX format and served via Node.js ONNX Runtime:

| Model | Input | Output | Latency Target | Use |
|-------|-------|--------|---------------|-----|
| Anomaly Detector | 128-dim vector | Score [0, 1] | <500ms | Flag unusual HVAC/energy patterns |
| Load Forecaster | 128-dim + 24h lookahead | kW forecast (24h) | <1s | Demand response planning |
| Comfort Optimizer | Zone state + occupancy | Optimal setpoint | <500ms | Auto-adjust for energy savings |
| Fault Predictor | Equipment run hours + alarms | Failure probability | <1s | Predictive maintenance scheduling |

### 8.4 Use Cases

| Use Case | Model | Trigger | Action |
|----------|-------|---------|--------|
| **Anomaly detection** (UC-SYS-04) | Anomaly Detector | Every telemetry cycle | If score > 0.8: create Alarm(HVAC_ANOMALY), SSE broadcast |
| **Load forecasting** | Load Forecaster | Every hour | Update 24h demand forecast, trigger DR pre-positioning |
| **Comfort optimization** | Comfort Optimizer | Every 15min | Adjust setpoints within ±1°C to minimize energy while maintaining comfort |
| **Fault prediction** | Fault Predictor | Daily (cron) | Pre-generate work orders for equipment likely to fail within 7 days |

> **Use case alignment:** UC-SYS-04 (ML anomaly score), UC-ENR-05 (demand response), UC-HVAC-05 (history analysis)
> **Testing alignment:** TESTING.md §3.5 (inference tests: score [0,1], 500ms timeout, graceful failure)

---

## 9. Deployment & Infrastructure

> **Use case alignment:** UC-SCHD-01 (cron jobs), UC-ALM-05 (alarm escalation)
> **Testing alignment:** TESTING.md §4.3 (CI workflow), §5 (coverage thresholds)

### 9.1 Environment

| Environment | Purpose | URL | Database |
|------------|---------|-----|----------|
| Development | Local dev | `localhost:3000` | SQLite (`file:./dev.db`) |
| Preview | PR review | `*.vercel.app` | SQLite (ephemeral, seeded) |
| Production | Live building | `bmc.vercel.app` | SQLite (persistent volume) or PostgreSQL (upgrade path) |

**Infrastructure:**
- **App:** Vercel (serverless functions, edge middleware, CDN)
- **Database:** SQLite (MVP) → PostgreSQL (production scale)
- **IoT Gateway:** Docker container on Raspberry Pi 4 (building LAN)
- **MQTT Broker:** Cloud-hosted (HiveMQ Cloud or self-hosted Mosquitto)
- **ML Models:** ONNX files served from Vercel edge functions

### 9.2 Scheduler (CRON jobs)

Defined in `vercel.json`:

| Schedule | Purpose | Endpoint |
|----------|---------|----------|
| `*/5 * * * *` | Materialized view refresh (energy aggregates) | `/api/cron/refresh-views` |
| `*/1 * * * *` | Stale alarm escalation (alarms open > N min → notify) | `/api/cron/escalate-alarms` |
| `0 0 * * *` | Daily energy rollup (kWh, cost, EUI calculation) | `/api/cron/daily-rollup` |
| `0 1 * * 1` | Weekly ML model retraining trigger | `/api/cron/retrain-models` |
| `0 0 1 * *` | Monthly audit log archival | `/api/cron/archive-logs` |

### 9.3 CI/CD

```yaml
# .github/workflows/test.yml
name: Test & Deploy
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:generate
      - run: pnpm test:coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: coverage, path: coverage/ }
  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
  deploy:
    needs: [test, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Pipeline gates:**
1. Unit + integration tests pass (vitest)
2. E2E tests pass (Playwright)
3. Coverage thresholds met (70% stmts, 60% branches)
4. Auto-deploy to Vercel on `main` branch merge

### 9.4 Monitoring

| Layer | Tool | Metric |
|-------|------|--------|
| App performance | Vercel Analytics | Response time, Web Vitals |
| Server errors | Vercel Logs | 5xx rate, Server Action failures |
| Database | Prisma metrics | Query duration, connection pool usage |
| IoT Gateway | Docker logs + healthcheck | Poll success rate, MQTT publish latency |
| ML inference | Custom metrics | Inference latency, model accuracy drift |
| Uptime | Vercel Healthchecks / UptimeRobot | Endpoint availability |

> **Use case alignment:** UC-SCHD-01 (cron jobs), UC-ALM-05 (alarm escalation)
> **Testing alignment:** TESTING.md §4.3 (CI workflow), §5 (coverage gates)

---

## 10. Key Design Decisions & Trade-offs

> **Use case alignment:** All decisions affect multiple use cases (see table)
> **Testing alignment:** TESTING.md §1 (TDD applies to all decisions)

| ID | Decision | Choice | Alternatives Considered | Rationale | Trade-off | USECASE Impact |
|----|----------|--------|------------------------|-----------|-----------|---------------|
| **D1** | **SSE vs WebSocket** | SSE (Server-Sent Events) | WebSocket, polling, GraphQL subscriptions | Server → client only (no bidirectional needed); auto-reconnect built into browser `EventSource`; HTTP/2 multiplexed; works through CDNs/proxies; no additional infrastructure | Cannot send data from client to server via SSE (use Server Actions instead); limited to text (JSON) | UC-STRM-01, UC-SYS-01 |
| **D2** | **Single database** | SQLite (MVP), PostgreSQL (production) | MongoDB, TimescaleDB, InfluxDB | Zero-ops for MVP; Prisma ORM provides type safety; relational model fits building hierarchy; SQLite sufficient for single-building MVP | Write throughput limits at scale; no built-in replication; SQLite WAL mode for concurrent reads | UC-SYS-01, UC-ENR-01 |
| **D3** | **Next.js as application framework** | Next.js 16 App Router | Remix, Express, Fastify, NestJS | React Server Components for zero-JS-default pages; Server Actions eliminate API layer for mutations; Vercel-native deployment; Edge Middleware for auth | Vercel lock-in risk; RSC learning curve; App Router is still evolving | UC-HVAC-01, UC-STRM-01 |
| **D4** | **Monorepo (single package) vs multi-package** | Single package (`bmc/`) | Turborepo monorepo, separate gateway repo | Simpler for MVP; single `pnpm` project; gateway is separate Python service anyway; fewer config files | Gateway code not colocated; shared types (telemetry schema) duplicated between TypeScript and Python | UC-SYS-01, UC-SYS-02 |

> **Use case alignment:** Decisions D1-D4 affect architecture across all modules
> **Testing alignment:** TESTING.md §1 (TDD for implementation of each decision)

---

## 11. Security Considerations

> **Use case alignment:** UC-AUTH-01 (authenticate), UC-AUTH-02 (authorize), UC-AUDIT-01 (audit log), UC-SEC-01 (door control), UC-SEC-08 (credential revocation)
> **Testing alignment:** TESTING.md §3.3 (auth matrix), §2.3 (Server Action validation)

### 11.1 Threat Model

| # | Threat | Severity | Attack Vector | Mitigation | Residual Risk |
|---|--------|----------|---------------|------------|---------------|
| T1 | **Unauthorized HVAC/lighting control** | Critical | Crafted Server Action with elevated role | `checkAccess(user, buildingId, minRole)` enforced on every action (§6.3); role hierarchy validated | Insider with operator+ role |
| T2 | **Token/session replay** | High | Stolen session cookie replayed from different IP | HttpOnly + SameSite:Lax cookies; 12h expiry; no JWT payload to decode in MVP | Physical device compromise |
| T3 | **BACnet protocol injection** | High | Rogue device on building LAN sends forged BACnet responses | Gateway validates device identity (device ID whitelist); MQTT payload signed with HMAC; anomaly detection flags unexpected values | Compromised gateway |
| T4 | **Sensor data spoofing** | High | Rogue sensor reports false temperature/pressure | Quality score tracking (quality < 50 → alert); cross-validation between redundant sensors; anomaly detection flags statistical outliers | Single-sensor zones |
| T5 | **Privilege escalation via role manipulation** | Critical | Modified session cookie with elevated role | Server-side session validation; `checkAccess` uses server-trusted role (not client-provided); role hierarchy enforced in code | Server-side vulnerability |
| T6 | **Mass assignment on Server Actions** | Medium | Extra FormData fields injected to modify unintended fields | Zod `.strict()` validation on all inputs; Server Actions only destructure expected fields | New fields added without validation |
| T7 | **SSE event injection** | Medium | Compromised server sends malicious SSE data | SSE events are server-generated only; client-side `JSON.parse` in try/catch; no `eval` on SSE data | XSS in rendering layer |
| T8 | **MQTT topic hijack** | High | Rogue client subscribes/publishes to BMC topics | MQTT topic ACL (per-device credentials); TLS encryption in transit; Sparkplug B payload validation | Broker compromise |
| T9 | **ReDoS in Zod validation** | Medium | Malicious input triggering catastrophic regex backtracking | Zod schemas use simple patterns (no nested quantifiers); input length limits; server-side validation only | Complex future schemas |
| T10 | **Audit log tampering** | Critical | DB compromise → delete/modify audit records | Append-only pattern (no UPDATE/DELETE on AuditLog); integrity hash chain (future); offsite backup; fail-closed on audit write failure | DB admin compromise |
| T11 | **Rate limit bypass** | Medium | Distributed requests across sessions/ IPs | Token bucket per-user (§11.4); IP-based fallback for unauthenticated endpoints; Vercel DDoS protection | Sophisticated distributed attack |
| T12 | **Session fixation** | Medium | Attacker sets session cookie before victim authenticates | New session ID generated on login; `HttpOnly` prevents XSS cookie read; `SameSite:Lax` prevents CSRF | Subdomain compromise |
| T13 | **CSRF on Server Actions** | Medium | Cross-site form submission to Server Action endpoint | Next.js auto-generates CSRF tokens for Server Actions; `SameSite:Lax` cookies; Origin header validation | Browser without SameSite support |

### 11.2 Security Requirements

1. **SR-01:** Every Server Action MUST call `checkAccess(user, buildingId, minRole)` before any database mutation.
2. **SR-02:** Every control action MUST write to `AuditLog` before returning success. If audit write fails, the action MUST be rolled back (fail-closed).
3. **SR-03:** Session cookies MUST be `HttpOnly` and `SameSite: Lax` (or `Strict` for high-security zones).
4. **SR-04:** All IoT telemetry MUST be validated against Zod schema before database insertion. Invalid telemetry MUST be rejected and logged.
5. **SR-05:** MQTT communication MUST use TLS encryption. Device credentials MUST be unique per device.
6. **SR-06:** SSE endpoints MUST validate session before streaming. Expired sessions MUST return 401.
7. **SR-07:** Input length limits MUST be enforced: setpoint (16-30°C), dim level (0-100), fan speed (enum), door state (enum).
8. **SR-08:** Rate limiting MUST be applied to all Server Actions (60 requests/min/user).
9. **SR-09:** BACnet/Modbus device whitelist MUST be maintained. Unknown devices MUST be rejected.
10. **SR-10:** Fire alarm override MUST require security role AND logged with elevated detail (who, when, why).
11. **SR-11:** Audit logs MUST NOT be deletable via application API. Only via cron archival job.
12. **SR-12:** ML model inputs MUST be sanitized. Inference MUST timeout at 500ms to prevent DoS.
13. **SR-13:** All secrets (database URL, MQTT credentials, API keys) MUST be stored in environment variables, never in code.

### 11.3 Audit Log Schema

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String   @default("system")    # Acting user or "system" for automated
  action     String   @default("")          # e.g., SET_SETPOINT, DOOR_LOCK, ALARM_ACK
  target     String   @default("")          # ID of affected entity (zoneId, doorId, alarmId)
  detail     String   @default("{}")        # JSON: { before, after, ... } for change tracking
  buildingId String   @default("")          # Building scope
  ip         String   @default("")          # Client IP (if available)
  userAgent  String   @default("")          # Client User-Agent
  createdAt  DateTime @default(now())       # Timestamp

  @@index([buildingId, createdAt])           # Query by building + time range
  @@index([userId, createdAt])              # Query by user activity
}
```

**Recorded actions:**

| Action Constant | Trigger | Detail Content |
|----------------|---------|---------------|
| `SET_SETPOINT` | `setTemperature` Server Action | `{ before: 22, after: 24 }` |
| `SET_FAN_SPEED` | `setFanSpeed` Server Action | `{ before: "AUTO", after: "HIGH" }` |
| `SET_HVAC_MODE` | `setHvacMode` Server Action | `{ before: "AUTO", after: "COOL" }` |
| `SET_DIM_LEVEL` | `setDimLevel` Server Action | `{ before: 100, after: 75 }` |
| `LIGHT_ON` | `toggleLight` Server Action | `{ before: "OFF", after: "ON" }` |
| `LIGHT_OFF` | `toggleLight` Server Action | `{ before: "ON", after: "OFF" }` |
| `DOOR_LOCK` | `setDoorState` Server Action | `{ doorName: "...", before: "UNLOCKED", after: "LOCKED" }` |
| `DOOR_UNLOCK` | `setDoorState` Server Action | `{ doorName: "...", before: "LOCKED", after: "UNLOCKED" }` |
| `ALARM_ACK` | `acknowledgeAlarm` Server Action | `{ alarmType: "...", severity: "...", comment: "..." }` |
| `ELEVATOR_RECALL` | `recallElevator` Server Action | `{ carName: "...", fromFloor: 3, toFloor: 0 }` |
| `ELEVATOR_CLEAR_RECALL` | `clearElevatorRecall` Server Action | `{ carName: "..." }` |
| `FIRE_ALARM_CLEAR` | `clearFireAlarm` Server Action | `{ panelName: "...", fromState: "ALARM", comment: "..." }` |

> **Use case alignment:** UC-AUDIT-01 (log every control action)
> **Testing alignment:** TESTING.md §2.3 (verify auditLog.create called with correct args)

### 11.4 Rate Limiting Implementation

Rate limiting protects Server Actions from abuse and DDoS vectors.

**Algorithm:** Token bucket per user.

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Capacity | 60 tokens | 60 actions/min max burst |
| Refill rate | 1 token/second | Sustained 60 actions/min |
| Key | `userId` (from session) | Per-user fairness |
| Storage | Redis (production) / Map (MVP) | Distributed counter for multi-instance |

**TypeScript Implementation:**

```typescript
// lib/rateLimit.ts

interface TokenBucket {
  tokens: number
  lastRefill: number
}

const buckets = new Map<string, TokenBucket>()

const CAPACITY = 60          // max burst
const REFILL_RATE = 1        // tokens per second
const INTERVAL_MS = 1000     // refill interval

function refill(bucket: TokenBucket): TokenBucket {
  const now = Date.now()
  const elapsed = (now - bucket.lastRefill) / INTERVAL_MS
  const newTokens = Math.min(CAPACITY, bucket.tokens + elapsed * REFILL_RATE)
  return { tokens: newTokens, lastRefill: now }
}

export function checkRateLimit(userId: string): {
  allowed: boolean
  remaining: number
  retryAfterMs: number
} {
  const bucket = buckets.get(userId) ?? { tokens: CAPACITY, lastRefill: Date.now() }
  const updated = refill(bucket)

  if (updated.tokens >= 1) {
    updated.tokens -= 1
    buckets.set(userId, updated)
    return {
      allowed: true,
      remaining: Math.floor(updated.tokens),
      retryAfterMs: 0,
    }
  }

  // Calculate when next token will be available
  const retryAfterMs = Math.ceil((1 - updated.tokens) * INTERVAL_MS)
  buckets.set(userId, updated)
  return {
    allowed: false,
    remaining: 0,
    retryAfterMs,
  }
}
```

**Integration in Server Actions:**

```typescript
// In any Server Action, after getSession():
import { checkRateLimit } from '@/lib/rateLimit'

const rateCheck = checkRateLimit(session!.user.id)
if (!rateCheck.allowed) {
  return {
    error: 'Rate limit exceeded. Try again later.',
    status: 429,
    retryAfterMs: rateCheck.retryAfterMs,
  }
}
```

**Response headers (for API routes):**

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1718980860
```

**429 Response Specification:**

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Maximum 60 requests per minute.",
  "retryAfterMs": 12000
}
```

| Header | Value | Description |
|--------|-------|-------------|
| `Status` | `429 Too Many Requests` | Standard rate limit response |
| `Retry-After` | `<seconds>` | HTTP standard header for retry delay |
| `X-RateLimit-Limit` | `60` | Max requests per window |
| `X-RateLimit-Remaining` | `0` | Remaining requests in current window |
| `X-RateLimit-Reset` | `<unix timestamp>` | When the window resets |

**Production upgrade path:** Replace in-memory `Map` with Redis `INCR` + `EXPIRE` for distributed rate limiting across Vercel serverless instances:

```typescript
// lib/rateLimitRedis.ts (production)
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function checkRateLimitRedis(userId: string) {
  const key = `ratelimit:${userId}`
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - 60

  // Sliding window: remove old entries, count current
  await redis.zremrangebyscore(key, 0, windowStart)
  const count = await redis.zcard(key)

  if (count >= 60) {
    const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES')
    const retryAfterMs = oldest.length > 1
      ? (parseInt(oldest[1]) + 60 - now) * 1000
      : 60000
    return { allowed: false, remaining: 0, retryAfterMs }
  }

  await redis.zadd(key, now.toString(), `${now}:${Math.random()}`)
  await redis.expire(key, 61)  // auto-cleanup
  return { allowed: true, remaining: 60 - count - 1, retryAfterMs: 0 }
}
```

> **Use case alignment:** UC-AUTH-02 (rate limit protects authorization), UC-AUDIT-01 (rate limit bypass logged)
> **Testing alignment:** TESTING.md §2.3 (rate limit integration in Server Action tests)

---

## 12. Monitoring & Observability

> **Use case alignment:** UC-ALM-04 (alarm thresholds), UC-ALM-05 (escalation), UC-SCHD-01 (cron monitoring)
> **Testing alignment:** TESTING.md §5 (coverage as quality signal), §10 (verification checklist)

### 12.1 Metrics

| Category | Metric | Source | Threshold |
|----------|--------|--------|-----------|
| **Availability** | Uptime % | Vercel Healthchecks | < 99.9% → alert |
| **Performance** | API response time (p95) | Vercel Analytics | > 500ms → warning |
| **Performance** | SSE connection count/building | Application metrics | > 500 → scaling alert |
| **Performance** | ML inference latency (p95) | Custom timer | > 500ms → alert |
| **Data Quality** | Sensor quality score avg | Sensor.quality field | < 80 → warning; < 50 → critical |
| **Data Freshness** | Time since last telemetry | Sensor.timestamp | > 60s → gateway alert |
| **Errors** | 5xx rate per endpoint | Vercel Logs | > 1% → alert |
| **Errors** | Server Action failure rate | AuditLog (no success) | > 5% → alert |
| **IoT** | MQTT publish latency | Gateway metrics | > 2s → warning |
| **IoT** | BACnet poll success rate | Gateway metrics | < 95% → device alert |
| **Security** | Failed auth attempts / hour | Login endpoint logs | > 10 → alert |
| **Security** | Rate limit hits / hour | Rate limiter counters | > 100 → investigate |
| **Business** | Active alarms count | Alarm table | > 20 → escalation |
| **Business** | Energy consumption (kW) | Meter table | > threshold → demand response |

### 12.2 Alerting

| Alert | Condition | Severity | Channel | Escalation |
|-------|-----------|----------|---------|------------|
| Gateway offline | No telemetry for > 60s | Critical | PagerDuty | → Facility Manager after 5min |
| High alarm count | > 20 open alarms | Critical | Slack #bmc-alerts | → Security Officer |
| Sensor quality degraded | Avg quality < 50 | Warning | Slack #bmc-data | → Technician after 1hr |
| DB write failure | Server Action audit log fail | Critical | PagerDuty | → System Admin |
| Rate limit abuse | > 100 hits/hour | Warning | Slack #bmc-security | → Security Officer |
| ML inference timeout | p95 > 500ms | Warning | Slack #bmc-ml | → Data team after 1hr |
| Stale alarm | Open alarm > N minutes | Info → Warning | Auto-escalation (cron) | → Facility Manager (UC-ALM-05) |
| Lab temp excursion | BIO-01 threshold breach | Critical | PagerDuty + SMS | → Medical Officer immediately |
| Medical gas drop | BIO-02 pressure < 45 psi | Critical | PagerDuty + SMS | → Medical Officer + Facility Manager |

### 12.3 Logging

| Log Type | Format | Destination | Retention |
|----------|--------|-------------|-----------|
| Application logs | JSON structured | Vercel Logs | 7 days |
| Server Action audit | AuditLog table (Prisma) | SQLite/PostgreSQL | 2 years |
| Gateway logs | Docker stdout/stderr | Docker log driver + syslog | 30 days |
| MQTT message log | JSON on debug topics | MQTT retained messages | 24 hours |
| Error traces | Stack traces + context | Vercel Error Tracking | 30 days |
| Security events | Auth failures, rate limits | Dedicated security log | 1 year |

**Log levels:**

| Level | Usage | Example |
|-------|-------|---------|
| `ERROR` | System failures, data loss risk | DB write failure, MQTT disconnect |
| `WARN` | Degraded operation, needs attention | Sensor quality < 80, stale alarm |
| `INFO` | Normal operational events | Server Action executed, SSE connection opened |
| `DEBUG` | Development/troubleshooting | Telemetry message received, cache invalidation |

**Structured log format:**

```json
{
  "timestamp": "2026-06-21T10:30:00Z",
  "level": "INFO",
  "service": "bmc-app",
  "action": "SET_SETPOINT",
  "userId": "demo-user",
  "buildingId": "b1",
  "zoneId": "z1",
  "detail": { "before": 22, "after": 24 },
  "duration_ms": 45,
  "requestId": "req_abc123"
}
```

> **Use case alignment:** UC-ALM-04 (alarm threshold config), UC-ALM-05 (stale alarm escalation via cron), UC-BIO-01/02 (lab monitoring alerts)
> **Testing alignment:** TESTING.md §5 (monitoring coverage), §10 (verification checklist includes log assertions)

---

*Document generated from codebase analysis. Maintain as living document — update with every architectural decision.*
