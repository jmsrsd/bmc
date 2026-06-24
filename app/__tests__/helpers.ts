export function buildBuilding(overrides = {}) {
  return {
    id: 'b1', name: 'Test Building', address: '123 Test St', timezone: 'Asia/Jakarta',
    zones: [buildZone()],
    createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-06-21'),
    ...overrides
  }
}

export function buildZone(overrides = {}) {
  return {
    id: 'z1', buildingId: 'b1', name: '3rd Floor North', type: 'OFFICE', area: 500, floor: 3,
    createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-06-21'), ...overrides
  }
}

export function buildSensor(overrides = {}) {
  return {
    id: 's1', zoneId: 'z1', type: 'TEMPERATURE', value: 22.5, unit: '°C', quality: 95,
    timestamp: new Date(), metadata: { manufacturer: 'Siemens' }, ...overrides
  }
}

export function buildTelemetry(overrides = {}) {
  return {
    buildingId: 'b1', deviceId: 'ahu-01', type: 'analog-input', value: 22.5, unit: '°C',
    ts: '2026-06-21T10:30:00Z', quality: 95, ...overrides
  }
}

export function buildHvacUnit(overrides = {}) {
  return {
    id: 'h1', zoneId: 'z1', type: 'AHU', mode: 'COOL', state: 'ON', setpoint: 22,
    fanSpeed: 'AUTO', supplyTemp: 14.2, returnTemp: 24.5, runHours: 1245,
    occupancyMode: true, alarmPriority: 0, ...overrides
  }
}

export function buildLightZone(overrides = {}) {
  return {
    id: 'lz1', zoneId: 'z1', state: 'ON', dimLevel: 70, power: 120,
    name: 'Main Lights', ...overrides
  }
}

export function buildDoor(overrides = {}) {
  return {
    id: 'd1', zoneId: 'z1', name: 'Main Door', state: 'LOCKED', alarmState: 'NORMAL',
    zone: { name: '3rd Floor North', floor: 3 },
    ...overrides
  }
}

export function buildElevatorCar(overrides = {}) {
  return {
    id: 'c1', elevatorId: 'e1', name: 'Car A', state: 'IDLE', floor: 5,
    direction: 'IDLE', doorState: 'CLOSED', recallFloor: 0, ...overrides
  }
}

export function buildAlarm(overrides = {}) {
  return {
    id: 'a1', buildingId: 'b1', type: 'FIRE', severity: 'critical', status: 'open',
    message: 'Fire alarm in Server Room', zoneName: 'Server Room',
    acknowledgedBy: null, acknowledgedAt: null, comment: '',
    createdAt: new Date('2026-06-24T10:00:00Z'), ...overrides
  }
}

export function buildFirePanel(overrides = {}) {
  return {
    id: 'fp1', buildingId: 'b1', name: 'Panel 1', state: 'NORMAL',
    devices: [buildFireDevice()], ...overrides
  }
}

export function buildFireDevice(overrides = {}) {
  return {
    id: 'fd1', panelId: 'fp1', type: 'SMOKE', state: 'NORMAL', zone: 'Server Room',
    ...overrides
  }
}

export function buildCamera(overrides = {}) {
  return {
    id: 'cam1', buildingId: 'b1', name: 'Lobby Camera', state: 'ONLINE', ...overrides
  }
}

export function buildMeter(overrides = {}) {
  return {
    id: 'm1', buildingId: 'b1', name: 'Main Meter', type: 'ELECTRIC', unit: 'kW',
    value: 150.5, cumulative: 45000, readings: [buildMeterReading()], ...overrides
  }
}

export function buildMeterReading(overrides = {}) {
  return {
    id: 'r1', meterId: 'm1', value: 150.5, timestamp: new Date(), ...overrides
  }
}

export function createMockFormData(data: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(data)) fd.append(k, v)
  return fd
}
