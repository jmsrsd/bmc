# Art of Unit Testing — BMC Implementation Plan

> **For Hermes:** Use subagent-driven-development to implement plan task-by-task.
> **Goal:** Apply The Art of Unit Testing (3rd Ed.) principles to achieve ≥70% statement coverage across the BMC codebase, following TESTING.md mandates.
> **Architecture:** Start with test infra (helpers), fill pure function gaps, then component tests (primitives→composites), then API/middleware tests. Each task = RED-GREEN-REFACTOR.
> **Tech Stack:** Vitest 4 + Testing Library + jsdom + MSW (installed) + supertest (installed)

## Current State (Baseline)

| Metric | Value |
|--------|-------|
| Existing tests | 53 pass (4 files) |
| Coverage (stmts) | 0% (threshold: 70%) |
| Coverage (branches) | 0% (threshold: 60%) |
| Test files | `temperature.test.ts`, `auth.test.ts`, `actions.test.ts`, `useSSE.test.ts` |
| `helpers.ts` | Empty/missing (referenced in TESTING.md §8.1) |
| Component tests | 0 files |
| API route tests | 0 files |

**Gaps identified:**
- `lib/utils.ts`: `relativeTime`, `dimBarColor` — 0 tests
- `lib/temperature.ts`: `fahrenheitToCelsius` — 0 tests (but exists in source)
- 14 UI primitives — 0 tests
- 6 composite form components (`useActionState` hooks) — 0 tests
- 6 API routes — 0 tests
- `middleware.ts` — 0 tests
- `app/__tests__/helpers.ts` — doesn't exist (empty file, TESTING.md §8.1 stale ref)

---

## Phase 0: Infrastructure — Create `helpers.ts`

**Objective:** Create the test factories referenced in TESTING.md §8.1 so all subsequent component tests have stable, realistic data.

**Files:**
- Create: `app/__tests__/helpers.ts`

**Content:** Move `buildBuilding()`, `buildZone()`, `buildSensor()`, `buildTelemetry()` from TESTING.md §8.1 into this file. Add new factories needed by components:
- `buildHvacUnit()`, `buildLightZone()`, `buildDoor()`, `buildElevatorCar()`, `buildAlarm()`, `buildFirePanel()`, `buildFireDevice()`, `buildCamera()`, `buildMeter()`, `buildMeterReading()`
- Use cuid-like IDs (`'b1'`, `'z1'`, etc.), align with Prisma enums from DESIGN.md §2.2
- Add `createMockFormData(overrides)` helper for action form tests

**Verification:** `cat app/__tests__/helpers.ts | head -5` — file exists, exports are importable.

---

## Phase 1: Pure Function Tests (lib/*.ts)

### Task 1.1: Add missing `fahrenheitToCelsius` tests

**File:** Modify: `app/__tests__/temperature.test.ts`

**Tests to add:**
- converts 32°F to 0°C
- converts 212°F to 100°C
- rounds to 1 decimal place
- converts negative
- converts body temp

**Verification:** `pnpm test -- temperature.test.ts` → 10 tests pass (was 5)

### Task 1.2: Test `lib/utils.ts` — `relativeTime` + `dimBarColor`

**Create:** `lib/__tests__/utils.test.ts`

**`relativeTime` tests:**
- returns 'just now' for < 1 min
- returns 'Xm ago' for minutes
- returns 'Xh ago' for hours
- returns 'Xd ago' for days
- handles `Date.now()` boundary (freeze time with fake timer or pass in date param — prefer extracting pure function, but as-is test with `vi.setSystemTime`)

**`dimBarColor` tests:**
- returns `bg-status-active` for level ≥ 75
- returns `bg-status-warning` for level 40-74
- returns `bg-amber-600` for level < 40
- boundary: exactly 75 → `bg-status-active`
- boundary: exactly 40 → `bg-status-warning`

**Verification:** `pnpm test -- utils.test.ts` → all pass

---

## Phase 2: Primitive Component Tests (no external deps)

Strategy: Pure rendering, no server actions, no auth. Just props → DOM.

### Task 2.1: `StatusLed` test

**File:** `app/components/ui/primitives/__tests__/status-led.test.tsx`

**Tests:**
- renders with 'normal' → has `bg-status-normal` class
- renders with 'warning' → has `bg-status-warning` class
- renders with 'critical' → has `bg-status-critical` class
- renders with 'unknown' → has `bg-gray-500` class
- has correct aria-label
- accepts custom className (appended)

