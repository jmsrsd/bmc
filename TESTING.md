# BMC — Testing Strategy (web-validated 2026-06-24)

> **Practice:** TDD (RED-GREEN-REFACTOR) — compulsory for all code
> **Framework:** Vitest + Testing Library + Playwright
> **Architecture Context:** See `DESIGN.md` for system architecture, component tree, and API surface
> **Use Case Context:** See `USECASE.md` for actor workflows, pre/post conditions, and scenario outputs
> **Agent Rules:** See `AGENTS.md` for operational precedence and TDD enforcement
> **Graphify:** Use `graphify path` to identify affected dependents and trace logic paths before writing regression tests
> **Hermes Skill:** `test-driven-development` — RED-GREEN-REFACTOR mechanics
> **Directive D1:** When modifying this doc, web-search all referenced library APIs and patterns for current correctness

---

## 1. TDD as Compulsory Practice

### The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Every feature, bug fix, and refactor follows RED-GREEN-REFACTOR:

1. **RED** — Write failing test defining desired behavior
2. **VERIFY RED** — Run it. Confirm failure is expected (feature missing, not typo)
3. **GREEN** — Write minimal code to pass
4. **VERIFY GREEN** — Run it. Confirm pass. Run full suite for regressions
5. **REFACTOR** — Clean up. Keep tests green through every step

### Exceptions (require user approval)

- Throwaway prototypes / spikes
- Generated code (Prisma schema, API route stubs)
- Configuration files (vercel.json, tsconfig, tailwind.config)

### What TDD Means for BMC

Every subsystem has behavioral contracts defined in DESIGN.md and triggered by actors in USECASE.md:

| Subsystem | USECASE ID | DESIGN Ref | Contract Under Test |
|-----------|------------|------------|-------------------|
| HVAC setpoint | UC-HVAC-01 | §3.4, §2.2 | `setTemperature(zId, 22)` → updateMany + gateway call + cache invalidation |
| Door lock | UC-SEC-01 | §6.3 | `checkAccess` enforced → audit log created |
| SSE stream | UC-STRM-01 | §3.3 | Events match `{zoneId, type, value, unit, ts}` schema |
| Telemetry ingest | UC-SYS-01 | §4.1, §3.2 | MQTT message validates: buildingId, value range, quality 0-100 |
| Auth matrix | UC-AUTH-02 | §6.2, §6.3 | 7 role levels, building scope, invalid role strings |
| ML anomaly | UC-SYS-04 | §8.4 | Inference returns score [0,1] within 500ms |

---

## 2. Test Pyramid

```
        ╱╲
       ╱ E2E ╲             Playwright — critical user journeys
      ╱────────╲
     ╱──────────╲
    ╱ Integration ╲        API routes + SSE endpoints + DB
   ╱────────────────╲
  ╱──────────────────╲
 ╱   Unit (core logic)  ╲  Pure functions, Server Actions, hooks,
╱────────────────────────╲  component rendering, auth helpers
```

### 2.1 Unit Tests — Pure Functions (Vitest)

**What to test:** Data transformations, validation, unit conversion, Zod schemas, type guards.
**What NOT to test:** Framework internals, Prisma query engine, CSS/Tailwind classes, third-party libs.

```typescript
// app/lib/__tests__/temperature.test.ts
import { describe, it, expect } from 'vitest'
import { celsiusToFahrenheit, validateSetpoint } from '../temperature'

describe('celsiusToFahrenheit', () => {
  it('converts 0°C to 32°F', () => { expect(celsiusToFahrenheit(0)).toBe(32) })
  it('converts 100°C to 212°F', () => { expect(celsiusToFahrenheit(100)).toBe(212) })
  it('rounds to 1 decimal place', () => { expect(celsiusToFahrenheit(22.5)).toBe(72.5) })
})

describe('validateSetpoint', () => {
  it('accepts valid setpoint 16-30°C', () => { expect(validateSetpoint(22)).toEqual({ valid: true }) })
  it('rejects below 16°C', () => { expect(validateSetpoint(15)).toEqual({ valid: false, error: 'Below minimum 16°C' }) })
  it('rejects above 30°C', () => { expect(validateSetpoint(31)).toEqual({ valid: false, error: 'Above maximum 30°C' }) })
  it('rejects non-numeric', () => { expect(validateSetpoint(NaN)).toEqual({ valid: false, error: 'Must be a number' }) })
})
```

