# Graph Report - .  (2026-06-26)

## Corpus Check
- Corpus is ~37,239 words - fits in a single context window. You may not need a graph.

## Summary
- 375 nodes · 474 edges · 54 communities (29 shown, 25 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_UI Loading & Energy Components|UI Loading & Energy Components]]
- [[_COMMUNITY_Alarms UI & Actions|Alarms UI & Actions]]
- [[_COMMUNITY_Auth System|Auth System]]
- [[_COMMUNITY_Mock Data Layer|Mock Data Layer]]
- [[_COMMUNITY_TSConfig Config|TSConfig Config]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Fire Safety UI|Fire Safety UI]]
- [[_COMMUNITY_HVAC Controls & Actions|HVAC Controls & Actions]]
- [[_COMMUNITY_Dev Dependencies|Dev Dependencies]]
- [[_COMMUNITY_Elevator UI|Elevator UI]]
- [[_COMMUNITY_Mobile Nav & Dashboard Layout|Mobile Nav & Dashboard Layout]]
- [[_COMMUNITY_Building API Routes|Building API Routes]]
- [[_COMMUNITY_Auth Middleware|Auth Middleware]]
- [[_COMMUNITY_Server Action Tests|Server Action Tests]]
- [[_COMMUNITY_IoT Architecture|IoT Architecture]]
- [[_COMMUNITY_TDD & Testing Strategy|TDD & Testing Strategy]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_Temperature Utils|Temperature Utils]]
- [[_COMMUNITY_Screenshot Scripts|Screenshot Scripts]]
- [[_COMMUNITY_AGENTS.md Directives|AGENTS.md Directives]]
- [[_COMMUNITY_Auth Validation|Auth Validation]]
- [[_COMMUNITY_Login Layout|Login Layout]]
- [[_COMMUNITY_Screenshot Pages Script|Screenshot Pages Script]]
- [[_COMMUNITY_Alarm Route Tests|Alarm Route Tests]]
- [[_COMMUNITY_Server-First & Frontend Arch|Server-First & Frontend Arch]]
- [[_COMMUNITY_Data Model & System Context|Data Model & System Context]]
- [[_COMMUNITY_Deployment & E2E|Deployment & E2E]]
- [[_COMMUNITY_Next Config|Next Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Design Tokens Typography|Design Tokens Typography]]
- [[_COMMUNITY_No Global State Rule|No Global State Rule]]
- [[_COMMUNITY_Streaming Not Polling Rule|Streaming Not Polling Rule]]
- [[_COMMUNITY_AIML Design|AI/ML Design]]
- [[_COMMUNITY_Monitoring|Monitoring]]
- [[_COMMUNITY_Key Decisions Trade-offs|Key Decisions Trade-offs]]
- [[_COMMUNITY_Product Overview|Product Overview]]
- [[_COMMUNITY_README|README]]
- [[_COMMUNITY_Coverage Thresholds|Coverage Thresholds]]
- [[_COMMUNITY_Integration Tests|Integration Tests]]
- [[_COMMUNITY_Mock Patterns|Mock Patterns]]
- [[_COMMUNITY_Energy Responsive Tests|Energy Responsive Tests]]
- [[_COMMUNITY_Alarm Use Cases|Alarm Use Cases]]
- [[_COMMUNITY_Elevator Use Cases|Elevator Use Cases]]
- [[_COMMUNITY_Energy Use Cases|Energy Use Cases]]
- [[_COMMUNITY_Fire Safety Use Cases|Fire Safety Use Cases]]
- [[_COMMUNITY_Vitest Config|Vitest Config]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `getSession()` - 13 edges
3. `checkAccess()` - 13 edges
4. `EmptyState()` - 10 edges
5. `PageHeader()` - 10 edges
6. `DataTable()` - 8 edges
7. `scripts` - 8 edges
8. `Column` - 7 edges
9. `paths` - 5 edges
10. `POST()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Server-First Rendering` --references--> `Frontend Architecture`  [INFERRED]
  AGENTS.md → DESIGN.md
- `Validate on Every Mutation` --references--> `Auth & Security`  [INFERRED]
  AGENTS.md → DESIGN.md
- `Lighting Use Cases` --references--> `Real-Time Pipeline`  [INFERRED]
  USECASE.md → DESIGN.md
- `HVAC Use Cases` --references--> `IoT Integration`  [INFERRED]
  USECASE.md → DESIGN.md
- `Security Use Cases` --references--> `Auth & Security`  [INFERRED]
  USECASE.md → DESIGN.md

## Import Cycles
- None detected.

## Communities (54 total, 25 thin omitted)

### Community 0 - "UI Loading & Energy Components"
Cohesion: 0.06
Nodes (34): Badge(), BadgeProps, BadgeVariant, VARIANT_CLASSES, Button, ButtonProps, ButtonSize, ButtonVariant (+26 more)

### Community 1 - "Alarms UI & Actions"
Cohesion: 0.07
Nodes (23): AckButton(), Props, AlarmRow, columns, GET(), BuildingOverviewPage(), getBuildingData(), ZoneRow (+15 more)

### Community 2 - "Auth System"
Cohesion: 0.09
Nodes (25): clearSessionCookie(), createDemoUser(), createSessionCookie(), Session, verifyPassword(), AlarmSeverity, AlarmStatus, DoorState (+17 more)

### Community 3 - "Mock Data Layer"
Cohesion: 0.08
Nodes (23): ALARMS, AUDIT_LOG_BASE, BUILDING, CAMERAS, DOORS, ELEVATORS, FIRE_PANELS, HVAC_UNITS (+15 more)

### Community 4 - "TSConfig Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+14 more)

### Community 5 - "Package Dependencies"
Cohesion: 0.10
Nodes (20): dependencies, lucide-react, next, postcss, react, react-dom, tailwindcss, @tailwindcss/postcss (+12 more)

### Community 6 - "Fire Safety UI"
Cohesion: 0.13
Nodes (11): FireClearForm(), Props, DoorLockButton(), Props, columns, DoorRow, DEVICE_STATE_COLORS, DOOR_STATE_COLORS (+3 more)

### Community 7 - "HVAC Controls & Actions"
Cohesion: 0.24
Nodes (16): Props, acknowledgeAlarm(), clearElevatorRecall(), clearFireAlarm(), recallElevator(), setDimLevel(), setDoorState(), setFanSpeed() (+8 more)

### Community 8 - "Dev Dependencies"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, eslint-config-next, playwright, supertest, @types/node, @types/react, @types/react-dom (+5 more)

### Community 9 - "Elevator UI"
Cohesion: 0.20
Nodes (5): ElevatorClearRecall(), Props, ElevatorRecallForm(), Props, ELEVATOR_STATE_COLORS

### Community 10 - "Mobile Nav & Dashboard Layout"
Cohesion: 0.22
Nodes (4): MobileNav(), NavItem, navItems, items

### Community 11 - "Building API Routes"
Cohesion: 0.36
Nodes (5): generateETag(), GET(), POST(), mockCreate, mockFindMany

### Community 12 - "Auth Middleware"
Cohesion: 0.32
Nodes (4): config, middleware(), publicPaths, unauthorized()

### Community 13 - "Server Action Tests"
Cohesion: 0.29
Nodes (5): getActions(), mockPrisma, mockRevalidatePath, mockRevalidateTag, mockSession

### Community 14 - "IoT Architecture"
Cohesion: 0.33
Nodes (6): IoT Protocol Decisions, API Design, IoT Integration, Real-Time Pipeline, HVAC Use Cases, Lighting Use Cases

### Community 15 - "TDD & Testing Strategy"
Cohesion: 0.40
Nodes (5): TDD Compulsory, Component Tests, Testing Strategy, TDD Workflow, Unit Tests

### Community 16 - "Root Layout & Fonts"
Cohesion: 0.40
Nodes (3): inter, jetbrainsMono, metadata

### Community 17 - "Temperature Utils"
Cohesion: 0.70
Nodes (3): celsiusToFahrenheit(), fahrenheitToCelsius(), validateSetpoint()

### Community 18 - "Screenshot Scripts"
Cohesion: 0.50
Nodes (3): { chromium }, fs, path

### Community 19 - "AGENTS.md Directives"
Cohesion: 0.67
Nodes (3): Graphify for Codebase Reasoning, FOUR.md Doc Set, Global Directives

### Community 20 - "Auth Validation"
Cohesion: 0.67
Nodes (3): Validate on Every Mutation, Auth & Security, Security Use Cases

## Knowledge Gaps
- **177 isolated node(s):** `items`, `Props`, `AlarmRow`, `columns`, `Props` (+172 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Slider()` connect `HVAC Controls & Actions` to `UI Loading & Energy Components`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `EmptyState()` connect `UI Loading & Energy Components` to `Alarms UI & Actions`, `Elevator UI`, `Fire Safety UI`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `PageHeader()` connect `Alarms UI & Actions` to `UI Loading & Energy Components`, `Elevator UI`, `Fire Safety UI`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `items`, `Props`, `AlarmRow` to the rest of the system?**
  _177 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Loading & Energy Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05782312925170068 - nodes in this community are weakly interconnected._
- **Should `Alarms UI & Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.06866002214839424 - nodes in this community are weakly interconnected._
- **Should `Auth System` be split into smaller, more focused modules?**
  _Cohesion score 0.08712121212121213 - nodes in this community are weakly interconnected._