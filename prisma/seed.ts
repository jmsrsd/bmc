import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Helpers ───────────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
const rng = seededRandom(42)

function r(min: number, max: number): number {
  return min + rng() * (max - min)
}

function ri(min: number, max: number): number {
  return Math.floor(r(min, max + 1))
}

async function main() {
  // ─── Clear existing data ─────────────────────────────────────────
  await prisma.energyReading.deleteMany()
  await prisma.meter.deleteMany()
  await prisma.elevatorCar.deleteMany()
  await prisma.elevator.deleteMany()
  await prisma.fireDevice.deleteMany()
  await prisma.firePanel.deleteMany()
  await prisma.camera.deleteMany()
  await prisma.door.deleteMany()
  await prisma.lightZone.deleteMany()
  await prisma.alarm.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.sensor.deleteMany()
  await prisma.hVACUnit.deleteMany()
  await prisma.zone.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.building.deleteMany()

  // ─── VERIFIED DATA: Biomedical Campus — Digital Hub, BSD City ───
  // Source: dhub-sez.com, sinarmasland.com, gbcindonesia.org
  // Developer: Sinar Mas Land | Architect: NBBJ + Surbana Jurong + Microsoft
  // GBCI GREENSHIP New Building v1.2 — GOLD (61 pts)
  // Land: 11,800 m² | GFA: 31,800 m² | Operational: Jan 2024

  const b1 = await prisma.building.create({
    data: {
      id: 'b1',
      name: 'Biomedical Campus',
      address: 'Kavling Digital Hub, Jl. Damai Foresta, Sampora, Cisauk, Kab. Tangerang, Banten 15345',
      timezone: 'Asia/Jakarta',
      lat: -6.3035,
      lng: 106.6498,
    },
  })

  // ─── Schedule ───────────────────────────────────────────────────
  const s1 = await prisma.schedule.create({
    data: {
      id: 's1',
      name: 'Weekday Office Hours',
      config: JSON.stringify({
        weekdays: { start: '07:00', end: '19:00' },
        weekend: { start: '08:00', end: '17:00' },
      }),
    },
  })

  const s2 = await prisma.schedule.create({
    data: {
      id: 's2',
      name: 'Medical Operations 24/7',
      config: JSON.stringify({
        weekdays: { start: '00:00', end: '23:59' },
        weekend: { start: '00:00', end: '23:59' },
      }),
    },
  })

  // ─── ZONES: Knowledge Tower (8F + 2BS) & Science Tower (4F + 2BS) ─
  // Knowledge Tower: premium offices, R&D, education
  // Science Tower: medical clinics, labs, diagnostics
  const zoneDefs = [
    // KNOWLEDGE TOWER FLOORS
    { name: 'Knowledge Tower — Basement B1',       floor: -2, type: 'PARKING',    area: 1700, scheduleId: null },
    { name: 'Knowledge Tower — Basement LG',        floor: -1, type: 'PARKING',    area: 1700, scheduleId: null },
    { name: 'Knowledge Tower — Ground Floor Lobby', floor: 0,  type: 'LOBBY',     area: 1700, scheduleId: null },
    { name: 'Knowledge Tower — 2F Premium Office',  floor: 2,  type: 'OFFICE',    area: 1700, scheduleId: s1.id },
    { name: 'Knowledge Tower — 3F Premium Office',  floor: 3,  type: 'OFFICE',    area: 1700, scheduleId: s1.id },
    { name: 'Knowledge Tower — 4F Podium / Retail', floor: 4,  type: 'RETAIL',    area: 1700, scheduleId: null },
    { name: 'Knowledge Tower — 5F Premium Office',  floor: 5,  type: 'OFFICE',    area: 1700, scheduleId: s1.id },
    { name: 'Knowledge Tower — 6F Premium Office',  floor: 6,  type: 'OFFICE',    area: 1700, scheduleId: s1.id },
    { name: 'Knowledge Tower — 7F Premium Office',  floor: 7,  type: 'OFFICE',    area: 1700, scheduleId: s1.id },
    { name: 'Knowledge Tower — 8F Executive Suite', floor: 8,  type: 'OFFICE',    area: 1700, scheduleId: s1.id },
    // SCIENCE TOWER FLOORS
    { name: 'Science Tower — Basement B1',          floor: -2, type: 'PARKING',    area: 2800, scheduleId: null },
    { name: 'Science Tower — Basement LG',          floor: -1, type: 'PARKING',    area: 2800, scheduleId: null },
    { name: 'Science Tower — Ground Floor Lobby',   floor: 0,  type: 'LOBBY',     area: 2800, scheduleId: null },
    { name: 'Science Tower — 1F Bio Cell Lab',      floor: 1,  type: 'LAB',       area: 2800, scheduleId: s2.id },
    { name: 'Science Tower — 2F Fertility Center',  floor: 2,  type: 'CLINIC',    area: 2800, scheduleId: s2.id },
    { name: 'Science Tower — 3F Advanced Diag Lab', floor: 3,  type: 'CLINIC',    area: 2800, scheduleId: s2.id },
    // SUPPORT ZONES
    { name: 'Food Court & Amenities',               floor: 0,  type: 'FOOD_COURT',area: 1200, scheduleId: null },
    { name: 'Plant Room & Mechanical',              floor: -3, type: 'MECHANICAL', area: 2000, scheduleId: null },
  ]

  const zones = await Promise.all(
    zoneDefs.map((z) =>
      prisma.zone.create({
        data: {
          buildingId: b1.id,
          name: z.name,
          floor: z.floor,
          area: z.area,
          type: z.type,
          scheduleId: z.scheduleId ?? undefined,
        },
      })
    )
  )

  // Index helpers
  const floorMap: Record<string, typeof zones[number]> = {}
  for (const z of zones) {
    floorMap[z.name] = z
  }

  // ─── HVAC — Biomedical campus: HEPA, biosafety cabinets, strict temp ─
  // Knowledge Tower: standard VRF/FCU for offices
  // Science Tower: HEPA-filtered AHU, precise temp/humidity for labs

  for (const zone of zones) {
    const isScienceTower = zone.name.startsWith('Science Tower')
    const isLab = zone.type === 'LAB' || zone.type === 'CLINIC'
    const isParking = zone.type === 'PARKING'
    const isLobby = zone.type === 'LOBBY'

    // Determine HVAC type per zone
    let hvacType: string
    let hvacSubtype: string
    if (isScienceTower && isLab) {
      hvacType = 'AHU'
      hvacSubtype = 'HEPA-G4'
    } else if (isScienceTower) {
      hvacType = 'AHU'
      hvacSubtype = 'Standard'
    } else if (isParking) {
      hvacType = 'EXHAUST_FAN'
      hvacSubtype = 'Parking Vent'
    } else {
      hvacType = 'FCU'
      hvacSubtype = '4-Pipe'
    }

    // Setpoints vary by zone type
    let setpoint: number
    if (zone.type === 'LAB') setpoint = 21   // cold storage & biosafety
    else if (zone.type === 'CLINIC') setpoint = 22
    else if (zone.type === 'OFFICE') setpoint = 24
    else if (zone.type === 'LOBBY') setpoint = 25
    else if (zone.type === 'PARKING') setpoint = 28
    else setpoint = 24

    await prisma.hVACUnit.create({
      data: {
        zoneId: zone.id,
        type: hvacType,
        subtype: hvacSubtype,
        state: 'ON',
        mode: 'COOL',
        supplyTemp: 9 + rng() * 6,
        returnTemp: setpoint + rng() * 3,
        setpoint: setpoint,
        fanSpeed: isLab ? 'HIGH' : 'AUTO',
        occupancyMode: zone.type === 'OFFICE' || zone.type === 'LAB',
        runHours: ri(200, 8000),
        alarmPriority: isLab ? 0 : 0,
      },
    })
  }

  // ─── SENSORS — Biomedical-specific ────────────────────────────
  // Each zone gets base sensors; labs/clinics get extra biomedical sensors

  for (const zone of zones) {
    const isLab = zone.type === 'LAB' || zone.type === 'CLINIC'
    const isOffice = zone.type === 'OFFICE'

    // TEMPERATURE (all zones)
    await prisma.sensor.create({
      data: {
        zoneId: zone.id,
        type: 'TEMPERATURE',
        unit: '°C',
        value: isLab ? 20 + rng() * 4 : 23 + rng() * 5,
        quality: 90 + ri(0, 10),
      },
    })

    // HUMIDITY
    await prisma.sensor.create({
      data: {
        zoneId: zone.id,
        type: 'HUMIDITY',
        unit: '%',
        value: isLab ? 45 + rng() * 10 : 50 + rng() * 20,
        quality: 90 + ri(0, 10),
      },
    })

    // CO2 (all zones)
    await prisma.sensor.create({
      data: {
        zoneId: zone.id,
        type: 'CO2',
        unit: 'ppm',
        value: isLab ? 400 + rng() * 200 : 350 + rng() * 450,
        quality: 85 + ri(0, 15),
      },
    })

    // Biomedical-specific sensors for labs & clinics
    if (isLab) {
      // VOC — critical for lab air quality
      await prisma.sensor.create({
        data: {
          zoneId: zone.id,
          type: 'VOC',
          unit: 'ppb',
          value: rng() * 80,
          quality: 90 + ri(0, 10),
        },
      })

      // Particle count — clean room monitoring
      await prisma.sensor.create({
        data: {
          zoneId: zone.id,
          type: 'PARTICLE_COUNT',
          unit: 'particles/m³',
          value: rng() * 500,
          quality: 90 + ri(0, 10),
        },
      })

      // Medical gas pressure
      await prisma.sensor.create({
        data: {
          zoneId: zone.id,
          type: 'MEDICAL_GAS',
          unit: 'psi',
          value: 50 + rng() * 5,
          quality: 95 + ri(0, 5),
        },
      })
    }

    // Light sensor for lobbies
    if (zone.type === 'LOBBY') {
      await prisma.sensor.create({
        data: {
          zoneId: zone.id,
          type: 'LIGHT',
          unit: 'lux',
          value: 200 + rng() * 300,
          quality: 85 + ri(0, 15),
        },
      })
    }
  }

  // ─── LIGHTING ────────────────────────────────────────────────────
  for (const zone of zones) {
    let dimLevel: number
    if (zone.type === 'LAB') dimLevel = 90
    else if (zone.type === 'CLINIC') dimLevel = 80
    else if (zone.type === 'PARKING') dimLevel = 30
    else if (zone.type === 'LOBBY') dimLevel = 85
    else if (zone.type === 'FOOD_COURT') dimLevel = 75
    else dimLevel = 65

    await prisma.lightZone.create({
      data: {
        zoneId: zone.id,
        name: `${zone.name} — Lighting`,
        dimLevel: dimLevel,
        state: zone.type === 'PARKING' ? 'ON' : 'ON',
        power: 30 + rng() * 200,
      },
    })
  }

  // ─── DOORS — Biomedical Campus access points ──────────────────
  const doorDefs: { name: string; zoneKey: string; state: string }[] = [
    // Knowledge Tower
    { name: 'KT Main Entrance (FR/QR)', zoneKey: 'Knowledge Tower — Ground Floor Lobby', state: 'UNLOCKED' },
    { name: 'KT 2F Office Access', zoneKey: 'Knowledge Tower — 2F Premium Office', state: 'LOCKED' },
    { name: 'KT 6F Oodo Office Access', zoneKey: 'Knowledge Tower — 6F Premium Office', state: 'LOCKED' },
    { name: 'KT 8F Executive Suite', zoneKey: 'Knowledge Tower — 8F Executive Suite', state: 'LOCKED' },
    // Science Tower — restricted medical access
    { name: 'ST Main Entrance (FR/QR + VMS)', zoneKey: 'Science Tower — Ground Floor Lobby', state: 'UNLOCKED' },
    { name: 'ST 1F Bio Lab — Biometric', zoneKey: 'Science Tower — 1F Bio Cell Lab', state: 'LOCKED' },
    { name: 'ST 2F Fertility Center — Biometric', zoneKey: 'Science Tower — 2F Fertility Center', state: 'LOCKED' },
    { name: 'ST 3F Diagnostics — Biometric', zoneKey: 'Science Tower — 3F Advanced Diag Lab', state: 'LOCKED' },
    // Support
    { name: 'Plant Room Access', zoneKey: 'Plant Room & Mechanical', state: 'LOCKED' },
    { name: 'Food Court Entrance', zoneKey: 'Food Court & Amenities', state: 'UNLOCKED' },
  ]

  for (const d of doorDefs) {
    const zone = floorMap[d.zoneKey]
    if (zone) {
      await prisma.door.create({
        data: {
          zoneId: zone.id,
          name: d.name,
          state: d.state,
        },
      })
    }
  }

  // ─── CAMERAS — Biomedical Campus coverage ───────────────────────
  for (const name of [
    'KT Main Entrance', 'KT Lobby', 'KT 6F Odoo Area', 'KT 8F Executive',
    'ST Main Entrance (VMS)', 'ST 1F Bio Lab Corridor', 'ST 2F Fertility Center',
    'ST 3F Diagnostics', 'Food Court', 'Parking Lot KT', 'Parking Lot ST',
    'Loading Dock',
  ]) {
    await prisma.camera.create({
      data: {
        buildingId: b1.id,
        name,
        state: 'ONLINE',
      },
    })
  }

  // ─── FIRE SAFETY ────────────────────────────────────────────────
  // Two panels: one per tower, interconnected
  const fpKT = await prisma.firePanel.create({
    data: {
      buildingId: b1.id,
      name: 'Knowledge Tower — Main Fire Panel',
      state: 'NORMAL',
    },
  })

  const fpST = await prisma.firePanel.create({
    data: {
      buildingId: b1.id,
      name: 'Science Tower — Medical Fire Panel',
      state: 'NORMAL',
    },
  })

  const fireDevicesKT = [
    { type: 'SMOKE', zone: 'KT Lobby' },
    { type: 'SMOKE', zone: 'KT 2F Office' },
    { type: 'SMOKE', zone: 'KT 5F Office' },
    { type: 'SMOKE', zone: 'KT 8F Exec' },
    { type: 'HEAT', zone: 'KT Plant Room' },
    { type: 'MANUAL_CALL', zone: 'KT Ground Floor' },
  ]

  const fireDevicesST = [
    { type: 'SMOKE', zone: 'ST Lobby' },
    { type: 'SMOKE', zone: 'ST 1F Bio Lab' },
    { type: 'HEAT', zone: 'ST 2F Fertility' },
    { type: 'SMOKE', zone: 'ST 3F Diagnostics' },
    { type: 'FLOW', zone: 'ST Sprinkler Zone 1' },
    { type: 'MANUAL_CALL', zone: 'ST Ground Floor' },
  ]

  for (const fd of fireDevicesKT) {
    await prisma.fireDevice.create({
      data: { panelId: fpKT.id, type: fd.type, state: 'NORMAL', zone: fd.zone },
    })
  }
  for (const fd of fireDevicesST) {
    await prisma.fireDevice.create({
      data: { panelId: fpST.id, type: fd.type, state: 'NORMAL', zone: fd.zone },
    })
  }

  // ─── ELEVATORS ──────────────────────────────────────────────────
  // Knowledge Tower: 4 passenger + 2 service (model as 4 pass + 1 service in 1 bank)
  const elevKT = await prisma.elevator.create({
    data: { buildingId: b1.id, name: 'Knowledge Tower Elevator Bank' },
  })
  for (const name of ['Passenger A', 'Passenger B', 'Passenger C', 'Passenger D', 'Service Lift']) {
    await prisma.elevatorCar.create({
      data: {
        elevatorId: elevKT.id,
        name,
        floor: ri(-2, 8),
        direction: 'IDLE',
        doorState: 'CLOSED',
      },
    })
  }

  // Science Tower: 4 passenger + 2 service (model as 4 pass)
  const elevST = await prisma.elevator.create({
    data: { buildingId: b1.id, name: 'Science Tower Elevator Bank' },
  })
  for (const name of ['Medical Lift A', 'Medical Lift B', 'Medical Lift C', 'Service Lift']) {
    await prisma.elevatorCar.create({
      data: {
        elevatorId: elevST.id,
        name,
        floor: ri(-2, 3),
        direction: 'IDLE',
        doorState: 'CLOSED',
      },
    })
  }

  // ─── METERS & ENERGY ──────────────────────────────────────────
  const meterDefs = [
    // Knowledge Tower
    { type: 'ELECTRIC', name: 'KT — Main Utility Meter', unit: 'kW' },
    { type: 'ELECTRIC', name: 'KT — HVAC Submeter', unit: 'kW' },
    { type: 'ELECTRIC', name: 'KT — Lighting Submeter', unit: 'kW' },
    { type: 'ELECTRIC', name: 'KT — Office Plug Loads', unit: 'kW' },
    // Science Tower
    { type: 'ELECTRIC', name: 'ST — Main Utility Meter', unit: 'kW' },
    { type: 'ELECTRIC', name: 'ST — Medical Equipment Submeter', unit: 'kW' },
    { type: 'ELECTRIC', name: 'ST — HVAC (HEPA) Submeter', unit: 'kW' },
    { type: 'ELECTRIC', name: 'ST — Lighting Submeter', unit: 'kW' },
    // Utilities
    { type: 'WATER', name: 'Main Water Meter', unit: 'L/min' },
    { type: 'GAS', name: 'Medical Gas — O₂ Line', unit: 'psi' },
    { type: 'ELECTRIC', name: 'Chiller Plant (Campus)', unit: 'kW' },
  ]

  for (const mt of meterDefs) {
    const meter = await prisma.meter.create({
      data: {
        buildingId: b1.id,
        type: mt.type,
        name: mt.name,
        unit: mt.unit,
        value: rng() * 200,
        cumulative: rng() * 50000,
      },
    })

    // Historical energy readings (last 24h, 30min interval)
    const readings: { meterId: string; value: number; timestamp: Date }[] = []
    const now = new Date()
    for (let i = 48; i >= 0; i--) {
      readings.push({
        meterId: meter.id,
        value: rng() * (mt.type === 'ELECTRIC' ? 200 : 50),
        timestamp: new Date(now.getTime() - i * 30 * 60 * 1000),
      })
    }
    await prisma.energyReading.createMany({ data: readings })
  }

  // ─── TENANTS — Verified from dhub-sez.com tenant directory ────
  const tenantDefs = [
    // Knowledge Tower tenants
    { name: 'PT Odoo Software Indonesia',  unit: 'Knowledge Tower 6F, zona 1-5' },
    { name: 'PT NEC Indonesia (amuse hub)', unit: 'Knowledge Tower' },
    { name: 'Monash University Indonesia',  unit: 'Knowledge Tower' },
    { name: 'Binus University',             unit: 'Knowledge Tower' },
    { name: 'APG',                          unit: 'Knowledge Tower' },
    { name: 'Commsult Indonesia',           unit: 'Knowledge Tower' },
    { name: 'One Smart Services',           unit: 'Knowledge Tower' },
    { name: 'Social Bread',                 unit: 'Knowledge Tower' },
    { name: 'PT Etana Biotechnologies Indonesia', unit: 'Knowledge Tower' },
    // Science Tower tenants
    { name: 'FS Regenera (Bio Cell Dermatech)', unit: 'Science Tower 1F' },
    { name: 'StemCord Indonesia',               unit: 'Science Tower 1F' },
    { name: 'Alpha IVF Group',                  unit: 'Science Tower 2F' },
    { name: 'Kaiser Cancer Center',             unit: 'Science Tower 2F' },
    { name: 'ATOP Plastic Surgery',             unit: 'Science Tower 3F' },
    { name: 'PT Increase Laboratorium Indonesia', unit: 'Science Tower 3F' },
    { name: 'Genetron',                         unit: 'Science Tower 3F' },
    { name: 'Seoul Jakarta Plastic Surgery',    unit: 'Science Tower 3F' },
    { name: 'Fuji Academy',                     unit: 'Science Tower' },
    // Partners
    { name: 'Fullerton Health Indonesia',       unit: 'Digital Hub — BMC' },
    { name: 'Pyridam Farma',                    unit: 'Digital Hub — BMC' },
    { name: 'AWS Indonesia',                    unit: 'Digital Hub — BMC' },
  ]

  for (const t of tenantDefs) {
    await prisma.tenant.create({
      data: {
        buildingId: b1.id,
        name: t.name,
        unit: t.unit,
        contact: `+62-21-555-${ri(1000, 9999)}`,
      },
    })
  }

  // ─── ALARMS — Biomedical-simulated ────────────────────────────
  const alarmDefs = [
    // Biomedical-specific
    { type: 'LAB_TEMP_EXCURSION', severity: 'critical', message: 'ST 1F Bio Lab — Cold storage temp 9.2°C exceeds +8°C threshold', zoneKey: 'Science Tower — 1F Bio Cell Lab' },
    { type: 'MEDICAL_GAS_DROP',   severity: 'critical', message: 'ST 1F — Medical O₂ line pressure dropped to 38 psi (min 45 psi)', zoneKey: 'Science Tower — 1F Bio Cell Lab' },
    { type: 'HEPA_FILTER_CLOG',   severity: 'warning',  message: 'ST 1F — HEPA filter pressure drop 320 Pa at AHU-01 (normal <200 Pa)', zoneKey: 'Science Tower — 1F Bio Cell Lab' },
    { type: 'PARTICLE_COUNT_HIGH', severity: 'warning', message: 'ST 3F Diagnostics — Particle count 2,100/m³ exceeds ISO 7 threshold', zoneKey: 'Science Tower — 3F Advanced Diag Lab' },
    { type: 'VOC_ELEVATED',       severity: 'warning',  message: 'ST 2F Fertility Center — VOC 180 ppb in IVF lab', zoneKey: 'Science Tower — 2F Fertility Center' },
    // Standard building
    { type: 'HIGH_TEMP',          severity: 'warning',  message: 'KT 5F Office temp 28.5°C exceeds cooling setpoint', zoneKey: 'Knowledge Tower — 5F Premium Office' },
    { type: 'DOOR_FORCED',        severity: 'critical', message: 'ST 1F Bio Lab — Biometric door forced open without credential', zoneKey: 'Science Tower — 1F Bio Cell Lab' },
    { type: 'POWER_SURGE',        severity: 'critical', message: 'ST — Power spike detected on medical equipment line', zoneKey: 'Plant Room & Mechanical' },
    { type: 'CO2_HIGH',           severity: 'warning',  message: 'KT 8F Executive — CO2 level 1,520 ppm in meeting room', zoneKey: 'Knowledge Tower — 8F Executive Suite' },
    { type: 'CHILLER_ALARM',      severity: 'critical', message: 'Campus chiller #2 — condenser pressure high, staging required', zoneKey: 'Plant Room & Mechanical' },
  ]

  for (const a of alarmDefs) {
    const zone = floorMap[a.zoneKey]
    await prisma.alarm.create({
      data: {
        buildingId: b1.id,
        zoneId: zone?.id,
        zoneName: zone?.name ?? a.zoneKey,
        type: a.type,
        severity: a.severity,
        message: a.message,
        status: rng() > 0.4 ? 'open' : 'acknowledged',
        source: 'system',
        createdAt: new Date(Date.now() - rng() * 3600000),
      },
    })
  }

  // ─── AUDIT LOGS ────────────────────────────────────────────────
  const auditActions = [
    { action: 'LOGIN', target: 'user-session', detail: { method: 'password' } },
    { action: 'SET_SETPOINT', target: zones[0]?.id ?? '', detail: { before: 24, after: 22 } },
    { action: 'DOOR_LOCK', target: 'st-lab-1', detail: { doorName: 'ST 1F Bio Lab — Biometric' } },
    { action: 'ALARM_ACK', target: 'alarm-lab-temp', detail: { alarmType: 'LAB_TEMP_EXCURSION' } },
    { action: 'VMS_ACCESS', target: 'st-main-entrance', detail: { method: 'FACE_RECOGNITION', tenant: 'FS Regenera' } },
    { action: 'ELEVATOR_RECALL', target: 'st-elevator-1', detail: { trigger: 'FIRE_DRILL', floor: 0 } },
  ]

  for (const a of auditActions) {
    await prisma.auditLog.create({
      data: {
        userId: 'demo-user',
        action: a.action,
        target: a.target,
        detail: JSON.stringify(a.detail),
        buildingId: b1.id,
      },
    })
  }

  // ─── Summary ──────────────────────────────────────────────────
  console.log('✅ Seed complete — Biomedical Campus ready')
  console.log(`   Zones:     ${zones.length} (KT: 10 floors + ST: 6 floors + support)`)
  console.log(`   Tenants:   ${tenantDefs.length} (verified from dhub-sez.com)`)
  console.log(`   Meters:    ${meterDefs.length}`)
  console.log(`   Alarms:    ${alarmDefs.length}`)
  console.log(`   Doors:     ${doorDefs.length}`)
  console.log(`   Cameras:   ${12}`)
  console.log(`   Elevators: 2 banks, 9 cars total`)
  console.log(`   Sensors:   Biomedical (VOC, particle, medical gas) + standard`)
  console.log(`   GREENSHIP: GOLD (61 pts) — GBCI New Building v1.2`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