### 2.2 Component Tests (Vitest + Testing Library)

**What to test:** Render output, user interactions, conditional states, accessibility.
**What NOT to test:** Snapshots, internal implementation, parent-child wiring.

```typescript
// app/components/ui/__tests__/temperature-control.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemperatureControl } from '../temperature-control'

describe('TemperatureControl', () => {
  const mockOnChange = vi.fn()

  it('displays current temperature', () => {
    render(<TemperatureControl current={22.5} onChange={mockOnChange} />)
    expect(screen.getByText('22.5°C')).toBeInTheDocument()
  })

  it('calls onChange when slider moved', async () => {
    const user = userEvent.setup()
    render(<TemperatureControl current={22.5} onChange={mockOnChange} />)
    await user.type(screen.getByRole('slider'), '24')
    expect(mockOnChange).toHaveBeenCalledWith(24)
  })

  it('disables controls when loading', () => {
    render(<TemperatureControl current={22.5} onChange={mockOnChange} loading />)
    expect(screen.getByRole('slider')).toBeDisabled()
  })

  it('shows error state', () => {
    render(<TemperatureControl current={22.5} onChange={mockOnChange} error="Connection lost" />)
    expect(screen.getByText('Connection lost')).toBeInTheDocument()
  })
})
```

### 2.3 Server Action Tests (Vitest)

**What to test:** Input validation, auth check invocation, DB mutation args, cache invalidation, error handling, return shape.

Use `@/` path alias (matches vitest.config.ts): `vi.mock('@/lib/prisma', ...)`

```typescript
// app/lib/__tests__/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setTemperature } from '../actions'
// UC-HVAC-01: Set zone temperature setpoint
// DESIGN.md §3.4: Zod + Prisma + revalidatePath + auditLog

vi.mock('@/lib/prisma', () => ({
  prisma: {
    hVACUnit: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    auditLog: { create: vi.fn().mockResolvedValue({ id: 'log1' }) },
  },
}))

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn().mockResolvedValue({ user: { id: 'u1', role: 'operator', buildingIds: ['b1'] } }),
  checkAccess: vi.fn().mockReturnValue(undefined),
}))

describe('setTemperature', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects setpoint below 16°C', async () => {
    const fd = new FormData(); fd.set('zoneId', 'z1'); fd.set('setpoint', '15')
    expect(await setTemperature({}, fd)).toEqual({ error: 'Invalid input' })
  })

  it('calls updateMany with correct args', async () => {
    const { prisma } = await import('@/lib/prisma')
    const fd = new FormData(); fd.set('zoneId', 'z1'); fd.set('setpoint', '22')
    await setTemperature({}, fd)
    expect(prisma.hVACUnit.updateMany).toHaveBeenCalledWith({ where: { zoneId: 'z1' }, data: { setpoint: 22 } })
  })

  it('returns success with applied setpoint', async () => {
    const fd = new FormData(); fd.set('zoneId', 'z1'); fd.set('setpoint', '22')
    expect(await setTemperature({}, fd)).toEqual({ success: true, setpoint: 22 })
  })
})
```

### 2.4 API Route & SSE Tests (Supertest + Dev Server)

**What to test:** Response shape, status codes, auth rejection, SSE event format, CORS.
**Pattern:** Start Next.js dev server, hit with supertest.

```typescript
// app/api/__tests__/building.test.ts
import { describe, it, expect } from 'vitest'
import supertest from 'supertest'

const request = supertest('http://localhost:3000')

describe('GET /api/buildings', () => {
  it('returns 200 with building list', async () => {
    const res = await request.get('/api/buildings')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('POST /api/buildings', () => {
  it('rejects missing name', async () => {
    const res = await request.post('/api/buildings').send({ address: '123 Main St' })
    expect(res.status).toBe(400)
  })
})
```

