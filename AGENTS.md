[UPDATED 2026-06-23]
# AGENTS.md (web-validated 2026-06-23)

> **Architecture Authority:** `DESIGN.md` (12 sections, 2 appendices)
> **Testing Mandate:** `TESTING.md` (10 sections, 2 appendices — TDD compulsory, checklist at §10)
> **Use Case Authority:** `USECASE.md` (40 requirements, 37 use cases, 8 actors, critical flows)
> **Stack:** Next.js 15 App Router + Prisma + Tailwind + Vercel
> **Alias:** These four docs are referred to as `FOUR.md`

---

## Global Directives

### D1. Use web search when authoring or updating FOUR.md

ANY agent modifying AGENTS.md, DESIGN.md, TESTING.md, or USECASE.md (alias: FOUR.md) MUST use web search to validate that all referenced library APIs, framework patterns, protocol specs, and best practices are current. Do not rely solely on internal training data — it is stale. Web search for:

- Next.js App Router patterns, RSC, Server Actions — `site:nextjs.org/docs app router`
- Prisma schema conventions, provider config, migration commands — `site:prisma.io/docs`
- Vitest + Testing Library API — `site:vitest.dev`, `site:testing-library.com/docs`
- Playwright test patterns — `site:playwright.dev/docs`
- BACnet/Modbus/MQTT protocol specs
- Vercel deployment + cron config — `site:vercel.com/docs`
- Tailwind v4 utility patterns — `site:tailwindcss.com/docs`
- Zod validation schemas — `site:zod.dev`
- ONNX Runtime Node.js API — `site:onnxruntime.ai/docs`

When a section references a specific library version or API call, verify the call signature still matches current docs. Append "(web-validated YYYY-MM-DD)" to the document header after doing so.

### D2. Use Graphify for codebase reasoning

Before executing any reasoning, mapping, or architectural analysis, you MUST load the `graphify` skill.

- `/graphify` → load skill.
- `graphify query "<question>"` → use for all general codebase questions.
- `graphify path "<A>" "<B>"` → use to trace relationships between components/files.
- `graphify explain "<concept>"` → use for deep-dives into specific implementation concepts.
- `graphify update .` → run after any code changes to keep the graph current.

Dirty graph files are NOT a reason to skip graphify. Only skip if the task is specifically about fixing stale graph output or the user explicitly says not to use it.


---

## Agent Rules (sorted by precedence)

### 0. TDD is compulsory — never write code without a failing test first

See TESTING.md §1 (Iron Law) and §6 (Workflow). Every feature, bug fix, and refactor follows RED-GREEN-REFACTOR. Before dispatching subagents, read TESTING.md §6.3 for the TDD-enforcing delegation template.

All test imports use `@/` path alias: `vi.mock('@/lib/prisma', ...)` — matches vitest.config.ts `resolve.alias` and tsconfig `paths`. See TESTING.md §2.3 for the correct pattern.

### 1. Always consult DESIGN.md before making architecture decisions

DESIGN.md covers: system context (§1), data model (§2), API design (§3), real-time pipeline (§4), IoT integration (§5), auth (§6), frontend architecture (§7), AI/ML (§8), deployment (§9), key decisions with trade-off tables (§10), security (§11), monitoring (§12).

If DESIGN.md says X and you think Y, follow X. If X doesn't cover your case, update DESIGN.md.

### 2. Always consult USECASE.md before adding features

USECASE.md defines 40 requirements (P0/P1/P2) across 8 modules: HVAC, Lighting, Security, Energy, Alarms, Fire Safety, Elevators. Each requirement has a target metric and maps to one or more use cases with actor workflows, preconditions, and postconditions.

Do not implement P2 before P0. Do not add features not listed without explicit user approval. See USECASE.md Appendix B for the priority breakdown (15 P0, 17 P1, 8 P2).

### 3. Server-first rendering

