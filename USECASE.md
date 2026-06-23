# BMC — Use Case Specification

> **Role:** Defines actors, goals, scenarios, and module requirements
> **Modules:** HVAC, Lighting, Security, Energy & Analytics, Alarms & Faults, Fire Safety, Elevators, System Integration, SDUI Dashboard
> **Output to:** `DESIGN.md` (architecture decisions), `TESTING.md` (verification contracts), `AGENTS.md` (operational rules)
> **Audience:** Stakeholders validating scope, engineers designing interactions
> **Graphify:** Use `graphify explain` to map use case requirements to existing implementation logic
> **Directive D1:** When modifying this doc, web-search all referenced library APIs and patterns for current correctness

---

## Table of Contents

1. [Actors](#1-actors)
2. [Use Case Catalog](#2-use-case-catalog)
3. [Actor-Use Case Matrix](#3-actor-use-case-matrix)
4. [Use Case Relationships](#4-use-case-relationships)
5. [Critical Flow Details](#5-critical-flow-details)

---

## 1. Actors

### 1.1 Human Actors

| Actor | Role | Domain | Typical Day |
|-------|------|--------|-------------|
| **Building Operator** | Daily ops, setpoint changes, alarm ack | HVAC, Lighting, Security | Monitors dashboards, responds to comfort complaints, adjusts schedules |
| **Facility Manager** | Cross-building oversight, energy budgeting, maintenance | Energy, Analytics, Reports | Reviews KPI reports, approves maintenance work orders |
| **Security Officer** | Access control, incident response, audit | Security, Fire Safety, Elevators | Reviews access logs, manages credential revocations |
| **Energy Manager** | Energy optimization, demand response, carbon reporting | Energy, HVAC, Analytics | Tunes HVAC schedules, verifies DR events, generates compliance reports |
| **Technician** | Field maintenance, diagnostics, repair | HVAC, Lighting, Elevators | Receives fault alerts, runs diagnostics, closes work orders |
| **Tenant** | Zone-level comfort within permission scope | HVAC, Lighting | Adjusts personal zone temperature, reports issues |
| **System Administrator** | User mgmt, role assignments, system config | All (admin) | Onboards buildings, audits access, configures integrations |
| **SuperAdmin** | Portfolio config, billing, SLA mgmt | All (superadmin) | Multi-tenant RBAC, audit trails, system-wide overrides |
| **Medical Officer** | Biomedical lab/env monitoring, cold storage, cleanroom | HVAC, Bio, Security | Monitors lab conditions, responds to temp excursions, manages medical gas |

### 1.2 System Actors

| Actor | Purpose | Communicates via |
|-------|---------|-----------------|
| **BACnet Gateway** | Polls BACnet/IP devices, publishes to MQTT | MQTT (DESIGN.md §4.2, §5.1) |
| **Modbus Driver** | Reads/writes Modbus RTU/TCP registers | Serial/TCP (DESIGN.md §5.2) |
| **MQTT Broker** | Routes telemetry from gateways to cloud | MQTT/TLS (DESIGN.md §4.1) |
| **ML Engine** | Runs ONNX models for anomaly, forecast, optimization | HTTP API (DESIGN.md §8.4) |
| **Audit Logger** | Records all control actions and sensitive reads | Prisma INSERT (DESIGN.md §11.3) |
| **SSE Distributor** | Fans out telemetry to subscribed browser clients | SSE (DESIGN.md §3.3) |
| **Scheduler** | Materialized view refresh, alarm escalation, daily rollup | HTTP cron (DESIGN.md §9.2) |

---

## 2. Use Case Catalog

### 2.1 HVAC Control

**Requirements & Target Metrics:**

| ID | Requirement | Priority | Target Metric |
|----|------------|----------|---------------|
| HVAC-01 | Per-zone temperature setpoint (16-30°C) | P0 | ±0.5°C tolerance |
| HVAC-02 | Fan speed control (Off/Low/Med/High/Auto) | P0 | <2s actuation latency |
| HVAC-03 | Mode switching (Cool/Heat/Auto/Vent) | P0 | <2s actuation latency |
| HVAC-04 | Schedule-based temperature profiles (time-of-day + day-of-week) | P1 | Profile activation in <2s |
| HVAC-05 | Occupancy-triggered setback (vacant → energy-save mode) | P1 | Detection→setback in <30s |
| HVAC-06 | VAV box per-zone airflow monitoring & control | P2 | ±5% airflow accuracy |
| HVAC-07 | AHU status: supply/return temp, fan, filter pressure drop | P1 | Refresh every 5s |
| HVAC-08 | Chiller plant COP monitoring + staging | P2 | COP reported ±2% |
| HVAC-09 | Boiler status: supply/return temp, flame, efficiency | P2 | Reported per poll cycle |
| HVAC-10 | Economizer free-cooling (enthalpy-based) | P2 | Engaged when AHU outside air < return air enthalpy |

**Use Cases:**

| ID | Name | Primary Actor | DESIGN Ref |
|----|------|---------------|------------|
| UC-HVAC-01 | Set zone temperature setpoint | Operator | §3.4, §7.1 |
| UC-HVAC-02 | Change fan speed | Operator | §3.4 |
| UC-HVAC-03 | Switch HVAC mode | Operator | §3.4 |
| UC-HVAC-04 | Configure time-of-day schedule | Facility Manager | §2.2 (Schedule) |
| UC-HVAC-05 | View zone temperature history | Operator | §3.2, §4.1 |
| UC-HVAC-06 | View AHU status | Operator | §7.1 |
| UC-HVAC-07 | Override schedule for holiday | Facility Manager | §2.2 |

**UC-HVAC-01: Set zone temperature setpoint**

| Field | Value |
|-------|-------|
| **Actor** | Building Operator (also Tenant for own zone) |
| **Precondition** | Authenticated session, user has operator role for building, zone exists |
| **Postcondition** | Zone setpoint updated in DB, BACnet gateway notified, SSE broadcast new value, audit log created |
| **Trigger** | Operator moves slider or types value on ZoneTempControl |

**Basic Flow:**
1. System displays current temperature + setpoint for zone
2. Operator enters new setpoint (16-30°C)
3. System validates: range, type, zone access via checkAccess (DESIGN.md §6.3)
4. System persists to DB (HVACUnit.updateMany where zoneId)
5. System sends async command to BACnet gateway (fire-and-forget, DESIGN.md §5.1)
6. System invalidates RSC cache (revalidatePath)
7. System returns success + applied setpoint
8. SSE stream broadcasts updated setpoint to connected clients (DESIGN.md §3.3)
9. Audit log records: action=SET_SETPOINT, user, zone, before/after (DESIGN.md §11.3)

**Alternative Flows:**
- **2a.** Setpoint out of range → System rejects with validation error, field stays at previous value
- **3a.** Network partition → Server Action fails 5xx → Frontend shows error, retry on submit
- **5a.** BACnet gateway offline → DB updated, gateway command queued (MQTT Last Will)
- **8a.** User session expired → Edge middleware redirects to login, form returns 401

**Includes:** UC-AUTH-02 (Authorize), UC-AUDIT-01 (Log action)

**UC-HVAC-02: Change fan speed**

| Field | Value |
|-------|-------|
| **Actor** | Building Operator |
| **Precondition** | Authenticated, operator role, zone has HVAC unit with variable fan |
| **Postcondition** | Fan speed updated in DB + gateway + SSE + audit |
| **Basic Flow:** | Select speed → validate → persist → notify gateway → SSE broadcast → audit |

---

### 2.2 Lighting Control

**Requirements & Target Metrics:**

| ID | Requirement | Priority | Target Metric |
|----|------------|----------|---------------|
| LGT-01 | Per-zone dimming (0-100%) via slider | P0 | <200ms slider response |
| LGT-02 | On/Off toggle per zone | P0 | <500ms actuation |
| LGT-03 | Lighting scene activation (Presentation, Cleaning, Emergency) | P1 | Scene switch in <1s |
| LGT-04 | Schedule-based zone lighting profile | P1 | Activates at scheduled time ±30s |
| LGT-05 | Zone/subystem-level energy consumption view | P2 | kWh, cost, trend |

**Use Cases:**

| ID | Name | Primary Actor | DESIGN Ref |
|----|------|---------------|------------|
| UC-LGT-01 | Set zone dimming level | Operator | §3.4, §7.1 |
| UC-LGT-02 | Toggle zone lights on/off | Operator | §3.4 |
| UC-LGT-03 | Activate lighting scene | Facility Manager | §2.2 |
| UC-LGT-04 | Schedule zone lighting profile | Facility Manager | §2.2 (Schedule) |
| UC-LGT-05 | View lighting energy consumption | Energy Manager | §3.2 |

**UC-LGT-01: Set zone dimming level**

| Field | Value |
|-------|-------|
| **Actor** | Building Operator |
| **Precondition** | Authenticated, operator role, zone has DALI or dimmer channel |
| **Postcondition** | Dimming level updated in DB, DALI command sent, SSE broadcast, audit logged |
| **Basic Flow:** | Display current level → operator adjusts slider → validate 0-100 → persist → send DALI command via gateway → return new state → audit |
| **Alt:** | Slider rapid drag → debounce 300ms before sending |

---

### 2.3 Security & Access Control

**Requirements & Target Metrics:**

| ID | Requirement | Priority | Target Metric |
|----|------------|----------|---------------|
| SEC-01 | Per-door lock/unlock control | P0 | <500ms actuation |
| SEC-02 | Door status: locked, unlocked, open, forced | P0 | <1s status update |
| SEC-03 | Real-time alarm feed with severity, type, zone, timestamp | P0 | <2s from event to display |
| SEC-04 | Alarm acknowledge + comment | P0 | <200ms ack latency |
| SEC-05 | Stale alarm escalation to facilities after N minutes | P1 | Escalation at configured interval |
| SEC-06 | Temporary visitor access grant (time-bounded) | P1 | Credential active within 5s of grant |
| SEC-07 | View access audit trail by user, door, time range | P1 | <3s query for 90-day range |
| SEC-08 | Credential revocation | P1 | Revoked within 30s across all doors |

**Use Cases:**

| ID | Name | Primary Actor | DESIGN Ref |
|----|------|---------------|------------|
| UC-SEC-01 | Lock/unlock door | Security Officer | §3.4, §6.3 |
| UC-SEC-02 | View door status | Security Officer | §3.2, §7.1 |
| UC-SEC-03 | View alarm feed | Security Officer | §3.2, §7.1 |
| UC-SEC-04 | Acknowledge alarm | Security Officer | §3.2 |
| UC-SEC-05 | Escalate stale alarm | Scheduler (system) | §9.2 (cron) |
| UC-SEC-06 | Grant temporary visitor access | Security Officer | §6.3 |
| UC-SEC-07 | View access audit trail | Security Officer | §11.3 |
| UC-SEC-08 | Revoke credential | Admin | §6.4 |

**UC-SEC-01: Lock/unlock door**

| Field | Value |
|-------|-------|
| **Actor** | Security Officer |
| **Precondition** | Authenticated, security role+, door in accessible building |
| **Postcondition** | Door state changed, audit log created, SSE broadcast |
| **Basic Flow:** | Display door status → officer clicks toggle → validate role+building → check current state (if already LOCKED + action=lock → no-op) → persist → send lock command to door controller → audit log DOOR_LOCK/DOOR_UNLOCK → SSE broadcast |
| **Alt:** | Door FORCED → show warning "Door forced open. Lock may not engage until door closed" |
| **Alt:** | Gateway timeout → DB updated optimistically, queued retry, show "Pending — controller offline" |
| **Alt:** | Fire alarm active → lock blocked by override (fire→all doors unlock) |
| **Includes:** UC-AUTH-02, UC-AUDIT-01 |

---

### 2.4 Energy & Analytics

**Requirements & Target Metrics:**

| ID | Requirement | Priority | Target Metric |
|----|------------|----------|---------------|
| ENG-01 | Real-time energy consumption (kW, cumulative kWh) | P0 | <5s refresh |
| ENG-02 | Energy breakdown by subsystem (HVAC, lighting, plugs, elevators) | P1 | Breakdown ±5% accuracy |
| ENG-03 | Energy report generation (PDF, CSV) | P1 | Generated in <30s |
| ENG-04 | EUI trend (kWh/m²/yr) over configurable range | P1 | <3s query |
| ENG-05 | Demand response event: execute load shed, verify reduction | P2 | Verification in <1min |
| ENG-06 | Carbon emissions dashboard (kgCO₂, tCO₂e) | P2 | <5s refresh |

**Use Cases:**

| ID | Name | Primary Actor | DESIGN Ref |
|----|------|---------------|------------|
| UC-ENR-01 | View real-time energy consumption | Energy Manager | §3.2, §7.1 |
| UC-ENR-02 | View energy breakdown by subsystem | Energy Manager | §3.2 |
| UC-ENR-03 | Generate energy report | Energy Manager | §3.2 |
| UC-ENR-04 | View EUI trend | Facility Manager | §8.4 |
| UC-ENR-05 | Execute demand response event | Energy Manager | §8.2 |
| UC-ENR-06 | View carbon emissions dashboard | Facility Manager | §8.4 |

---

### 2.5 Alarms & Faults

**Requirements & Target Metrics:**

| ID | Requirement | Priority | Target Metric |
|----|------------|----------|---------------|
| ALM-01 | Active alarm list with severity, type, zone, timestamp, status | P0 | <2s load |
| ALM-02 | Alarm acknowledge + comment | P0 | <200ms |
| ALM-03 | Alarm history search (severity, type, date range, zone) | P1 | <3s for 90-day range |
| ALM-04 | Configurable alarm thresholds per device type | P1 | Update propagates in <5s |
| ALM-05 | Stale alarm escalation (N minutes → Slack/PagerDuty) | P1 | Escalation within 1min of timeout |

**Use Cases:**

| ID | Name | Primary Actor | DESIGN Ref |
|----|------|---------------|------------|
| UC-ALM-01 | View active alarm list | Operator | §3.2 |
| UC-ALM-02 | Acknowledge alarm | Operator | §3.2 |
| UC-ALM-03 | View alarm history | Facility Manager | §3.2 |
| UC-ALM-04 | Configure alarm thresholds | Facility Manager | §12.1 |
| UC-ALM-05 | Escalate stale alarm | Scheduler (system) | §9.2 |

**UC-ALM-02: Acknowledge alarm**
| **Actor** | Operator (Security for security alarms) |
| **Precondition** | Alarm in open state, user has building access |
| **Postcondition** | Alarm acknowledged, audit entry, notification dismissed |
| **Basic Flow:** | Display alarm → operator clicks ack → validate → update state → log → dismiss notification → if not resolved in N min → escalate (UC-ALM-05) |

---

### 2.6 Fire Safety

**Requirements & Target Metrics:**

| ID | Requirement | Priority | Target Metric |
|----|------------|----------|---------------|
| FIR-01 | Fire alarm panel status: normal, alarm, fault, disconnected | P0 | <2s status update |
| FIR-02 | Per-device states: smoke, heat, flow, tamper, manual call point | P1 | <2s per-device update |
| FIR-03 | Fire alarm override (false alarm clear) by authorized role | P1 | Override propagates in <5s |

**Use Cases:**

| ID | Name | Primary Actor | DESIGN Ref |
|----|------|---------------|------------|
| UC-FIR-01 | View fire alarm panel status | Security Officer | §7.1 |
| UC-FIR-02 | View fire device states | Security Officer | §3.2 |
| UC-FIR-03 | Override fire alarm | Security Officer | §3.4 |

---

### 2.7 Elevators

**Requirements & Target Metrics:**

| ID | Requirement | Priority | Target Metric |
|----|------------|----------|---------------|
| ELE-01 | Elevator status: position, direction, door state, fault | P0 | <2s status update |
| ELE-02 | Elevator recall to floor (manual or fire alarm auto-triggered) | P0 | Recall command in <1s |
| ELE-03 | Elevator car CCTV stream view (on demand) | P2 | <3s stream start |

**Use Cases:**

| ID | Name | Primary Actor | DESIGN Ref |
|----|------|---------------|------------|
| UC-FIR-04 | View elevator status | Operator | §7.1 |
| UC-FIR-05 | Recall elevator to floor | Security Officer | §3.4 |
| UC-FIR-06 | View elevator car CCTV | Security Officer | §3.2 |

**UC-FIR-05: Recall elevator to floor**
| **Actor** | Security Officer (or system auto-triggered) |
| **Precondition** | Fire alarm active OR manual command; user has security role |
| **Postcondition** | Elevator moves to recall floor, doors open, car locked |
| **Basic Flow:** | Fire panel detects alarm → SSE alarm event → system auto-sends recall → dashboard animates position → SSE broadcast elevator state → doors open at recall floor → "Do Not Enter" indicator → audit log: ELEVATOR_RECALL |
| **Alt:** | False alarm → officer overrides (UC-FIR-03) → alarm cleared, elevators return to normal |
| **Interlock:** | Fire alarm active → all doors unlock; lock function disabled while alarm active |

---

### 2.8 System Integration

**Use Cases:**

| ID | Name | Primary Actor | DESIGN Ref |
|----|------|---------------|------------|
| UC-SYS-01 | Ingest telemetry from BACnet gateway | BACnet Gateway | §4.1 |
| UC-SYS-02 | Write setpoint to BACnet device | System | §5.2 |
| UC-SYS-03 | Discover new BACnet devices | System | §5.3 |
| UC-SYS-04 | Publish ML anomaly score | ML Engine | §8.4 |
| UC-SYS-05 | Buffer telemetry offline | BACnet Gateway | §5.4 |
| UC-SYS-06 | Replay buffered telemetry on reconnect | BACnet Gateway | §5.4 |

**UC-SYS-01: Ingest telemetry from BACnet gateway**
| **Actor** | BACnet Gateway |
| **Precondition** | MQTT broker reachable, telemetry topic exists |
| **Postcondition** | Sensor value updated in DB, SSE broadcast to subscribers |
| **Basic Flow:** | Gateway publishes MQTT → cloud subscriber receives → Zod validate (buildingId, deviceId, type, value, unit, ts, quality) → update Sensor row + latest value → check alarm thresholds → SSE broadcast → quality < 50 → increment data quality counter |

---

### 2.9 Biomedical Campus (BIO)

**Context:** Biomedical Campus is Indonesia's first integrated smart building for healthcare, technology, and education — dual-tower (Knowledge Tower + Science Tower) in the Digital Hub SEZ, BSD City.

**Requirements & Target Metrics:**

| ID | Requirement | Priority | Target Metric |
|----|------------|----------|---------------|
| BIO-01 | Lab cold storage monitoring (2-8°C, -20°C, -80°C freezers) | P0 | Excursion alert <30s |
| BIO-02 | Medical gas line pressure monitoring (O₂, N₂, CO₂, medical air) | P0 | Pressure alert <30s |
| BIO-03 | Cleanroom HEPA filter differential pressure + particle count | P1 | Report every 60s |
| BIO-04 | VMS integration — Face Recognition + QR Code access to restricted zones | P1 | Auth <3s per entry |
| BIO-05 | VOC and airborne contaminant monitoring in lab/clinical zones | P1 | Threshold alert <60s |
| BIO-06 | BSL-2/BSL-3 biosafety environment parameters (temp, humidity, pressure cascade) | P2 | Cascade reversal alert <10s |

**Use Cases:**

| ID | Name | Primary Actor | DESIGN Ref |
|----|------|---------------|------------|
| UC-BIO-01 | Monitor lab cold storage temp | Medical Officer | §7.1 |
| UC-BIO-02 | Monitor medical gas pressure | Medical Officer | §3.2 |
| UC-BIO-03 | Monitor cleanroom HEPA + particle count | Medical Officer | §7.1 |
| UC-BIO-04 | Manage VMS access zone | Security Officer | §6.3 |
| UC-BIO-05 | View VOC/air quality in lab zones | Medical Officer | §3.2 |
| UC-BIO-06 | Configure biosafety env thresholds | Facility Manager | §12.1 |

**UC-BIO-01: Monitor lab cold storage temperature**

| Field | Value |
|-------|-------|
| **Actor** | Medical Officer |
| **Precondition** | Authenticated, building access, Science Tower zone |
| **Postcondition** | Temperature excursion detected → alarm created → SSE broadcast |
| **Trigger** | 30-second polling cycle on lab temp sensors |
| **Basic Flow:** | Sensor reports temp → system compares to threshold (2-8°C, -20°C, -80°C depending on sensor) → if outside range → create Alarm(LAB_TEMP_EXCURSION, severity=critical) → SSE broadcast → audit log |
| **Alt:** | Door opened briefly → temp spike but recovers in <5min → no alarm (smart debounce) |
| **Alt:** | Power loss to freezer → sustained excursion → escalate to Medical Officer and Facility Manager |
| **Includes:** | UC-AUTH-02, UC-AUDIT-01 |

**UC-BIO-02: Monitor medical gas pressure**

| Field | Value |
|-------|-------|
| **Actor** | Medical Officer |
| **Precondition** | ST gas lines monitored, pressure sensors online |
| **Postcondition** | Pressure drop → alarm created → auto-switch to backup tank |
| **Basic Flow:** | O₂ line sensor reads pressure → below 45 psi → Alarm(MEDICAL_GAS_DROP, severity=critical) → SSE broadcast → system triggers backup tank valve → audit log |
| **Includes:** | UC-AUTH-02, UC-AUDIT-01 |

**UC-BIO-03: Monitor cleanroom HEPA + particle count**

| Field | Value |
|-------|-------|
| **Actor** | Medical Officer |
| **Precondition** | HEPA filter sensors installed in ST lab zones |
| **Postcondition** | Filter differential pressure trend logged; particle count threshold checked |
| **Basic Flow:** | HEPA ΔP sensor reads elevated → Alarm(HEPA_FILTER_CLOG, severity=warning) → particle count verifies ISO class → SSE broadcast → maintenance scheduled |
| **Includes:** | UC-AUTH-02, UC-AUDIT-01 |

**UC-BIO-04: Manage VMS access zone**

| Field | Value |
|-------|-------|
| **Actor** | Security Officer |
| **Precondition** | VMS system operational at both tower entrances |
| **Postcondition** | Access credential updated in VMS database |
| **Basic Flow:** | New tenant staff → officer registers face/QR in VMS → biometric enrolled → zone access configured → audit log: VMS_ACCESS_GRANT |
| **Alt:** | Access revoked → removal from VMS → all biometric entries invalidated within 30s |
| **Includes:** | UC-AUTH-02, UC-AUDIT-01 |

**UC-BIO-05: View VOC/air quality in lab zones**

| Field | Value |
|-------|-------|
| **Actor** | Medical Officer |
| **Basic Flow:** | Dashboard shows VOC (ppb), particle count, temp, humidity per lab zone → SSE updates every 30s → color-coded (green/amber/red vs threshold) |
| **Includes:** | UC-AUTH-02 |

---

### 2.10 Cross-Cutting

| ID | Name | Primary Actor | DESIGN Ref | Description |
|----|------|---------------|------------|-------------|
| UC-AUTH-01 | Authenticate | All human actors | §6.1 | Login via NextAuth + JWT |
| UC-AUTH-02 | Authorize action | System | §6.3 | checkAccess(user, buildingId, minRole) on every mutation |
| UC-AUDIT-01 | Log control action | System | §11.3 | Persist userId, action, target, detail, buildingId, ip, agent |
| UC-STRM-01 | Subscribe to telemetry stream | Browser | §4.3, §7.3 | EventSource connects, receives SSE events |
| UC-SCHD-01 | Execute scheduled task | Scheduler | §9.2 | CRON: materialized views, alarm escalation, daily rollup |

**UC-AUTH-02: Authorize action** — Included by every control UC
| **Precondition** | Authenticated user session exists |
| **Postcondition** | Access granted → proceed, or 403 Forbidden |
| **Basic Flow:** | Receive (userId, action, target buildingId, minRole) → lookup role from session → check buildingIds.includes(target) → check roleWeight >= roleWeight(minRole) → both pass → return (continue) → either fail → throw Forbidden |

---

### 2.11 Smart Dynamic Dashboard (SDUI)

**Requirements:**

| ID | Requirement | Priority | Target Metric |
|----|-------------|----------|---------------|
| DSH-01 | Dashboard renders from backend UI config | P0 | <500ms initial render |
| DSH-02 | Unknown widget types show fallback, not crash | P1 | Zero uncaught exceptions |

**Use Cases:**

| ID | Name | Primary Actor | DESIGN Ref |
|----|------|---------------|------------|
| UC-DSH-01 | View smart dashboard | Building Operator | §3.2, §7.1, §7.3 |
| UC-DSH-02 | Dashboard adapts to building configuration | System (SDUI service) | §3.2, §7.1 |
| UC-DSH-03 | Handle unknown widget type gracefully | System (renderer) | §7.1 |

**UC-DSH-01: View smart dashboard**

| Field | Value |
|-------|-------|
| **Actor** | Building Operator (all roles with building access) |
| **Precondition** | Authenticated, has building access |
| **Postcondition** | Dynamic widget grid rendered based on building's zone devices |
| **Trigger** | User navigates to /building/dashboard |

**Basic Flow:**
1. System requests GET /api/buildings/[id]/ui-config
2. Server introspects DB → builds UiConfigResponse with zones + widgets
3. DashboardGrid receives config → creates layout
4. SDUIRenderer renders each WidgetConfig by type
5. Widget subscribes to SSE for real-time data

**Alternative Flows:**
- **2a.** Building has no zones → UiConfig returns empty zones array → dashboard shows "No configured widgets" with guidance
- **3a.** API request fails (network/server error) → DashboardGrid shows error state with retry button
- **5a.** SSE connection fails → Widget shows stale data with "Offline" indicator, auto-reconnects

**Includes:** UC-AUTH-02 (Authorize), UC-STRM-01 (Subscribe to telemetry stream)

**UC-DSH-02: Dashboard adapts to building configuration**

| Field | Value |
|-------|-------|
| **Actor** | System (SDUI service) |
| **Precondition** | Building zones have HVAC/lighting/door/sensor devices |
| **Postcondition** | UiConfig contains correct widgets per zone |
| **Trigger** | Dashboard page load |

**Basic Flow:**
1. Service queries Zone with related HVACUnit, LightZone, Door, Sensor
2. Derives WidgetConfig for each zone
3. Appends global widgets (AlarmList, MeterGauge, FirePanelCard)
4. Returns versioned UiConfigResponse

**Alternative Flows:**
- **2a.** Zone has no devices → no widgets for that zone
- **2b.** Zone only has sensors → only HvacCard/SensorReadout widgets for that zone
- **3a.** All zones empty → dashboard shows "No configured widgets" with guidance

**UC-DSH-03: Handle unknown widget type gracefully**

| Field | Value |
|-------|-------|
| **Actor** | System (renderer) |
| **Precondition** | WidgetConfig.type not found in widget registry |
| **Postcondition** | UnknownWidget fallback rendered with safe defaults |
| **Trigger** | SDUIRenderer receives unrecognized WidgetConfig |

**Basic Flow:**
1. SDUIRenderer receives WidgetConfig
2. Type not found in widgetRegistry
3. Renders UnknownWidget showing type name + "widget not available" message
4. No crash, no blank space

---

## 3. Actor-Use Case Matrix

| Use Case | Operator | Facility Mgr | Security | Energy Mgr | Technician | Tenant | Admin | SuperAdmin | Medical Officer |
|----------|----------|-------------|----------|------------|------------|--------|-------|------------|----------------|
| UC-HVAC-01 set setpoint | ✓ | ✓ | — | ✓ | — | ✓(zone) | — | ✓ | — |
| UC-HVAC-02 fan speed | ✓ | ✓ | — | ✓ | — | — | — | ✓ | — |
| UC-HVAC-03 mode switch | ✓ | ✓ | — | ✓ | — | — | — | ✓ | — |
| UC-HVAC-04 schedule | — | ✓ | — | ✓ | — | — | ✓ | ✓ | — |
| UC-HVAC-05 view history | ✓ | ✓ | — | ✓ | ✓ | ✓(zone) | ✓ | ✓ | — |
| UC-LGT-01 dimming | ✓ | ✓ | — | — | — | ✓(zone) | — | ✓ | — |
| UC-LGT-02 toggle | ✓ | ✓ | — | — | ✓ | ✓(zone) | — | ✓ | — |
| UC-SEC-01 lock/unlock | — | — | ✓ | — | — | — | ✓ | ✓ | — |
| UC-SEC-03 view alarms | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | — |
| UC-SEC-04 ack alarm | ✓ | ✓ | ✓(sec) | — | ✓ | — | ✓ | ✓ | — |
| UC-SEC-08 revoke credential | — | — | — | — | — | — | ✓ | ✓ | — |
| UC-ENR-01 view energy | ✓ | ✓ | — | ✓ | — | — | ✓ | ✓ | — |
| UC-ENR-05 execute DR | — | — | — | ✓ | — | — | — | ✓ | — |
| UC-FIR-01 fire panel | — | — | ✓ | — | ✓ | — | — | ✓ | — |
| UC-FIR-05 elevator recall | — | — | ✓ | — | — | — | — | ✓ | — |
| UC-BIO-01 cold storage | — | ✓ | — | — | — | — | — | ✓ | ✓ |
| UC-BIO-02 medical gas | — | ✓ | — | — | — | — | — | ✓ | ✓ |
| UC-BIO-03 HEPA/particle | — | ✓ | — | — | ✓ | — | — | ✓ | ✓ |
| UC-BIO-04 VMS access | — | — | ✓ | — | — | — | ✓ | ✓ | — |
| UC-BIO-05 VOC/air quality | — | ✓ | — | — | — | — | — | ✓ | ✓ |
| UC-BIO-06 biosafety config | — | ✓ | — | — | — | — | — | ✓ | ✓ |
| UC-DSH-01 view dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| UC-DSH-02 adapt to building | system | system | system | system | system | system | system | system | system |
| UC-DSH-03 unknown widget | system | system | system | system | system | system | system | system | system |
| UC-AUTH-02 authorize | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| UC-AUDIT-01 log action | auto | auto | auto | auto | auto | auto | auto | auto | auto |

---

## 4. Use Case Relationships

### 4.1 Include (mandatory dependency)

Every control UC includes UC-AUTH-02 (Authorize) and UC-AUDIT-01 (Log):

```
UC-HVAC-01 (Set setpoint)
  ├── include → UC-AUTH-02 (Authorize: operator role, building access)
  ├── include → UC-AUDIT-01 (Log: action, user, target, timestamp)
  └── extend ← UC-HVAC-07 (Holiday override) [condition: holiday flag set]
```

### 4.2 Extend (conditional)

| Base UC | Extension | Condition |
|---------|-----------|-----------|
| UC-HVAC-01 Set setpoint | UC-HVAC-07 Holiday override | Schedule has holiday flag |
| UC-SEC-01 Lock/unlock door | UC-SEC-04 Acknowledge alarm | Door forced→alarm must be ack'd before relock |
| UC-FIR-05 Elevator recall | UC-FIR-01 Fire panel status | Recall auto-triggers when fire alarm active |
| UC-ENR-05 Execute DR | UC-ENR-01 View energy consumption | DR event→dashboard switches to DR mode |

### 4.3 Generalization (inheritance)

```
Control Action (abstract)
  ├── Set Temperature (UC-HVAC-01)
  ├── Set Dimming (UC-LGT-01)
  ├── Lock Door (UC-SEC-01)
  └── Elevator Recall (UC-FIR-05)
    All: include UC-AUTH-02, include UC-AUDIT-01

Alarm Handler (abstract)
  ├── Acknowledge (UC-ALM-02)
  └── Escalate (UC-ALM-05)
    All: include UC-AUTH-02, include UC-AUDIT-01
```

---

## 5. Critical Flow Details

### 5.1 Full Walkthrough: Operator Changes HVAC Setpoint

```
ACTOR: Building Operator (role: operator, buildings: [b1])
TRIGGER: 09:30 — Tenant complains zone 3F-North is too warm (27°C)
PRECONDITIONS: Zone z1, Building b1, user u1 authenticated

 1. OPERATOR opens /building/b1/hvac
```

---

## 6. Failure & Edge-Case Scenarios

### 6.1 Network Partition Scenarios

| Scenario | Impact | Mitigation | Test Coverage |
|----------|--------|------------|---------------|
| BACnet gateway unreachable | Telemetry stops, control commands lost | MQTT Last Will + local buffer (DESIGN.md §4.5, §5.4) | TESTING.md §3.1 (SSE reconnection), §3.2 (telemetry schema) |
| MQTT broker unreachable | Telemetry queue grows, gateway buffers 7-day | Local SQLite buffer, replay on reconnect (UC-SYS-05/06) | TESTING.md §3.2 (telemetry schema) |
| DB connection lost | Server Actions fail, no persistence | Connection pool retry, circuit breaker, 503 response | TESTING.md §2.3 (Server Action error handling) |
| Cloud API unreachable | SSE broadcast fails, clients stale | EventSource auto-reconnect, snapshot replay on restore | TESTING.md §3.1 (SSE lifecycle) |

### 6.2 Concurrent Modification Scenarios

| Scenario | Impact | Mitigation | Test Coverage |
|----------|--------|------------|---------------|
| Two operators change same zone setpoint within 1s | Race condition, last-write-wins | Prisma `updateMany` atomicity, audit log records both | TESTING.md §2.3 (concurrent mutation tests) |
| Operator + schedule both trigger setpoint change | Conflicting values | Schedule priority overrides manual during active window | TESTING.md §3.5 (schedule conflict) |
| Tenant zone change vs operator override | Permission boundary conflict | checkAccess enforces zone ownership (UC-AUTH-02) | TESTING.md §3.3 (auth matrix) |

### 6.3 Rate Limiting & Throttling Scenarios

| Scenario | Impact | Mitigation | Test Coverage |
|----------|--------|------------|---------------|
| User exceeds 60 control actions/minute | Abuse, potential DDoS vector | Token bucket (60/min/user), HTTP 429 + Retry-After | E2E rate limit spec |
| Gateway command queue backlog | Stale setpoints, user confusion | Queue depth alert (>100), retry with exponential backoff | TESTING.md §3.2 (gateway queue) |
| SSE fan-out at >500 connections/building | Memory pressure, latency | Horizontal scaling alert, connection pooling | TESTING.md §3.1 (SSE scalability) |

### 6.4 Session & Auth Failure Scenarios

| Scenario | Impact | Mitigation | Test Coverage |
|----------|--------|------------|---------------|
| User token expires mid-SSE stream | Stream disconnects, stale data | EventSource reconnect → 401 → redirect to login | E2E auth spec |
| Session hijack via XSS | Unauthorized control | HttpOnly cookies, CSP headers, CSRF tokens | TESTING.md §3.3 (auth matrix) |
| Role downgrade during active session | Privilege escalation | checkAccess on every Server Action (UC-AUTH-02) | TESTING.md §3.3 (role boundary) |

### 6.5 IoT Device Failure Scenarios

| Scenario | Impact | Mitigation | Test Coverage |
|----------|--------|------------|---------------|
| BACnet device unresponsive | Control command fails, stale data | Timeout + retry (3x), alert if >3 polls missed | TESTING.md §3.2 (telemetry schema) |
| Modbus register read error | Legacy device data gap | Fallback to last known value, log warning | TESTING.md §3.2 (telemetry schema) |
| MQTT topic hijack (rogue device) | Spoofed telemetry | Topic ACL + client certs + payload HMAC | TESTING.md §3.2 (telemetry schema) |
| Device firmware update in progress | Temporary data loss | Graceful degradation, show "updating" state | E2E device lifecycle |

### 6.6 ML Inference Failure Scenarios

| Scenario | Impact | Mitigation | Test Coverage |
|----------|--------|------------|---------------|
| ONNX model load failure | Anomaly detection offline | Fallback to rule-based thresholds, alert data team | TESTING.md §3.5 (ML inference) |
| Inference timeout (>5s) | Delayed anomaly alerts | Circuit breaker, skip batch, retry next cycle | TESTING.md §3.5 (ML inference) |
| Model drift >2σ | False positives/negatives increase | Automated retraining trigger, human review | TESTING.md §3.5 (ML inference) |

### 6.7 Audit & Compliance Failure Scenarios

| Scenario | Impact | Mitigation | Test Coverage |
|----------|--------|------------|---------------|
| Audit log write failure | Compliance gap, no trace | Retry with backoff, fallback to local log, alert | TESTING.md §2.3 (audit log creation) |
| Audit log tampering (DB compromise) | Evidence destruction | Append-only table, integrity hash, offsite backup | E2E audit spec |
| Missing audit entry for control action | Regulatory non-compliance | Block action if audit write fails (fail-closed) | TESTING.md §2.3 (audit log creation) |

---
