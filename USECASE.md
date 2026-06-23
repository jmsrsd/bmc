1|# BMC — Use Case Specification
2|
3|> **Role:** Defines actors, goals, scenarios, and module requirements
4|> **Modules:** HVAC, Lighting, Security, Energy & Analytics, Alarms & Faults, Fire Safety, Elevators, System Integration
5|> **Output to:** `DESIGN.md` (architecture decisions), `TESTING.md` (verification contracts), `AGENTS.md` (operational rules)
6|> **Audience:** Stakeholders validating scope, engineers designing interactions
7|> **Graphify:** Use `graphify explain` to map use case requirements to existing implementation logic
8|> **Directive D1:** When modifying this doc, web-search all referenced library APIs and patterns for current correctness
9|
10|---
11|
12|## Table of Contents
13|
14|1. [Actors](#1-actors)
15|2. [Use Case Catalog](#2-use-case-catalog)
16|3. [Actor-Use Case Matrix](#3-actor-use-case-matrix)
17|4. [Use Case Relationships](#4-use-case-relationships)
18|5. [Critical Flow Details](#5-critical-flow-details)
19|
20|---
21|
22|## 1. Actors
23|
24|### 1.1 Human Actors
25|
26|| Actor | Role | Domain | Typical Day |
27||-------|------|--------|-------------|
28|| **Building Operator** | Daily ops, setpoint changes, alarm ack | HVAC, Lighting, Security | Monitors dashboards, responds to comfort complaints, adjusts schedules |
29|| **Facility Manager** | Cross-building oversight, energy budgeting, maintenance | Energy, Analytics, Reports | Reviews KPI reports, approves maintenance work orders |
30|| **Security Officer** | Access control, incident response, audit | Security, Fire Safety, Elevators | Reviews access logs, manages credential revocations |
31|| **Energy Manager** | Energy optimization, demand response, carbon reporting | Energy, HVAC, Analytics | Tunes HVAC schedules, verifies DR events, generates compliance reports |
32|| **Technician** | Field maintenance, diagnostics, repair | HVAC, Lighting, Elevators | Receives fault alerts, runs diagnostics, closes work orders |
33|| **Tenant** | Zone-level comfort within permission scope | HVAC, Lighting | Adjusts personal zone temperature, reports issues |
34|| **System Administrator** | User mgmt, role assignments, system config | All (admin) | Onboards buildings, audits access, configures integrations |
35|| **SuperAdmin** | Portfolio config, billing, SLA mgmt | All (superadmin) | Multi-tenant RBAC, audit trails, system-wide overrides |
36|| **Medical Officer** | Biomedical lab/env monitoring, cold storage, cleanroom | HVAC, Bio, Security | Monitors lab conditions, responds to temp excursions, manages medical gas |
37|
38|### 1.2 System Actors
39|
40|| Actor | Purpose | Communicates via |
41||-------|---------|-----------------|
42|| **BACnet Gateway** | Polls BACnet/IP devices, publishes to MQTT | MQTT (DESIGN.md §4.2, §5.1) |
43|| **Modbus Driver** | Reads/writes Modbus RTU/TCP registers | Serial/TCP (DESIGN.md §5.2) |
44|| **MQTT Broker** | Routes telemetry from gateways to cloud | MQTT/TLS (DESIGN.md §4.1) |
45|| **ML Engine** | Runs ONNX models for anomaly, forecast, optimization | HTTP API (DESIGN.md §8.4) |
46|| **Audit Logger** | Records all control actions and sensitive reads | Prisma INSERT (DESIGN.md §11.3) |
47|| **SSE Distributor** | Fans out telemetry to subscribed browser clients | SSE (DESIGN.md §3.3) |
48|| **Scheduler** | Materialized view refresh, alarm escalation, daily rollup | HTTP cron (DESIGN.md §9.2) |
49|
50|---
51|
52|## 2. Use Case Catalog
53|
54|### 2.1 HVAC Control
55|
56|**Requirements & Target Metrics:**
57|
58|| ID | Requirement | Priority | Target Metric |
59||----|------------|----------|---------------|
60|| HVAC-01 | Per-zone temperature setpoint (16-30°C) | P0 | ±0.5°C tolerance |
61|| HVAC-02 | Fan speed control (Off/Low/Med/High/Auto) | P0 | <2s actuation latency |
62|| HVAC-03 | Mode switching (Cool/Heat/Auto/Vent) | P0 | <2s actuation latency |
63|| HVAC-04 | Schedule-based temperature profiles (time-of-day + day-of-week) | P1 | Profile activation in <2s |
64|| HVAC-05 | Occupancy-triggered setback (vacant → energy-save mode) | P1 | Detection→setback in <30s |
65|| HVAC-06 | VAV box per-zone airflow monitoring & control | P2 | ±5% airflow accuracy |
66|| HVAC-07 | AHU status: supply/return temp, fan, filter pressure drop | P1 | Refresh every 5s |
67|| HVAC-08 | Chiller plant COP monitoring + staging | P2 | COP reported ±2% |
68|| HVAC-09 | Boiler status: supply/return temp, flame, efficiency | P2 | Reported per poll cycle |
69|| HVAC-10 | Economizer free-cooling (enthalpy-based) | P2 | Engaged when AHU outside air < return air enthalpy |
70|
71|**Use Cases:**
72|
73|| ID | Name | Primary Actor | DESIGN Ref |
74||----|------|---------------|------------|
75|| UC-HVAC-01 | Set zone temperature setpoint | Operator | §3.4, §7.1 |
76|| UC-HVAC-02 | Change fan speed | Operator | §3.4 |
77|| UC-HVAC-03 | Switch HVAC mode | Operator | §3.4 |
78|| UC-HVAC-04 | Configure time-of-day schedule | Facility Manager | §2.2 (Schedule) |
79|| UC-HVAC-05 | View zone temperature history | Operator | §3.2, §4.1 |
80|| UC-HVAC-06 | View AHU status | Operator | §7.1 |
81|| UC-HVAC-07 | Override schedule for holiday | Facility Manager | §2.2 |
82|
83|**UC-HVAC-01: Set zone temperature setpoint**
84|
85|| Field | Value |
86||-------|-------|
87|| **Actor** | Building Operator (also Tenant for own zone) |
88|| **Precondition** | Authenticated session, user has operator role for building, zone exists |
89|| **Postcondition** | Zone setpoint updated in DB, BACnet gateway notified, SSE broadcast new value, audit log created |
90|| **Trigger** | Operator moves slider or types value on ZoneTempControl |
91|
92|**Basic Flow:**
93|1. System displays current temperature + setpoint for zone
94|2. Operator enters new setpoint (16-30°C)
95|3. System validates: range, type, zone access via checkAccess (DESIGN.md §6.3)
96|4. System persists to DB (HVACUnit.updateMany where zoneId)
97|5. System sends async command to BACnet gateway (fire-and-forget, DESIGN.md §5.1)
98|6. System invalidates RSC cache (revalidatePath)
99|7. System returns success + applied setpoint
100|8. SSE stream broadcasts updated setpoint to connected clients (DESIGN.md §3.3)
101|9. Audit log records: action=SET_SETPOINT, user, zone, before/after (DESIGN.md §11.3)
102|
103|**Alternative Flows:**
104|- **2a.** Setpoint out of range → System rejects with validation error, field stays at previous value
105|- **3a.** Network partition → Server Action fails 5xx → Frontend shows error, retry on submit
106|- **5a.** BACnet gateway offline → DB updated, gateway command queued (MQTT Last Will)
107|- **8a.** User session expired → Edge middleware redirects to login, form returns 401
108|
109|**Includes:** UC-AUTH-02 (Authorize), UC-AUDIT-01 (Log action)
110|
111|**UC-HVAC-02: Change fan speed**
112|
113|| Field | Value |
114||-------|-------|
115|| **Actor** | Building Operator |
116|| **Precondition** | Authenticated, operator role, zone has HVAC unit with variable fan |
117|| **Postcondition** | Fan speed updated in DB + gateway + SSE + audit |
118|| **Basic Flow:** | Select speed → validate → persist → notify gateway → SSE broadcast → audit |
119|
120|---
121|
122|### 2.2 Lighting Control
123|
124|**Requirements & Target Metrics:**
125|
126|| ID | Requirement | Priority | Target Metric |
127||----|------------|----------|---------------|
128|| LGT-01 | Per-zone dimming (0-100%) via slider | P0 | <200ms slider response |
129|| LGT-02 | On/Off toggle per zone | P0 | <500ms actuation |
130|| LGT-03 | Lighting scene activation (Presentation, Cleaning, Emergency) | P1 | Scene switch in <1s |
131|| LGT-04 | Schedule-based zone lighting profile | P1 | Activates at scheduled time ±30s |
132|| LGT-05 | Zone/subystem-level energy consumption view | P2 | kWh, cost, trend |
133|
134|**Use Cases:**
135|
136|| ID | Name | Primary Actor | DESIGN Ref |
137||----|------|---------------|------------|
138|| UC-LGT-01 | Set zone dimming level | Operator | §3.4, §7.1 |
139|| UC-LGT-02 | Toggle zone lights on/off | Operator | §3.4 |
140|| UC-LGT-03 | Activate lighting scene | Facility Manager | §2.2 |
141|| UC-LGT-04 | Schedule zone lighting profile | Facility Manager | §2.2 (Schedule) |
142|| UC-LGT-05 | View lighting energy consumption | Energy Manager | §3.2 |
143|
144|**UC-LGT-01: Set zone dimming level**
145|
146|| Field | Value |
147||-------|-------|
148|| **Actor** | Building Operator |
149|| **Precondition** | Authenticated, operator role, zone has DALI or dimmer channel |
150|| **Postcondition** | Dimming level updated in DB, DALI command sent, SSE broadcast, audit logged |
151|| **Basic Flow:** | Display current level → operator adjusts slider → validate 0-100 → persist → send DALI command via gateway → return new state → audit |
152|| **Alt:** | Slider rapid drag → debounce 300ms before sending |
153|
154|---
155|
156|### 2.3 Security & Access Control
157|
158|**Requirements & Target Metrics:**
159|
160|| ID | Requirement | Priority | Target Metric |
161||----|------------|----------|---------------|
162|| SEC-01 | Per-door lock/unlock control | P0 | <500ms actuation |
163|| SEC-02 | Door status: locked, unlocked, open, forced | P0 | <1s status update |
164|| SEC-03 | Real-time alarm feed with severity, type, zone, timestamp | P0 | <2s from event to display |
165|| SEC-04 | Alarm acknowledge + comment | P0 | <200ms ack latency |
166|| SEC-05 | Stale alarm escalation to facilities after N minutes | P1 | Escalation at configured interval |
167|| SEC-06 | Temporary visitor access grant (time-bounded) | P1 | Credential active within 5s of grant |
168|| SEC-07 | View access audit trail by user, door, time range | P1 | <3s query for 90-day range |
169|| SEC-08 | Credential revocation | P1 | Revoked within 30s across all doors |
170|
171|**Use Cases:**
172|
173|| ID | Name | Primary Actor | DESIGN Ref |
174||----|------|---------------|------------|
175|| UC-SEC-01 | Lock/unlock door | Security Officer | §3.4, §6.3 |
176|| UC-SEC-02 | View door status | Security Officer | §3.2, §7.1 |
177|| UC-SEC-03 | View alarm feed | Security Officer | §3.2, §7.1 |
178|| UC-SEC-04 | Acknowledge alarm | Security Officer | §3.2 |
179|| UC-SEC-05 | Escalate stale alarm | Scheduler (system) | §9.2 (cron) |
180|| UC-SEC-06 | Grant temporary visitor access | Security Officer | §6.3 |
181|| UC-SEC-07 | View access audit trail | Security Officer | §11.3 |
182|| UC-SEC-08 | Revoke credential | Admin | §6.4 |
183|
184|**UC-SEC-01: Lock/unlock door**
185|
186|| Field | Value |
187||-------|-------|
188|| **Actor** | Security Officer |
189|| **Precondition** | Authenticated, security role+, door in accessible building |
190|| **Postcondition** | Door state changed, audit log created, SSE broadcast |
191|| **Basic Flow:** | Display door status → officer clicks toggle → validate role+building → check current state (if already LOCKED + action=lock → no-op) → persist → send lock command to door controller → audit log DOOR_LOCK/DOOR_UNLOCK → SSE broadcast |
192|| **Alt:** | Door FORCED → show warning "Door forced open. Lock may not engage until door closed" |
193|| **Alt:** | Gateway timeout → DB updated optimistically, queued retry, show "Pending — controller offline" |
194|| **Alt:** | Fire alarm active → lock blocked by override (fire→all doors unlock) |
195|| **Includes:** UC-AUTH-02, UC-AUDIT-01 |
196|
197|---
198|
199|### 2.4 Energy & Analytics
200|
201|**Requirements & Target Metrics:**
202|
203|| ID | Requirement | Priority | Target Metric |
204||----|------------|----------|---------------|
205|| ENG-01 | Real-time energy consumption (kW, cumulative kWh) | P0 | <5s refresh |
206|| ENG-02 | Energy breakdown by subsystem (HVAC, lighting, plugs, elevators) | P1 | Breakdown ±5% accuracy |
207|| ENG-03 | Energy report generation (PDF, CSV) | P1 | Generated in <30s |
208|| ENG-04 | EUI trend (kWh/m²/yr) over configurable range | P1 | <3s query |
209|| ENG-05 | Demand response event: execute load shed, verify reduction | P2 | Verification in <1min |
210|| ENG-06 | Carbon emissions dashboard (kgCO₂, tCO₂e) | P2 | <5s refresh |
211|
212|**Use Cases:**
213|
214|| ID | Name | Primary Actor | DESIGN Ref |
215||----|------|---------------|------------|
216|| UC-ENR-01 | View real-time energy consumption | Energy Manager | §3.2, §7.1 |
217|| UC-ENR-02 | View energy breakdown by subsystem | Energy Manager | §3.2 |
218|| UC-ENR-03 | Generate energy report | Energy Manager | §3.2 |
219|| UC-ENR-04 | View EUI trend | Facility Manager | §8.4 |
220|| UC-ENR-05 | Execute demand response event | Energy Manager | §8.2 |
221|| UC-ENR-06 | View carbon emissions dashboard | Facility Manager | §8.4 |
222|
223|---
224|
225|### 2.5 Alarms & Faults
226|
227|**Requirements & Target Metrics:**
228|
229|| ID | Requirement | Priority | Target Metric |
230||----|------------|----------|---------------|
231|| ALM-01 | Active alarm list with severity, type, zone, timestamp, status | P0 | <2s load |
232|| ALM-02 | Alarm acknowledge + comment | P0 | <200ms |
233|| ALM-03 | Alarm history search (severity, type, date range, zone) | P1 | <3s for 90-day range |
234|| ALM-04 | Configurable alarm thresholds per device type | P1 | Update propagates in <5s |
235|| ALM-05 | Stale alarm escalation (N minutes → Slack/PagerDuty) | P1 | Escalation within 1min of timeout |
236|
237|**Use Cases:**
238|
239|| ID | Name | Primary Actor | DESIGN Ref |
240||----|------|---------------|------------|
241|| UC-ALM-01 | View active alarm list | Operator | §3.2 |
242|| UC-ALM-02 | Acknowledge alarm | Operator | §3.2 |
243|| UC-ALM-03 | View alarm history | Facility Manager | §3.2 |
244|| UC-ALM-04 | Configure alarm thresholds | Facility Manager | §12.1 |
245|| UC-ALM-05 | Escalate stale alarm | Scheduler (system) | §9.2 |
246|
247|**UC-ALM-02: Acknowledge alarm**
248|| **Actor** | Operator (Security for security alarms) |
249|| **Precondition** | Alarm in open state, user has building access |
250|| **Postcondition** | Alarm acknowledged, audit entry, notification dismissed |
251|| **Basic Flow:** | Display alarm → operator clicks ack → validate → update state → log → dismiss notification → if not resolved in N min → escalate (UC-ALM-05) |
252|
253|---
254|
255|### 2.6 Fire Safety
256|
257|**Requirements & Target Metrics:**
258|
259|| ID | Requirement | Priority | Target Metric |
260||----|------------|----------|---------------|
261|| FIR-01 | Fire alarm panel status: normal, alarm, fault, disconnected | P0 | <2s status update |
262|| FIR-02 | Per-device states: smoke, heat, flow, tamper, manual call point | P1 | <2s per-device update |
263|| FIR-03 | Fire alarm override (false alarm clear) by authorized role | P1 | Override propagates in <5s |
264|
265|**Use Cases:**
266|
267|| ID | Name | Primary Actor | DESIGN Ref |
268||----|------|---------------|------------|
269|| UC-FIR-01 | View fire alarm panel status | Security Officer | §7.1 |
270|| UC-FIR-02 | View fire device states | Security Officer | §3.2 |
271|| UC-FIR-03 | Override fire alarm | Security Officer | §3.4 |
272|
273|---
274|
275|### 2.7 Elevators
276|
277|**Requirements & Target Metrics:**
278|
279|| ID | Requirement | Priority | Target Metric |
280||----|------------|----------|---------------|
281|| ELE-01 | Elevator status: position, direction, door state, fault | P0 | <2s status update |
282|| ELE-02 | Elevator recall to floor (manual or fire alarm auto-triggered) | P0 | Recall command in <1s |
283|| ELE-03 | Elevator car CCTV stream view (on demand) | P2 | <3s stream start |
284|
285|**Use Cases:**
286|
287|| ID | Name | Primary Actor | DESIGN Ref |
288||----|------|---------------|------------|
289|| UC-FIR-04 | View elevator status | Operator | §7.1 |
290|| UC-FIR-05 | Recall elevator to floor | Security Officer | §3.4 |
291|| UC-FIR-06 | View elevator car CCTV | Security Officer | §3.2 |
292|
293|**UC-FIR-05: Recall elevator to floor**
294|| **Actor** | Security Officer (or system auto-triggered) |
295|| **Precondition** | Fire alarm active OR manual command; user has security role |
296|| **Postcondition** | Elevator moves to recall floor, doors open, car locked |
297|| **Basic Flow:** | Fire panel detects alarm → SSE alarm event → system auto-sends recall → dashboard animates position → SSE broadcast elevator state → doors open at recall floor → "Do Not Enter" indicator → audit log: ELEVATOR_RECALL |
298|| **Alt:** | False alarm → officer overrides (UC-FIR-03) → alarm cleared, elevators return to normal |
299|| **Interlock:** | Fire alarm active → all doors unlock; lock function disabled while alarm active |
300|
301|---
302|
303|### 2.8 System Integration
304|
305|**Use Cases:**
306|
307|| ID | Name | Primary Actor | DESIGN Ref |
308||----|------|---------------|------------|
309|| UC-SYS-01 | Ingest telemetry from BACnet gateway | BACnet Gateway | §4.1 |
310|| UC-SYS-02 | Write setpoint to BACnet device | System | §5.2 |
311|| UC-SYS-03 | Discover new BACnet devices | System | §5.3 |
312|| UC-SYS-04 | Publish ML anomaly score | ML Engine | §8.4 |
313|| UC-SYS-05 | Buffer telemetry offline | BACnet Gateway | §5.4 |
314|| UC-SYS-06 | Replay buffered telemetry on reconnect | BACnet Gateway | §5.4 |
315|
316|**UC-SYS-01: Ingest telemetry from BACnet gateway**
317|| **Actor** | BACnet Gateway |
318|| **Precondition** | MQTT broker reachable, telemetry topic exists |
319|| **Postcondition** | Sensor value updated in DB, SSE broadcast to subscribers |
320|| **Basic Flow:** | Gateway publishes MQTT → cloud subscriber receives → Zod validate (buildingId, deviceId, type, value, unit, ts, quality) → update Sensor row + latest value → check alarm thresholds → SSE broadcast → quality < 50 → increment data quality counter |
321|
322|---
323|
324|### 2.9 Biomedical Campus (BIO)
325|
326|**Context:** Biomedical Campus is Indonesia's first integrated smart building for healthcare, technology, and education — dual-tower (Knowledge Tower + Science Tower) in the Digital Hub SEZ, BSD City.
327|
328|**Requirements & Target Metrics:**
329|
330|| ID | Requirement | Priority | Target Metric |
331||----|------------|----------|---------------|
332|| BIO-01 | Lab cold storage monitoring (2-8°C, -20°C, -80°C freezers) | P0 | Excursion alert <30s |
333|| BIO-02 | Medical gas line pressure monitoring (O₂, N₂, CO₂, medical air) | P0 | Pressure alert <30s |
334|| BIO-03 | Cleanroom HEPA filter differential pressure + particle count | P1 | Report every 60s |
335|| BIO-04 | VMS integration — Face Recognition + QR Code access to restricted zones | P1 | Auth <3s per entry |
336|| BIO-05 | VOC and airborne contaminant monitoring in lab/clinical zones | P1 | Threshold alert <60s |
337|| BIO-06 | BSL-2/BSL-3 biosafety environment parameters (temp, humidity, pressure cascade) | P2 | Cascade reversal alert <10s |
338|
339|**Use Cases:**
340|
341|| ID | Name | Primary Actor | DESIGN Ref |
342||----|------|---------------|------------|
343|| UC-BIO-01 | Monitor lab cold storage temp | Medical Officer | §7.1 |
344|| UC-BIO-02 | Monitor medical gas pressure | Medical Officer | §3.2 |
345|| UC-BIO-03 | Monitor cleanroom HEPA + particle count | Medical Officer | §7.1 |
346|| UC-BIO-04 | Manage VMS access zone | Security Officer | §6.3 |
347|| UC-BIO-05 | View VOC/air quality in lab zones | Medical Officer | §3.2 |
348|| UC-BIO-06 | Configure biosafety env thresholds | Facility Manager | §12.1 |
349|
350|**UC-BIO-01: Monitor lab cold storage temperature**
351|
352|| Field | Value |
353||-------|-------|
354|| **Actor** | Medical Officer |
355|| **Precondition** | Authenticated, building access, Science Tower zone |
356|| **Postcondition** | Temperature excursion detected → alarm created → SSE broadcast |
357|| **Trigger** | 30-second polling cycle on lab temp sensors |
358|| **Basic Flow:** | Sensor reports temp → system compares to threshold (2-8°C, -20°C, -80°C depending on sensor) → if outside range → create Alarm(LAB_TEMP_EXCURSION, severity=critical) → SSE broadcast → audit log |
359|| **Alt:** | Door opened briefly → temp spike but recovers in <5min → no alarm (smart debounce) |
360|| **Alt:** | Power loss to freezer → sustained excursion → escalate to Medical Officer and Facility Manager |
361|| **Includes:** | UC-AUTH-02, UC-AUDIT-01 |
362|
363|**UC-BIO-02: Monitor medical gas pressure**
364|
365|| Field | Value |
366||-------|-------|
367|| **Actor** | Medical Officer |
368|| **Precondition** | ST gas lines monitored, pressure sensors online |
369|| **Postcondition** | Pressure drop → alarm created → auto-switch to backup tank |
370|| **Basic Flow:** | O₂ line sensor reads pressure → below 45 psi → Alarm(MEDICAL_GAS_DROP, severity=critical) → SSE broadcast → system triggers backup tank valve → audit log |
371|| **Includes:** | UC-AUTH-02, UC-AUDIT-01 |
372|
373|**UC-BIO-03: Monitor cleanroom HEPA + particle count**
374|
375|| Field | Value |
376||-------|-------|
377|| **Actor** | Medical Officer |
378|| **Precondition** | HEPA filter sensors installed in ST lab zones |
379|| **Postcondition** | Filter differential pressure trend logged; particle count threshold checked |
380|| **Basic Flow:** | HEPA ΔP sensor reads elevated → Alarm(HEPA_FILTER_CLOG, severity=warning) → particle count verifies ISO class → SSE broadcast → maintenance scheduled |
381|| **Includes:** | UC-AUTH-02, UC-AUDIT-01 |
382|
383|**UC-BIO-04: Manage VMS access zone**
384|
385|| Field | Value |
386||-------|-------|
387|| **Actor** | Security Officer |
388|| **Precondition** | VMS system operational at both tower entrances |
389|| **Postcondition** | Access credential updated in VMS database |
390|| **Basic Flow:** | New tenant staff → officer registers face/QR in VMS → biometric enrolled → zone access configured → audit log: VMS_ACCESS_GRANT |
391|| **Alt:** | Access revoked → removal from VMS → all biometric entries invalidated within 30s |
392|| **Includes:** | UC-AUTH-02, UC-AUDIT-01 |
393|
394|**UC-BIO-05: View VOC/air quality in lab zones**
395|
396|| Field | Value |
397||-------|-------|
398|| **Actor** | Medical Officer |
399|| **Basic Flow:** | Dashboard shows VOC (ppb), particle count, temp, humidity per lab zone → SSE updates every 30s → color-coded (green/amber/red vs threshold) |
400|| **Includes:** | UC-AUTH-02 |
401|
402|---
403|
404|### 2.10 Cross-Cutting
405|
406|| ID | Name | Primary Actor | DESIGN Ref | Description |
407||----|------|---------------|------------|-------------|
408|| UC-AUTH-01 | Authenticate | All human actors | §6.1 | Login via NextAuth + JWT |
409|| UC-AUTH-02 | Authorize action | System | §6.3 | checkAccess(user, buildingId, minRole) on every mutation |
410|| UC-AUDIT-01 | Log control action | System | §11.3 | Persist userId, action, target, detail, buildingId, ip, agent |
411|| UC-STRM-01 | Subscribe to telemetry stream | Browser | §4.3, §7.3 | EventSource connects, receives SSE events |
412|| UC-SCHD-01 | Execute scheduled task | Scheduler | §9.2 | CRON: materialized views, alarm escalation, daily rollup |
413|
414|**UC-AUTH-02: Authorize action** — Included by every control UC
415|| **Precondition** | Authenticated user session exists |
416|| **Postcondition** | Access granted → proceed, or 403 Forbidden |
417|| **Basic Flow:** | Receive (userId, action, target buildingId, minRole) → lookup role from session → check buildingIds.includes(target) → check roleWeight >= roleWeight(minRole) → both pass → return (continue) → either fail → throw Forbidden |
418|
419|---
420|
421|## 3. Actor-Use Case Matrix
422|
423|| Use Case | Operator | Facility Mgr | Security | Energy Mgr | Technician | Tenant | Admin | SuperAdmin | Medical Officer |
424||----------|----------|-------------|----------|------------|------------|--------|-------|------------|----------------|
425|| UC-HVAC-01 set setpoint | ✓ | ✓ | — | ✓ | — | ✓(zone) | — | ✓ | — |
426|| UC-HVAC-02 fan speed | ✓ | ✓ | — | ✓ | — | — | — | ✓ | — |
427|| UC-HVAC-03 mode switch | ✓ | ✓ | — | ✓ | — | — | — | ✓ | — |
428|| UC-HVAC-04 schedule | — | ✓ | — | ✓ | — | — | ✓ | ✓ | — |
429|| UC-HVAC-05 view history | ✓ | ✓ | — | ✓ | ✓ | ✓(zone) | ✓ | ✓ | — |
430|| UC-LGT-01 dimming | ✓ | ✓ | — | — | — | ✓(zone) | — | ✓ | — |
431|| UC-LGT-02 toggle | ✓ | ✓ | — | — | ✓ | ✓(zone) | — | ✓ | — |
432|| UC-SEC-01 lock/unlock | — | — | ✓ | — | — | — | ✓ | ✓ | — |
433|| UC-SEC-03 view alarms | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | — |
434|| UC-SEC-04 ack alarm | ✓ | ✓ | ✓(sec) | — | ✓ | — | ✓ | ✓ | — |
435|| UC-SEC-08 revoke credential | — | — | — | — | — | — | ✓ | ✓ | — |
436|| UC-ENR-01 view energy | ✓ | ✓ | — | ✓ | — | — | ✓ | ✓ | — |
437|| UC-ENR-05 execute DR | — | — | — | ✓ | — | — | — | ✓ | — |
438|| UC-FIR-01 fire panel | — | — | ✓ | — | ✓ | — | — | ✓ | — |
439|| UC-FIR-05 elevator recall | — | — | ✓ | — | — | — | — | ✓ | — |
440|| UC-BIO-01 cold storage | — | ✓ | — | — | — | — | — | ✓ | ✓ |
441|| UC-BIO-02 medical gas | — | ✓ | — | — | — | — | — | ✓ | ✓ |
442|| UC-BIO-03 HEPA/particle | — | ✓ | — | — | ✓ | — | — | ✓ | ✓ |
443|| UC-BIO-04 VMS access | — | — | ✓ | — | — | — | ✓ | ✓ | — |
444|| UC-BIO-05 VOC/air quality | — | ✓ | — | — | — | — | — | ✓ | ✓ |
445|| UC-BIO-06 biosafety config | — | ✓ | — | — | — | — | — | ✓ | ✓ |
446|| UC-AUTH-02 authorize | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
447|| UC-AUDIT-01 log action | auto | auto | auto | auto | auto | auto | auto | auto | auto |
448|
449|---
450|
451|## 4. Use Case Relationships
452|
453|### 4.1 Include (mandatory dependency)
454|
455|Every control UC includes UC-AUTH-02 (Authorize) and UC-AUDIT-01 (Log):
456|
457|```
458|UC-HVAC-01 (Set setpoint)
459|  ├── include → UC-AUTH-02 (Authorize: operator role, building access)
460|  ├── include → UC-AUDIT-01 (Log: action, user, target, timestamp)
461|  └── extend ← UC-HVAC-07 (Holiday override) [condition: holiday flag set]
462|```
463|
464|### 4.2 Extend (conditional)
465|
466|| Base UC | Extension | Condition |
467||---------|-----------|-----------|
468|| UC-HVAC-01 Set setpoint | UC-HVAC-07 Holiday override | Schedule has holiday flag |
469|| UC-SEC-01 Lock/unlock door | UC-SEC-04 Acknowledge alarm | Door forced→alarm must be ack'd before relock |
470|| UC-FIR-05 Elevator recall | UC-FIR-01 Fire panel status | Recall auto-triggers when fire alarm active |
471|| UC-ENR-05 Execute DR | UC-ENR-01 View energy consumption | DR event→dashboard switches to DR mode |
472|
473|### 4.3 Generalization (inheritance)
474|
475|```
476|Control Action (abstract)
477|  ├── Set Temperature (UC-HVAC-01)
478|  ├── Set Dimming (UC-LGT-01)
479|  ├── Lock Door (UC-SEC-01)
480|  └── Elevator Recall (UC-FIR-05)
481|    All: include UC-AUTH-02, include UC-AUDIT-01
482|
483|Alarm Handler (abstract)
484|  ├── Acknowledge (UC-ALM-02)
485|  └── Escalate (UC-ALM-05)
486|    All: include UC-AUTH-02, include UC-AUDIT-01
487|```
488|
489|---
490|
491|## 5. Critical Flow Details
492|
493|### 5.1 Full Walkthrough: Operator Changes HVAC Setpoint
494|
495|```
496|ACTOR: Building Operator (role: operator, buildings: [b1])
497|TRIGGER: 09:30 — Tenant complains zone 3F-North is too warm (27°C)
498|PRECONDITIONS: Zone z1, Building b1, user u1 authenticated
499|
500| 1. OPERATOR opens /building/b1/hvac
501
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

|