- Pages are Server Components by default
- `'use client'` only for: SSE subscriptions (useSSE), sliders/toggles, real-time gauges, form inputs
- Server Actions for all mutations (setpoint, lock/unlock, scene activation)
- Edge middleware only for auth checks + redirects
- **Design authority:** DESIGN.md §1.2 (architectural philosophy), §7.1 (component tree)
- **Testing authority:** TESTING.md §2.2 (component tests), §2.1 (pure function tests)
- **Use case alignment:** UC-HVAC-01 (setpoint), UC-SEC-01 (lock/unlock), UC-LGT-01 (dimming)

### 4. Streaming, not polling

All live data arrives via SSE (Server-Sent Events). No polling on any dashboard.
- **Design authority:** DESIGN.md §1.2, §4.1-4.5 (data flow, reconnection, backpressure)
- **Testing authority:** TESTING.md §3.1 (SSE hook tests with mock EventSource)
- **Use case alignment:** UC-STRM-01 (subscribe to telemetry stream), UC-SYS-01 (ingest)

### 5. No global state library

Each Client Component manages its own SSE subscription via `useSSE` hook from `@/lib/useSSE`. No Redux/Zustand/Jotai.
- **Design authority:** DESIGN.md §7.2 (state management table), §7.3 (useSSE implementation)
- **Testing authority:** TESTING.md §3.1 (connection lifecycle, message parsing, cleanup on unmount)
- **Use case alignment:** UC-STRM-01 (SSE subscription lifecycle)

### 6. Validate on every mutation

- Input: Zod schema with `.strict()` on all Server Actions
- Auth: `checkAccess(user, buildingId, minRole)` on every action — UC-AUTH-02
- Audit log: every control action logged — UC-AUDIT-01 (see DESIGN.md §11.3)
- **Design authority:** DESIGN.md §3.4 (Server Action pattern), §6.3 (checkAccess), §11.1 (threat model)
- **Testing authority:** TESTING.md §2.3 (mock Prisma + auth, verify updateMany + auditLog.create), §3.3 (auth matrix)
- **Use case alignment:** UC-AUTH-02 (authorize), UC-AUDIT-01 (log action)

### 7. IoT protocol decisions

All device integration through the protocol abstraction layer. BACnet/IP for commercial HVAC, Modbus for legacy power/lighting, MQTT Sparkplug B for IoT-native devices. Gateway runs on building LAN (Python, Docker/RPi4).
- **Design authority:** DESIGN.md §5.1-5.4 (gateway architecture, protocols, offline resilience)
- **Testing authority:** TESTING.md §3.2 (telemetry message schema), §3.4 (gateway Python tests)
- **Use case alignment:** UC-SYS-01 (ingest), UC-SYS-02 (write setpoint to BACnet), UC-SYS-05/06 (buffer/replay)

### 8. Project structure