### Task 2.2: `Card` test

**File:** `app/components/ui/primitives/__tests__/card.test.tsx`

**Tests:**
- renders children
- applies default class (`bg-surface`)
- elevated variant → `bg-bg-elevated`
- accepts custom className

### Task 2.3: `StatusBadge` test

**File:** `app/components/ui/primitives/__tests__/status-badge.test.tsx`

**Tests:**
- renders children text
- applies critical color classes
- applies warning color classes
- applies info color classes
- applies normal color classes
- contains StatusLed inside

### Task 2.4: `Button` test

**File:** `app/components/ui/primitives/__tests__/button.test.tsx`

**Tests:**
- renders with default (primary) variant
- applies variant class for each variant
- handles disabled state (attribute + class)
- handles custom className
- passes click handler
- renders children

### Task 2.5: `StatCard` test

**File:** `app/components/ui/primitives/__tests__/stat-card.test.tsx`

**Tests:**
- renders label
- renders value
- highlight prop → adds critical classes
- renders icon with correct bg
- renders children fallback when value is null
- no icon → no icon wrapper

### Task 2.6: `MetricTile` + `SensorTile` tests

**File:** `app/components/ui/primitives/__tests__/metric-tile.test.tsx`

**MetricTile tests:**
- renders label + value
- custom valueColor
- renders unit when provided
- no unit → no unit element

**SensorTile tests:**
- renders value + label
- icon + iconColor
- no icon → no icon div

### Task 2.7: `EmptyState` test

**File:** `app/components/ui/primitives/__tests__/empty-state.test.tsx`

**Tests:**
- renders title
- renders description when provided
- no description → no description element
- renders icon when provided
- no icon → no icon wrapper

### Task 2.8: `BackLink` test

**File:** `app/components/ui/primitives/__tests__/back-link.test.tsx`

**Tests:**
- renders link with correct href
- renders default label ('Dashboard')
- renders custom label
- contains ArrowLeft icon

### Task 2.9: `PageHeader` test

**File:** `app/components/ui/primitives/__tests__/page-header.test.tsx`

**Tests:**
- renders title
- renders subtitle when provided
- no subtitle → no subtitle element
- subtitle 0 (number) still renders

### Task 2.10: `FilterTabs` + `PillTabs` tests

**File:** `app/components/ui/primitives/__tests__/filter-tabs.test.tsx`

**FilterTabs tests:**
- renders all tabs
- active tab gets active class
- inactive tab gets inactive class

**PillTabs tests:**
- renders all tabs
- active tab styling
- multiple tabs rendered

---

## Phase 3: Composite Form Component Tests (useActionState)

These components use `useActionState` hook from React 19. Tests need to render the form, simulate submission, and verify feedback states.

Strategy: Do NOT mock the server action at the import level. Instead mock `@/lib/actions` module so the action fn is a `vi.fn()` that returns various shapes.

### Task 3.1: `AlarmAckForm` test

**File:** `app/components/ui/__tests__/alarm-ack-form.test.tsx`

Mock `@/lib/actions` → `acknowledgeAlarm` returns `{ success: true, alarmId }` | `{ error: 'msg' }`

**Tests:**
- renders hidden input with alarmId
- renders 'Acknowledge' button
- pending state → button disabled + text changes
- success state → shows checkmark
- error state → shows error text in status-critical

### Task 3.2: `AcknowledgeButton` (page-level variant) test

**File:** `app/(routes)/alarms/__tests__/ack-button.test.tsx`

Same pattern as AlarmAckForm but from page directory. Mock `@/lib/actions`.

**Tests:**
- renders with Check icon
- pending state
- success state → shows 'Acknowledged' text
- error state

### Task 3.3: `DoorLockButton` test

**File:** `app/components/ui/__tests__/door-controls.test.tsx`

Mock `@/lib/actions` → `setDoorState`.

**Tests:**
- locked → shows Unlock button + Lock icon
- unlocked → shows Lock button + Unlock icon
- pending → disabled
- success state → no error shown
- error state → error text

### Task 3.4: `SetpointForm` test

**File:** `app/components/ui/__tests__/hvac-controls.test.tsx`

Mock `@/lib/actions` → `setTemperature`.

**Tests:**
- renders hidden zoneId
- renders number input with min/max/step
- input defaultValue = currentSetpoint
- pending state → shows '...'
- success state → shows 'Updated'
- error state → shows error text

