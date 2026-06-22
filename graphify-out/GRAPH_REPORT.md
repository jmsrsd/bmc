# Graph Report - bmc  (2026-06-22)

## Corpus Check
- 62 files · ~35,326 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 411 nodes · 480 edges · 42 communities (28 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `82dd0b3f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]

## God Nodes (most connected - your core abstractions)
1. `getSession()` - 31 edges
2. `compilerOptions` - 16 edges
3. `BMC — Design Document` - 14 edges
4. `checkAccess()` - 13 edges
5. `BMC — Testing Strategy` - 13 edges
6. `scripts` - 12 edges
7. `Agent Rules (sorted by precedence)` - 12 edges
8. `6. Failure & Edge-Case Scenarios` - 8 edges
9. `4. Real-Time Pipeline` - 7 edges
10. `paths` - 6 edges

## Surprising Connections (you probably didn't know these)
- `AlarmsPage()` --calls--> `getSession()`  [EXTRACTED]
  app/(routes)/alarms/page.tsx → lib/auth.ts
- `BuildingOverviewPage()` --calls--> `getSession()`  [EXTRACTED]
  app/(routes)/building/page.tsx → lib/auth.ts
- `FirePage()` --calls--> `getSession()`  [EXTRACTED]
  app/(routes)/fire/page.tsx → lib/auth.ts
- `DashboardPage()` --calls--> `getSession()`  [EXTRACTED]
  app/page.tsx → lib/auth.ts
- `HVACPage()` --calls--> `getSession()`  [EXTRACTED]
  app/(routes)/building/hvac/page.tsx → lib/auth.ts

## Import Cycles
- None detected.

## Communities (42 total, 14 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (31): ElevatorClearRecallButton(), ElevatorRecallForm(), carStateBadge, ElevatorsPage(), metadata, HVACPage(), metadata, PageProps (+23 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (47): 10. Key Design Decisions & Trade-offs, 11.1 Threat Model, 11.2 Security Requirements, 11.3 Audit Log Schema, 11.4 Rate Limiting Implementation, 11. Security Considerations, 12.1 Metrics, 12.2 Alerting (+39 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (34): 10. Verification Checklist, 1. TDD as Compulsory Practice, 2.1 Unit Tests — Pure Functions (Vitest), 2.2 Component Tests (Vitest + Testing Library), 2.3 Server Action Tests (Vitest), 2.4 API Route & SSE Tests (Supertest + Dev Server), 2.5 E2E Tests (Playwright), 2. Test Pyramid (+26 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (28): dependencies, class-variance-authority, clsx, lucide-react, next, @prisma/client, react, react-dom (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (22): clearSessionCookie(), createDemoUser(), createSessionCookie(), Session, verifyPassword(), AlarmSeverity, AlarmStatus, DoorState (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (23): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (21): devDependencies, autoprefixer, eslint, eslint-config-next, jsdom, msw, postcss, prisma (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (17): 0. TDD is compulsory — never write code without a failing test first, 10. Key commands, 1. Always consult DESIGN.md before making architecture decisions, 2. Always consult USECASE.md before adding features, 3. Server-first rendering, 4. Streaming, not polling, 5. No global state library, 6. Validate on every mutation (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (6): DashboardPage(), metadata, QuickActionCardProps, StatCardProps, AlarmAckForm(), AlarmAckFormProps

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (11): 1. `prisma/seed.ts` — Full rewrite, 2. `DESIGN.md` §1 — Update context, 3. `USECASE.md` — Add biomedical use cases, 4. UI metadata — Building name references, 5. `lib/types.ts` — Add ZoneType entries, BMC Revision Plan — Biomedical Campus Data Alignment, Execution Steps, Files NOT modified (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.20
Nodes (8): AcknowledgeButton(), AlarmsPage(), metadata, SearchParams, severityBadge, severityBorder, statusBadge, statusFilters

### Community 11 - "Community 11"
Cohesion: 0.27
Nodes (8): BuildingOverviewPage(), findSensor(), hvacStatusColor(), hvacStatusLabel(), metadata, StatCardProps, ZoneCard(), ZoneWithRelations

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (8): FireClearForm(), deviceIcons, deviceStateBadge, deviceTypeLabel, FirePage(), metadata, stateBadge, stateBorder

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (8): 6.1 Network Partition Scenarios, 6.2 Concurrent Modification Scenarios, 6.3 Rate Limiting & Throttling Scenarios, 6.4 Session & Auth Failure Scenarios, 6.5 IoT Device Failure Scenarios, 6.6 ML Inference Failure Scenarios, 6.7 Audit & Compliance Failure Scenarios, 6. Failure & Edge-Case Scenarios

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (4): inter, metadata, Navigation(), navLinks

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (7): 4.1 Data Flow, 4.2 Edge Processing, 4.3 Stream Distribution, 4.4 Reconnection Strategy, 4.5 Backpressure & Throttling, 4.6 SSE Chaos Testing Scenarios, 4. Real-Time Pipeline

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (6): EnergyPage(), getMeters(), metadata, meterBarColors, meterColors, meterIcons

### Community 17 - "Community 17"
Cohesion: 0.48
Nodes (5): main(), prisma, r(), ri(), rng

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (4): getActions(), mockPrisma, mockRevalidatePath, mockSession

## Knowledge Gaps
- **228 isolated node(s):** `type`, `ErrorProps`, `metadata`, `SearchParams`, `severityBorder` (+223 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSession()` connect `Community 0` to `Community 4`, `Community 8`, `Community 10`, `Community 11`, `Community 12`, `Community 16`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `BMC — Design Document` connect `Community 1` to `Community 15`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 6` to `Community 3`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `type`, `ErrorProps`, `metadata` to the rest of the system?**
  _228 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07529411764705882 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._