```
bmc/
├── app/
│   ├── (routes)/                  # Route groups (building, analytics, settings)
│   │   └── building/dashboard/    # Smart Dashboard page (SDUI-powered)
│   ├── api/
│   │   ├── buildings/[id]/ui-config/  # SDUI: GET UiConfigResponse (ETag, version)
│   │   │   └── __tests__/             # 4 API tests
│   │   └── ...                     # Other REST endpoints + SSE streams
│   ├── components/
│   │   ├── dynamic/                # SDUI: dynamic widget renderer
│   │   │   ├── DashboardGrid.tsx       # Server Component: calls buildUiConfig, version gates
│   │   │   ├── DashboardClient.tsx     # Client Component: orchestrates widgets + SSE
│   │   │   ├── SDUIRenderer.tsx        # Dispatches WidgetConfig to registered widget
│   │   │   ├── UnknownWidget.tsx       # Fallback for unknown widget types
│   │   │   └── widgets/               # Widget registry (widgetRegistry map)
│   │   │       ├── index.ts
│   │   │       ├── HvacCard.tsx
│   │   │       ├── LightingCard.tsx
│   │   │       ├── DoorCard.tsx
│   │   │       ├── SensorReadout.tsx
│   │   │       ├── AlarmList.tsx
│   │   │       ├── MeterGauge.tsx
│   │   │       └── FirePanelCard.tsx
│   │   └── ui/                    # Shared UI primitives
│   ├── hooks/                     # Custom React hooks
│   │   ├── useWidgetSSE.ts            # Widget-specific SSE (wraps useSSE)
│   │   └── __tests__/
│   │       └── useWidgetSSE.test.ts   # 10 tests
│   ├── lib/                       # Utilities, Server Actions, hooks, auth, inference
│   │   ├── ui-config/                 # SDUI: config layer
│   │   │   ├── types.ts               # UiConfigResponse, WidgetConfig, SensorField, NavLink
│   │   │   ├── schema.ts              # Zod schemas (WidgetCapabilitySchema, WidgetConfigSchema, UiConfigResponseSchema)
│   │   │   ├── service.ts             # buildUiConfig(buildingId) — DB introspection → widget configs
│   │   │   └── __tests__/
│   │   │       ├── schema.test.ts      # 18 tests
│   │   │       └── service.test.ts     # 10 tests
│   │   ├── prisma.ts              # Prisma singleton
│   │   ├── actions.ts             # Server Actions (DESIGN.md §3.4)
│   │   ├── useSSE.ts              # Real-time hook (DESIGN.md §7.3)
│   │   ├── auth.ts                # checkAccess (DESIGN.md §6.3)
│   │   └── inference.ts           # ML inference (DESIGN.md §8.4)
│   ├── __tests__/
│   │   ├── setup.ts               # jest-dom, auto cleanup
│   │   └── helpers.ts             # Test factories (TESTING.md §8.1)
│   └── globals.css
├── prisma/
│   └── schema.prisma              # DESIGN.md §2.2
├── e2e/                           # Playwright tests (TESTING.md §2.5)
├── public/
├── DESIGN.md                      # Architecture design document
├── USECASE.md                     # Requirements, actors, scenarios, flows
├── TESTING.md                     # Testing strategy (TDD compulsory)
├── AGENTS.md                      # This file
├── vitest.config.ts               # TESTING.md §4
├── playwright.config.ts
├── vercel.json
├── next.config.ts
└── package.json
```

**SDUI cumulative test count:** 95 tests, 0 failures (lib/ui-config: 28, app/api/ui-config: 4, app/hooks: 10, existing: 53).

### 9. Before modifying existing code

1. Check AGENTS.md for operational rules
2. Check USECASE.md for intended actor workflows, scenario preconditions, and priority (P0 > P1 > P2)
3. Check TESTING.md §10 (verification checklist) — add or update tests BEFORE changing behavior
4. Check TESTING.md §5 (coverage thresholds) — your changes must not drop coverage
5. Check DESIGN.md for architecture intent
6. If adding a feature not in USECASE.md, or changing an existing UC flow, flag for user approval

### 10. Key commands

```bash
pnpm dev              # Dev server (port 3000)
pnpm build            # Production build
pnpm db:generate      # Prisma client generation
pnpm db:push          # Push schema to DB
pnpm db:seed          # Seed data
npx prisma studio     # Data browser
pnpm test             # vitest run (all unit + integration)
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report
pnpm test:e2e         # Playwright E2E
pnpm test:all         # vitest + playwright
```

---

## Quick Reference