For isolated (no-server) tests, use MSW (installed as devDependency) to intercept HTTP.

### 2.5 E2E Tests (Playwright)

```typescript
// e2e/hvac.spec.ts — UC-HVAC-01
test('operator can change HVAC setpoint', async ({ page }) => {
  await page.goto('/building/b1/hvac')
  await expect(page.getByTestId('current-temp')).toContainText('22.5°C')
  await page.getByLabel('Target Temperature').fill('24')
  await page.getByRole('button', { name: 'Update' }).click()
  await expect(page.getByTestId('setpoint-confirmed')).toContainText('24°C')
})
```

---

## 3. BMC-Specific Test Patterns

### 3.1 SSE Hook Tests — UC-STRM-01

Tests `useSSE` hook (DESIGN.md §7.3). Mock EventSource global.

```typescript
// app/lib/__tests__/useSSE.test.ts
describe('useSSE', () => {
  let mockES: any
  beforeEach(() => {
    mockES = { close: vi.fn(), onmessage: null, onerror: null }
    global.EventSource = vi.fn(() => mockES)
  })
  afterEach(() => vi.restoreAllMocks())

  it('connects to provided URL', () => {
    renderHook(() => useSSE('/api/stream/building/b1'))
    expect(EventSource).toHaveBeenCalledWith('/api/stream/building/b1')
  })

  it('updates state on message', () => {
    const { result } = renderHook(() => useSSE('/url', { temp: 22 }))
    act(() => { mockES.onmessage({ data: JSON.stringify({ temp: 23.5 }) }) })
    expect(result.current).toEqual({ temp: 23.5 })
  })

  it('closes connection on unmount', () => {
    const { unmount } = renderHook(() => useSSE('/url'))
    unmount()
    expect(mockES.close).toHaveBeenCalled()
  })
})
```

### 3.2 Telemetry Message Schema Tests — UC-SYS-01

Validates MQTT→cloud message format (DESIGN.md §4.2, §5.2).

```typescript
// app/lib/__tests__/telemetry.test.ts
describe('telemetry message schema', () => {
  const valid = {
    buildingId: 'b1', deviceId: 'ahu-01', type: 'analog-input',
    value: 22.5, unit: '°C', ts: '2026-06-21T10:30:00Z', quality: 95,
  }

  it('accepts valid BACnet analog-input message', () => { expect(() => validateTelemetry(valid)).not.toThrow() })
  it('rejects missing buildingId', () => { const { buildingId, ...rest } = valid; expect(() => validateTelemetry(rest)).toThrow() })
  it('rejects value out of range', () => { expect(() => validateTelemetry({ ...valid, value: 999 })).toThrow() })
  it('rejects future timestamps', () => { expect(() => validateTelemetry({ ...valid, ts: '2099-01-01T00:00:00Z' })).toThrow() })
  it('accepts quality 0-100', () => {
    expect(() => validateTelemetry({ ...valid, quality: 0 })).not.toThrow()
    expect(() => validateTelemetry({ ...valid, quality: 100 })).not.toThrow()
    expect(() => validateTelemetry({ ...valid, quality: -1 })).toThrow()
  })
})
```

### 3.3 Auth Matrix Tests — UC-AUTH-02

Every branch of `checkAccess` (DESIGN.md §6.3). Hierarchy: viewer < tech < operator < security < energy < admin < superadmin.

