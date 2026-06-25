# BMC — Building Management Control

## Overview

Recreation of an operational technology monitoring system using agentic AI workflows. Originally built with traditional methods, this version leverages hermes.ai as coding agent, impecabble.style for guiding UI component generation, and graphify for codebase reasoning to achieve faster, more consistent backlog-to-code translation.

Real-time building monitoring and control system covering HVAC, lighting, security, energy, alarms, fire safety, and elevators. Server-first Next.js App Router with SSE streaming, Prisma ORM, and a Python BACnet/Modbus gateway for IoT device integration.

## Architecture

```
┌─────────────┐     ┌──────────┐     ┌──────────────────┐
│   Client    │────▶│   Edge   │────▶│   Application    │
│  (Browser)  │ SSE │ (Vercel) │     │ (Next.js 16 RSC)  │
└─────────────┘     └──────────┘     └────────┬─────────┘
                                            │
                                   ┌─────────▼─────────┐
                                   │   Data Layer      │
                                   │ (Prisma + SQLite) │
                                   └─────────┬─────────┘
                                            │
                                   ┌─────────▼─────────┐
                                   │   IoT Gateway     │
                                   │ (Python/Docker)   │
                                   └─────────┬─────────┘
                                            │
                                   ┌─────────▼─────────┐
                                   │   Devices         │
                                   │ BACnet/IP, Modbus │
                                   └───────────────────┘
```

## Features

| Module | Capabilities | Use Cases |
|--------|-------------|-----------|
| **HVAC** | Setpoint (16-30°C), fan speed, mode switching, AHU monitoring | UC-HVAC-01 through UC-HVAC-07 |
| **Lighting** | Dimming (0-100%), on/off, scene activation | UC-LGT-01 through UC-LGT-05 |
| **Security** | Door lock/unlock, alarm feed, acknowledge, credential mgmt | UC-SEC-01 through UC-SEC-08 |
| **Energy** | Real-time kW, cumulative kWh, EUI trend, demand response | UC-ENR-01 through UC-ENR-06 |
| **Alarms** | Active list, history search, thresholds, escalation | UC-ALM-01 through UC-ALM-05 |
| **Fire Safety** | Panel status, device states, alarm override | UC-FIR-01 through UC-FIR-03 |
| **Elevators** | Position/direction/door status, floor recall | UC-FIR-04 through UC-FIR-06 |
| **Biomedical** | Lab cold storage, medical gas, HEPA, VOC, cleanroom | UC-BIO-01 through UC-BIO-06 |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind v4 |
| Backend | Server Actions, API Routes, Edge Middleware |
| Database | Prisma ORM, SQLite |
| Real-Time | SSE (EventSource), React.cache |
| IoT | Python gateway, BACnet/IP, Modbus RTU/TCP, MQTT |
| ML | ONNX Runtime, anomaly detection, forecasting |
| Testing | Vitest, Testing Library, Playwright |
| Deployment | Vercel |

## Development

```bash
# Install
pnpm install

# DB setup
pnpm db:generate
pnpm db:push
pnpm db:seed

# Dev server
pnpm dev  # http://localhost:3000
```

## Testing (TDD Required)

```bash
pnpm test           # Run all tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # Coverage report
pnpm test:e2e       # Playwright E2E
```

Coverage floors (TESTING.md §5):
- Statements: 70%
- Branches: 60%
- Functions: 70%
- Lines: 70%

## Documentation

| Document | Purpose |
|----------|---------|
| [DESIGN.md](./DESIGN.md) | Architecture decisions, data model, API design, real-time pipeline |
| [USECASE.md](./USECASE.md) | Requirements, actors, use case catalog, workflows |
| [TESTING.md](./TESTING.md) | TDD workflow, test patterns, coverage requirements |
| [AGENTS.md](./AGENTS.md) | Operational rules, TDD enforcement, project structure |

These four documents (FOUR.md) are cross-referenced and authoritative.

## Project Structure

```
bmc/
├── app/
│   ├── (dashboard)/          # Route groups
│   │   ├── building/         # HVAC, lighting, security pages
│   │   ├── elevators/        # Elevator control
│   │   ├── fire/             # Fire safety
│   │   ├── alarms/           # Alarm management
│   │   └── energy/           # Energy analytics
│   ├── api/                  # REST + SSE endpoints
│   ├── components/ui/        # Shared primitives (stat-card, data-table, status-led)
│   ├── lib/                  # actions.ts, auth.ts, prisma.ts, useSSE.ts
│   └── __tests__/            # Test setup, factories
├── prisma/
│   └── schema.prisma         # 12 entity models
├── e2e/                      # Playwright tests
└── FOUR.md alias             # DESIGN + TESTING + USECASE + AGENTS
```

## Key Patterns

- **Server-first**: Components are RSC by default; `'use client'` only for SSE, sliders, toggles
- **Streaming**: No polling — SSE via `/api/stream/building/[id]`
- **Server Actions**: All mutations use Zod validation + `checkAccess` + audit logging
- **Graphify**: Use `graphify query` and `graphify path` before architectural reasoning

## Certification Targets

- ISO 50001 (Energy Management)
- ISO 27001 (Information Security)
- WELL Building Standard

## License

MIT