| Decision | Choice | DESIGN Authority | TESTING Authority | USECASE Authority |
|----------|--------|-----------------|-------------------|-------------------|
| TDD practice | RED-GREEN-REFACTOR, compulsory | — | §1 | — |
| Test framework | Vitest + Testing Library + Playwright | — | §2 | — |
| Server Action tests | Direct invocation, mock Prisma with `@/` alias | §3.4 | §2.3 | UC-HVAC-01 |
| Component tests | Behavior assertions (no snapshots) | §7.1 | §2.2 | UC-HVAC-01, UC-LGT-01 |
| SSE hook tests | Mock EventSource global | §7.3 | §3.1 | UC-STRM-01 |
| Auth matrix tests | 7 role combos + building scope | §6.2, §6.3 | §3.3 | UC-AUTH-02 |
| Telemetry schema | Zod: buildingId, value range, quality 0-100 | §4.1, §4.2 | §3.2 | UC-SYS-01 |
| Coverage floor | 70% stmts, 60% branches | — | §5 | — |
| Data fetching | Server Components + React.cache | §1.2, §7.2 | — | — |
| Real-time | SSE (not WebSocket by default) | §4, §10 D1 | §3.1 | UC-STRM-01 |
| Mutations | Server Actions + Zod + audit | §3.4 | §2.3 | UC-AUTH-02, UC-AUDIT-01 |
| ORM | Prisma (cuid) | §2.3, §10 D3 | §8.2 | — |
| Auth | NextAuth + JWT (Edge-readable) | §6 | §3.3 | UC-AUTH-01, UC-AUTH-02 |
| IoT gateway | Python service, MQTT to cloud | §5, §9.4 | §3.2, §3.4 | UC-SYS-01/02/05/06 |
| ML inference | ONNX Runtime (Node.js) | §8.4 | §3.5 | UC-SYS-04 |
| Verification gate | Checklist before marking complete | — | §10 | — |
| Web-validate FOUR.md | Search current API docs before authoring | D1 | D1 | D1 |
| **SDUI config types** | **Zod-validated UiConfigResponse, DB introspection per zone** | **—** | **lib/ui-config/__tests__/schema.test.ts, service.test.ts** | **—** |
| **SDUI widget dispatch** | **Server Component resolves config, Client renders via widgetRegistry** | **—** | **—** | **—** |
| **SDUI dashboard grid** | **DashboardGrid (SC) + DashboardClient (CC) + version gates** | **—** | **—** | **—** |
| **SDUI widget SSE** | **useWidgetSSE wraps useSSE, dispatches per-widget type** | **—** | **app/hooks/__tests__/useWidgetSSE.test.ts** | **UC-STRM-01** |
| **SDUI API endpoint** | **GET /api/buildings/[id]/ui-config with ETag + version header** | **—** | **app/api/buildings/[id]/__tests__/ui-config.test.ts** | **—** |

---

## DESIGN → USECASE → TEST Map

Every DESIGN.md section maps through USECASE.md to TESTING.md:

| DESIGN.md | USECASE.md | TESTING.md |
|-----------|------------|------------|
| §2 Data Model | §2.1-2.8 (Requirements tables) | §8.1 (factories), §8.2 (SQLite DB) |
| §2.3 Design Notes | — | §8.1 (factories aligned to schema) |
| §3.2 URL Schema | — | §2.4 (API route tests) |
| §3.3 SSE Format | UC-STRM-01 | §3.1 (SSE hook tests) |
| §3.4 Server Actions | UC-HVAC-01, UC-SEC-01 | §2.3 (Server Action tests) |
| §4 Real-Time Pipeline | UC-SYS-01 | §3.2 (telemetry schema tests) |
| §5 IoT Gateway | UC-SYS-01/05/06 | §3.4 (gateway Python tests) |
| §6 Auth & AuthZ | UC-AUTH-01/02, UC-SEC-08 | §3.3 (auth matrix tests) |
| §7 Frontend | UC-HVAC-01, UC-LGT-01, UC-STRM-01 | §2.2 (component tests) |
| §8 ML Pipeline | UC-SYS-04 | §3.5 (inference tests) |
| §9 Deployment | UC-ALM-05 (cron) | §4.3 (CI workflow) |
| §11 Security | UC-AUTH-02, UC-AUDIT-01 | §2.3, §3.3 |
| **§? SDUI Config API** | **—** | **lib/ui-config/__tests__/schema.test.ts (18), service.test.ts (10)** |
| **§? SDUI API Route** | **—** | **app/api/buildings/[id]/__tests__/ui-config.test.ts (4)** |
| **§? SDUI Widget Renderer** | **UC-STRM-01 (widget SSE)** | **app/hooks/__tests__/useWidgetSSE.test.ts (10)** |
| **§? SDUI Dashboard** | **—** | **—** |