```typescript
// app/lib/__tests__/auth.test.ts
describe('checkAccess', () => {
  const op  = { role: 'operator', buildingIds: ['b1', 'b2'] }
  const tech = { role: 'tech', buildingIds: ['b1'] }
  const viewer = { role: 'viewer', buildingIds: ['b1'] }
  const admin = { role: 'admin', buildingIds: ['b1', 'b2', 'b3'] }

  it('allows operator in their building', () => { expect(() => checkAccess(op, 'b1', 'operator')).not.toThrow() })
  it('denies operator in unassigned building', () => { expect(() => checkAccess(op, 'b3', 'operator')).toThrow('Forbidden') })
  it('denies tech from operator-level actions', () => { expect(() => checkAccess(tech, 'b1', 'operator')).toThrow('Forbidden') })
  it('allows tech view-only', () => { expect(() => checkAccess(tech, 'b1', 'viewer')).not.toThrow() })
  it('denies viewer from control', () => { expect(() => checkAccess(viewer, 'b1', 'operator')).toThrow('Forbidden') })
  it('allows admin any building', () => { expect(() => checkAccess(admin, 'b3', 'operator')).not.toThrow() })
  it('throws on invalid role', () => { expect(() => checkAccess(op, 'b1', 'nonexistent')).toThrow() })
})
```

### 3.4 IoT Gateway Tests (Separate Python Repo)

The BACnet/Modbus/MQTT gateway is a separate Python service (DESIGN.md §5). Tested with pytest:

```python
def test_mqtt_payload_format():
    payload = build_telemetry("b1", "ahu-01", 22.5, "°C")
    assert payload["buildingId"] == "b1"
    assert payload["deviceId"] == "ahu-01"

def test_offline_buffer_replay():
    with isolated_filesystem():
        buffer = TelemetryBuffer(":memory:")
        buffer.write({"deviceId": "d1", "value": 22.5})
        assert len(buffer.read_pending()) == 1
```

### 3.5 ML Inference Tests — UC-SYS-04

ML models export to ONNX and run in Node.js (DESIGN.md §8.4).

```typescript
// app/lib/__tests__/inference.test.ts
describe('anomaly score inference', () => {
  it('returns score between 0 and 1', async () => {
    const score = await getAnomalyScore('ahu-01')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })

  it('handles unknown device gracefully', async () => {
    await expect(getAnomalyScore('nonexistent')).rejects.toThrow()
  })

  it('respects 500ms timeout (DESIGN.md §8.2)', async () => {
    const start = Date.now()
    await getAnomalyScore('ahu-01')
    expect(Date.now() - start).toBeLessThan(1000)
  })
})
```

---

## 4. Testing Infrastructure

### 4.1 Directory Layout

```
bmc/
├── app/
│   ├── __tests__/
│   │   ├── setup.ts           # jest-dom matchers, auto cleanup
│   │   ├── helpers.ts         # buildBuilding(), buildZone(), buildSensor()
│   │   └── temperature.test.ts
│   ├── lib/__tests__/         # temperature, actions, auth, useSSE, telemetry, inference
│   ├── components/ui/__tests__/  # temperature-control, fan-speed, door-status
│   └── api/__tests__/         # building, alarms
├── e2e/                       # hvac.spec, security.spec, auth.spec
├── vitest.config.ts
├── playwright.config.ts
└── TESTING.md
```

### 4.2 Test Scripts

```bash
pnpm test              # vitest run
pnpm test:watch        # vitest (watch)
pnpm test:coverage     # vitest run --coverage
pnpm test:e2e          # playwright test
pnpm test:all          # vitest + playwright
```

### 4.3 CI Integration (GitHub Actions)

```yaml
name: Test
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
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: playwright-report, path: playwright-report/ }
```

---

## 5. Coverage Thresholds

| Layer | Statements | Branches | Functions | Lines | Test Pattern |
|-------|-----------|----------|-----------|-------|-------------|
| Pure functions (lib/temperature, lib/telemetry) | 90% | 85% | 90% | 90% | §2.1 |
| Server Actions (lib/actions.ts) | 85% | 80% | 85% | 85% | §2.3 |
| Components (ui/) | 75% | 65% | 80% | 75% | §2.2 |
| Auth helpers (lib/auth.ts) | 90% | 90% | 90% | 90% | §3.3 |
| SSE hooks (lib/useSSE.ts) | 85% | 75% | 85% | 85% | §3.1 |
| API routes (api/) | 80% | 70% | 80% | 80% | §2.4 |
| Inference wrapper (lib/inference.ts) | 80% | 70% | 80% | 80% | §3.5 |
| **Project-wide** | **70%** | **60%** | **70%** | **70%** | — |