### Task 3.5: `FanSpeedButtons` test

**File:** `app/components/ui/__tests__/hvac-controls.test.tsx` (same file)

Mock `@/lib/actions` → `setFanSpeed`.

**Tests:**
- renders all 5 speed buttons
- current speed gets active class
- other speeds get inactive class
- pending → all disabled
- error display

### Task 3.6: `HvacModeButtons` test

**File:** `app/components/ui/__tests__/hvac-controls.test.tsx` (same file)

Mock `@/lib/actions` → `setHvacMode`.

**Tests:**
- renders all 4 mode buttons
- active mode highlighted
- pending state
- error display

### Task 3.7: `DimSlider` test

**File:** `app/components/ui/__tests__/lighting-controls.test.tsx`

Mock `@/lib/actions` → `setDimLevel`.

**Tests:**
- renders range input with correct min/max/default
- shows current level label
- pending → no effect on display
- success/error display

**Note:** Input `onChange` calls `form.requestSubmit()` — this may trigger actual submission. Use `await userEvent.type()` pattern or wrap form in a container to capture submit.

### Task 3.8: `LightToggle` test

**File:** `app/components/ui/__tests__/lighting-controls.test.tsx` (same file)

Mock `@/lib/actions` → `toggleLight`.

**Tests:**
- ON state → shows 'Turn Off' + Sun icon
- OFF state → shows 'Turn On' + Moon icon
- pending
- success/error

### Task 3.9: `ElevatorRecallForm` test

**File:** `app/(routes)/elevators/__tests__/elevator-recall-form.test.tsx`

Mock `@/lib/actions` → `recallElevator`.

**Tests:**
- renders number input with floor range
- pending
- success → checkmark
- error → error text

### Task 3.10: `ElevatorClearRecallButton` test

**File:** `app/(routes)/elevators/__tests__/elevator-clear-recall.test.tsx`

Mock `@/lib/actions` → `clearElevatorRecall`.

**Tests:**
- renders button
- pending
- success/error

### Task 3.11: `FireClearForm` test

**File:** `app/(routes)/fire/__tests__/fire-clear-form.test.tsx`

Mock `@/lib/actions` → `clearFireAlarm`.

**Tests:**
- renders button
- pending → shows 'Clearing...'
- success → 'Alarm cleared'
- error

---

## Phase 4: Composite Display Component Tests (data-driven)

### Task 4.1: `DoorCard` test

**File:** `app/components/ui/primitives/__tests__/door-card.test.tsx`

**Tests:**
- renders door name + location
- FORCED state → critical border + no action buttons
- LOCKED state → warning status + shows DoorLockButton
- UNLOCKED state → normal status + shows DoorLockButton
- alarm state visible when not NORMAL
- no alarm badge when alarm state is NORMAL

### Task 4.2: `LightZoneCard` test

**File:** `app/components/ui/primitives/__tests__/light-zone-card.test.tsx`

**Tests:**
- renders zone name
- ON state → active badge + StatusLed normal
- OFF state → muted badge + StatusLed unknown
- dim bar color matches level (via dimBarColor)
- width reflects dimLevel
- renders dimSlider slot
- renders lightToggle slot
- power > 0 → shows power line
- power = 0 → no power line

### Task 4.3: `ElevatorCard` test

**File:** `app/components/ui/primitives/__tests__/elevator-card.test.tsx`

**Tests:**
- renders car name + state badge
- FAULT → critical status
- RECALL → warning status
- UP direction → ArrowUp icon
- DOWN direction → ArrowDown icon + critical color
- IDLE → dash
- door OPEN → DoorOpen icon
- door CLOSED → DoorClosed icon
- recall info shown when state RECALL + recallFloor > 0
- no recall info for non-RECALL state
- renders recallForm slot
- renders clearRecallBtn slot

---

## Phase 5: API Route Tests

Strategy: Use supertest against the dev server OR mock Prisma at the import level for isolated tests.

Prefer isolated (mock Prisma) for unit-scale tests, supertest for integration-level.

### Task 5.1: `POST /api/login` tests

**Create:** `app/api/__tests__/login.test.ts`

Mock `@/lib/auth` → `verifyPassword` returns true/false.

**Tests:**
- 200 with correct password
- 401 with wrong password
- 400 with missing password body
- 400 with non-string password
- sets httpOnly cookie on success