Coverage is a **floor**, not a target. Every PR must maintain or improve these numbers.

---

## 6. TDD Workflow for Hermes Agents

### 6.1 Implementation

```
1. READ DESIGN.md for architecture, USECASE.md for actor workflow
2. WRITE failing test (*.test.ts)
3. RUN → confirm RED (pnpm test -- <file>)
4. WRITE minimal implementation
5. RUN → confirm GREEN
6. RUN full suite (pnpm test) → no regressions
7. REFACTOR if needed → keep green
8. COMMIT
```

### 6.2 Bug-Fix

```
1. WRITE test reproducing the bug
2. RUN → confirm RED (bug exists)
3. FIX code minimally
4. RUN → confirm GREEN (bug gone)
5. RUN full suite → no regressions
The test becomes regression prevention.
```

### 6.3 Subagent Delegation with TDD

```python
delegate_task(
    goal="Implement HVAC zone temperature control with strict TDD",
    context="""
    USECASE.md UC-HVAC-01 defines the actor workflow and pre/post conditions.
    DESIGN.md §3.4 defines the Server Action pattern with Zod + Prisma + auditLog.
    Testing infra: vitest.config.ts with @/ path aliases.

    FOLLOW TDD:
    1. Write failing test (app/lib/__tests__/actions.test.ts)
    2. Run → confirm RED (pnpm test -- actions.test.ts)
    3. Write implementation (app/lib/actions.ts)
    4. Run → confirm GREEN
    5. Run full suite → no regressions
    6. Report output at each step
    """,
    toolsets=['terminal', 'file']
)
```

---

## 7. Testing Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Approach |
|-------------|--------------|-----------------|
| `vi.mock('@lib/prisma')` wrong alias | vitest config uses `@/` | `vi.mock('@/lib/prisma', ...)` |
| Snapshot-testing components | All snapshots break on Tailwind bumps | Test behavior: "shows 22.5°C" |
| Testing SSE with fake timers | Reconnection is critical | Mock EventSource (§3.1) |
| Testing Server Actions via HTTP | Bypasses FormData + revalidatePath | Invoke action directly (§2.3) |
| E2E tests that sleep() | Flaky on CI | Use `waitFor` / `locator.waitFor()` |
| Skipping RED step | Tests after pass immediately → prove nothing | Always watch test fail first |
| Testing private/internal functions | Refactoring breaks them | Test through public API surface |
| Coverage-chasing without assertions | 100% ≠ 100% correct | Assert behavior, not line execution |

---

## 8. Test Data Strategy

### 8.1 Factories

Aligns with DESIGN.md §2.2 (cuid IDs, Json metadata, enum types):

```typescript
// app/__tests__/helpers.ts
export function buildBuilding(overrides = {}) {
  return { id: 'b1', name: 'Test Building', timezone: 'Asia/Jakarta',
    zones: [buildZone()], createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-06-21'),
    ...overrides }
}
export function buildZone(overrides = {}) {
  return { id: 'z1', buildingId: 'b1', name: '3rd Floor North', type: 'OFFICE', area: 500,
    createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-06-21'), ...overrides }
}
export function buildSensor(overrides = {}) {
  return { id: 's1', zoneId: 'z1', type: 'TEMPERATURE', value: 22.5, unit: '°C', quality: 95,
    timestamp: new Date(), metadata: { manufacturer: 'Siemens' }, ...overrides }
}
export function buildTelemetry(overrides = {}) {
  return { buildingId: 'b1', deviceId: 'ahu-01', type: 'analog-input', value: 22.5, unit: '°C',
    ts: '2026-06-21T10:30:00Z', quality: 95, ...overrides }
}
```

### 8.2 Test Database (Integration)