### Task 5.2: `POST /api/logout` test

**Create:** `app/api/__tests__/logout.test.ts`

**Tests:**
- 200 success
- clears cookie (maxAge: 0)

### Task 5.3: `GET /api/building` test

**Create:** `app/api/__tests__/building.test.ts`

Mock `@/lib/prisma` → `prisma.building.findMany` returns array.

**Tests:**
- 200 with building list
- 500 when prisma throws

### Task 5.4: `POST /api/building` test

**Create:** `app/api/__tests__/building.test.ts` (same file)

**Tests:**
- 201 with valid body (name + address)
- 500 when prisma.create throws

### Task 5.5: `GET /api/buildings/[id]` test

**Create:** `app/api/buildings/__tests__/route.test.ts`

Mock Prisma building.findUnique → returns object / null / throws.

**Tests:**
- 200 with building (includes zones, sensors, alarms)
- 404 when building not found
- 500 on prisma error

### Task 5.6: `middleware.ts` test

**Create:** `lib/__tests__/middleware.test.ts`

Test the pure redirect logic by constructing mock NextRequest objects.

Strategy: Export a testable wrapper or test middleware via `NextRequest` constructor + `NextResponse` check.

**Tests:**
- allows /login path through
- allows /api/login through
- allows /_next/static through
- allows favicon.ico through
- redirects to /login when no session cookie
- redirects to /login when cookie value wrong
- allows request with valid cookie through
- passes through paths not starting with public paths

---

## Phase 6: Coverage Verification & Threshold Enforcement

### Task 6.1: Run full coverage

```bash
cd ~/src/workspace/bmc && pnpm test:coverage 2>&1
```

**Expected:** ≥70% statements, ≥60% branches project-wide.

If any area below threshold, identify untested branches and add tests.

### Task 6.2: Update `TESTING.md`

Update TESTING.md §8.1 with the actual factories that exist in `helpers.ts`.
Update §4.1 directory layout to reflect actual test file locations.
Update §5 coverage table if needed.
Append `(web-validated 2026-06-24)` to TESTING.md header per AGENTS.md D1.

---

## Task Order & Dependencies

```
Phase 0 (helpers.ts)
  └─► Phase 1 (pure functions) ──► Phase 2 (primitives)
                                        └─► Phase 3 (form components) ──► Phase 4 (composite cards)
                                                                                └─► Phase 5 (API/middleware)
                                                                                      └─► Phase 6 (verification)
```

Phases 1 and 2 can run in parallel.
Phase 3 depends on Phase 2 (some card components import primitives).
Phase 4 depends on Phase 3 (card slots take form components).
Phase 5 depends only on Phase 0 (no component overlap).

**Parallel execution plan:** Delegate subagents for:
- Subagent A: Phase 0 + Phase 1
- Subagent B: Phase 2 (primitives)
- Subagent C: Phase 3 (form components)
Then: Subagent D: Phase 4 + Phase 5
Finally: Subagent E: Phase 6

---

## Risks & Open Questions

1. **`helpers.ts` directory mismatch** — TESTING.md §4.1 says `app/__tests__/helpers.ts` but TESTING.md §8.1 sample code shows `app/__tests__/helpers.ts`. Verify actual location exists.
2. **`useActionState` testing** — React 19's `useActionState` may require specific `act()` wrapping. If `form.requestSubmit()` causes issues, use `await user.click(submitButton)` instead.
3. **SSE route (`app/api/stream/building/[id]/route.ts`)** — 129 lines, creates ReadableStream with timers. Hard to unit test with mocks. Defer to integration/E2E level. Document this decision.
4. **Pages (Server Components)** — Pages use `prisma` directly for data fetching. Testing these requires either mock Prisma and test as async functions, or supertest integration tests. Defer to post-MVP.
5. **Coverage threshold** — 70% project-wide may be achievable without testing pages/SSE-route, but trim is close. If not, add page-level rendering tests or adjust thresholds in TESTING.md.

## ✅ Already Done

- Vitest 4 + jsdom configured (`vitest.config.ts`)
- Testing Library + jest-dom matchers (`app/__tests__/setup.ts`)
- MSW installed + supertest installed
- Path aliases configured: `@/` → project root
- 4 test files covering: temperature, auth, actions, useSSE
- TESTING.md provides detailed test patterns for every layer
- `package.json` scripts include `test`, `test:watch`, `test:coverage`