```typescript
// app/__tests__/setup-db.ts
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const TEST_DB_URL = 'file:./test.db'
export async function createTestDb(): Promise<PrismaClient> {
  process.env.DATABASE_URL = TEST_DB_URL
  execSync('npx prisma db push --force-reset --skip-generate', {
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
  })
  return new PrismaClient({ datasources: { db: { url: TEST_DB_URL } } })
}
```

---

## 9. Test Naming Convention

```
app/lib/__tests__/<module>.test.ts              — Pure functions, Server Actions
app/components/<name>/__tests__/<name>.test.tsx — Components
app/api/__tests__/<route>.test.ts                — API routes
e2e/<subsystem>.spec.ts                          — Playwright E2E
```

**Test names:** Imperative English, describe behavior not implementation:

| Good | Bad |
|------|-----|
| `rejects setpoint below 16°C` | `testSetpointValidation` |
| `converts 0°C to 32°F` | `testConversion` |
| `disables controls when loading` | `testLoadingState` |
| `closes SSE connection on unmount` | `testCleanup` |
| `denies tech from operator-level actions` | `testAuthLevels` |

---

## 10. Verification Checklist

Before marking any code complete:

- [ ] Every new function has a test written FIRST (TDD step 1)
- [ ] Watched the test fail — RED verified (TDD step 2)
- [ ] Wrote minimal code to pass — GREEN verified (TDD step 3-4)
- [ ] Full suite passes — no regressions (TDD step 4 continued)
- [ ] Coverage does not drop below thresholds (§5)
- [ ] Edge cases covered (empty, error, boundary)
- [ ] No snapshot tests added
- [ ] No `// istanbul ignore` (unless genuinely unreachable)
- [ ] Tests use public API surface (no internals)
- [ ] Mobile viewport (375px): no fixed element overlaps or occludes primary content — `pnpm test:e2e -- e2e/mobile-overlap.spec.ts`
- [ ] Bug fixes include a test reproducing the bug
- [ ] Auth `checkAccess` is tested at the role boundary (UC-AUTH-02)
- [ ] AI/ML inference tested with timeout guard (UC-SYS-04)
- [ ] SSE hook tests verify disconnect/cleanup (UC-STRM-01)
- [ ] Audit log entry verified for every control action (UC-AUDIT-01)

---

## Appendix A: Quick Reference

```bash
pnpm test                     # All unit + integration
pnpm test -- actions.test.ts  # Single file
pnpm test -- -t "setpoint"    # Filter by name
pnpm test:coverage            # With coverage report
pnpm test:watch               # Watch mode
pnpm test:e2e                 # Playwright
pnpm test:e2e:ui              # Playwright UI (debug)
pnpm test:all                 # Everything
```

## Appendix B: DESIGN.md × USECASE.md × TEST Cross-Reference

| Test Pattern | Section | USECASE | DESIGN Ref |
|-------------|---------|---------|------------|
| Unit: pure functions | §2.1 | — | §3.4 (setpoint 16-30°C), §4.2 (telemetry) |
|| Component: rendering | §2.2 | UC-HVAC-01, UC-LGT-01 | §7.1 (component tree), §7.2 (state), §7.4 (design system) |
| Server Action: setTemperature | §2.3 | UC-HVAC-01, UC-AUTH-02, UC-AUDIT-01 | §3.4 (Zod + Prisma + revalidatePath + audit) |
| API: building CRUD | §2.4 | — | §3.2 (URL schema) |
| E2E: HVAC journey | §2.5 | UC-HVAC-01 | §7.1 (page structure, Server Action) |
| SSE: useSSE hook | §3.1 | UC-STRM-01 | §7.3 (EventSource lifecycle) |
| Telemetry: message schema | §3.2 | UC-SYS-01 | §4.1-4.2 (MQTT payload) |
| Auth: checkAccess matrix | §3.3 | UC-AUTH-02 | §6.2-6.3 (JWT roles, building scope) |
| Gateway: Python tests | §3.4 | UC-SYS-01, UC-SYS-05/06 | §5.1-5.4 (BACnet/Modbus/MQTT) |
| ML: inference timeout | §3.5 | UC-SYS-04 | §8.2 (latency targets), §8.4 (ONNX) |
