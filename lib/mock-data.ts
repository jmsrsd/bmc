// Hardcoded BMC building data — replaces Prisma/SQLite
// Design-time data only; in-memory store for mutations

export const BUILDING = {
  id: 'b1', name: 'Biomedical Campus', address: 'Jakarta, Indonesia',
  timezone: 'Asia/Jakarta', lat: -6.3, lng: 106.8,
}

export const ZONES = [
  { id: 'z1', buildingId: 'b1', name: 'Tower A - Lobby', floor: 1, area: 500, type: 'LOBBY' },
  { id: 'z2', buildingId: 'b1', name: 'Tower A - Office 1', floor: 2, area: 800, type: 'OFFICE' },
  { id: 'z3', buildingId: 'b1', name: 'Tower A - Office 2', floor: 3, area: 800, type: 'OFFICE' },
  { id: 'z4', buildingId: 'b1', name: 'Tower A - Lab A', floor: 4, area: 400, type: 'LAB' },
  { id: 'z5', buildingId: 'b1', name: 'Tower A - Lab B', floor: 5, area: 400, type: 'LAB' },
  { id: 'z6', buildingId: 'b1', name: 'Tower A - Parking', floor: -1, area: 2000, type: 'PARKING' },
  { id: 'z7', buildingId: 'b1', name: 'Tower A - Cafeteria', floor: 1, area: 300, type: 'FOOD_COURT' },
  { id: 'z8', buildingId: 'b1', name: 'Tower A - Storage', floor: -1, area: 200, type: 'WAREHOUSE' },
  { id: 'z9', buildingId: 'b1', name: 'Tower A - Cleanroom', floor: 4, area: 150, type: 'CLEANROOM' },
  { id: 'z10', buildingId: 'b1', name: 'Tower B - Office', floor: 2, area: 600, type: 'OFFICE' },
  { id: 'z11', buildingId: 'b1', name: 'Tower B - Lobby', floor: 1, area: 350, type: 'LOBBY' },
  { id: 'z12', buildingId: 'b1', name: 'Tower A - Clinic', floor: 3, area: 250, type: 'CLINIC' },
  { id: 'z13', buildingId: 'b1', name: 'Tower A - Rooftop', floor: 10, area: 100, type: 'MECHANICAL' },
  { id: 'z14', buildingId: 'b1', name: 'Tower A - Stair A', floor: 1, area: 30, type: 'STAIR' },
  { id: 'z15', buildingId: 'b1', name: 'Tower A - Corridor 2F', floor: 2, area: 120, type: 'CORRIDOR' },
]

export const SENSORS = [
  { id: 's1', zoneId: 'z1', type: 'TEMPERATURE', unit: '°C', value: 24.5, quality: 100 },
  { id: 's2', zoneId: 'z2', type: 'TEMPERATURE', unit: '°C', value: 22.1, quality: 98 },
  { id: 's3', zoneId: 'z3', type: 'TEMPERATURE', unit: '°C', value: 22.8, quality: 100 },
  { id: 's4', zoneId: 'z4', type: 'TEMPERATURE', unit: '°C', value: 20.5, quality: 95 },
  { id: 's5', zoneId: 'z5', type: 'TEMPERATURE', unit: '°C', value: 21.0, quality: 99 },
  { id: 's6', zoneId: 'z6', type: 'TEMPERATURE', unit: '°C', value: 28.0, quality: 88 },
  { id: 's7', zoneId: 'z7', type: 'TEMPERATURE', unit: '°C', value: 23.5, quality: 100 },
  { id: 's8', zoneId: 'z8', type: 'TEMPERATURE', unit: '°C', value: 26.0, quality: 90 },
  { id: 's9', zoneId: 'z9', type: 'TEMPERATURE', unit: '°C', value: 19.5, quality: 97 },
  { id: 's10', zoneId: 'z10', type: 'TEMPERATURE', unit: '°C', value: 23.0, quality: 100 },
  { id: 's11', zoneId: 'z11', type: 'TEMPERATURE', unit: '°C', value: 24.0, quality: 100 },
  { id: 's12', zoneId: 'z12', type: 'TEMPERATURE', unit: '°C', value: 22.5, quality: 96 },
  { id: 's13', zoneId: 'z13', type: 'TEMPERATURE', unit: '°C', value: 35.0, quality: 100 },
  { id: 's14', zoneId: 'z14', type: 'TEMPERATURE', unit: '°C', value: 25.0, quality: 100 },
  { id: 's15', zoneId: 'z15', type: 'TEMPERATURE', unit: '°C', value: 23.8, quality: 99 },
  { id: 's16', zoneId: 'z2', type: 'CO2', unit: 'ppm', value: 450, quality: 95 },
  { id: 's17', zoneId: 'z3', type: 'CO2', unit: 'ppm', value: 520, quality: 92 },
  { id: 's18', zoneId: 'z4', type: 'HUMIDITY', unit: '%', value: 55, quality: 98 },
  { id: 's19', zoneId: 'z6', type: 'PIR', unit: '', value: 1, quality: 100 },
  { id: 's20', zoneId: 'z15', type: 'PIR', unit: '', value: 0, quality: 100 },
]

export const HVAC_UNITS = [
  { id: 'h1', zoneId: 'z1', type: 'AHU', subtype: 'AHU-01', state: 'ON', mode: 'AUTO', setpoint: 24, supplyTemp: 14, returnTemp: 24, fanSpeed: 'AUTO', occupancyMode: true, runHours: 12500, alarmPriority: 0 },
  { id: 'h2', zoneId: 'z2', type: 'AHU', subtype: 'AHU-02', state: 'ON', mode: 'COOL', setpoint: 22, supplyTemp: 12, returnTemp: 22, fanSpeed: 'AUTO', occupancyMode: true, runHours: 8700, alarmPriority: 0 },
  { id: 'h3', zoneId: 'z3', type: 'VAV', subtype: 'VAV-03', state: 'ON', mode: 'AUTO', setpoint: 23, supplyTemp: 13, returnTemp: 23, fanSpeed: 'MEDIUM', occupancyMode: true, runHours: 6200, alarmPriority: 0 },
  { id: 'h4', zoneId: 'z4', type: 'AHU', subtype: 'AHU-04', state: 'ON', mode: 'COOL', setpoint: 21, supplyTemp: 11, returnTemp: 20, fanSpeed: 'HIGH', occupancyMode: true, runHours: 15000, alarmPriority: 1 },
  { id: 'h5', zoneId: 'z5', type: 'AHU', subtype: 'AHU-05', state: 'ON', mode: 'COOL', setpoint: 21, supplyTemp: 11, returnTemp: 21, fanSpeed: 'HIGH', occupancyMode: true, runHours: 14000, alarmPriority: 0 },
  { id: 'h6', zoneId: 'z6', type: 'FCU', subtype: 'FCU-06', state: 'STANDBY', mode: 'VENT', setpoint: 28, supplyTemp: 26, returnTemp: 28, fanSpeed: 'LOW', occupancyMode: false, runHours: 3200, alarmPriority: 0 },
  { id: 'h7', zoneId: 'z7', type: 'FCU', subtype: 'FCU-07', state: 'ON', mode: 'AUTO', setpoint: 24, supplyTemp: 14, returnTemp: 24, fanSpeed: 'MEDIUM', occupancyMode: true, runHours: 5800, alarmPriority: 0 },
  { id: 'h8', zoneId: 'z8', type: 'FCU', subtype: 'FCU-08', state: 'STANDBY', mode: 'VENT', setpoint: 26, supplyTemp: 24, returnTemp: 26, fanSpeed: 'LOW', occupancyMode: false, runHours: 1200, alarmPriority: 0 },
  { id: 'h9', zoneId: 'z9', type: 'AHU', subtype: 'AHU-09', state: 'ON', mode: 'COOL', setpoint: 20, supplyTemp: 10, returnTemp: 19, fanSpeed: 'HIGH', occupancyMode: true, runHours: 11000, alarmPriority: 2 },
  { id: 'h10', zoneId: 'z10', type: 'AHU', subtype: 'AHU-10', state: 'ON', mode: 'AUTO', setpoint: 23, supplyTemp: 13, returnTemp: 23, fanSpeed: 'AUTO', occupancyMode: true, runHours: 7500, alarmPriority: 0 },
  { id: 'h11', zoneId: 'z11', type: 'AHU', subtype: 'AHU-11', state: 'ON', mode: 'AUTO', setpoint: 24, supplyTemp: 14, returnTemp: 24, fanSpeed: 'AUTO', occupancyMode: true, runHours: 9500, alarmPriority: 0 },
  { id: 'h12', zoneId: 'z12', type: 'FCU', subtype: 'FCU-12', state: 'ON', mode: 'AUTO', setpoint: 23, supplyTemp: 13, returnTemp: 23, fanSpeed: 'AUTO', occupancyMode: true, runHours: 4300, alarmPriority: 0 },
  { id: 'h13', zoneId: 'z13', type: 'EXHAUST_FAN', subtype: 'EF-13', state: 'ON', mode: 'VENT', setpoint: 30, supplyTemp: 30, returnTemp: 35, fanSpeed: 'HIGH', occupancyMode: false, runHours: 22000, alarmPriority: 0 },
  { id: 'h14', zoneId: 'z14', type: 'VAV', subtype: 'VAV-14', state: 'ON', mode: 'AUTO', setpoint: 25, supplyTemp: 15, returnTemp: 25, fanSpeed: 'LOW', occupancyMode: false, runHours: 1800, alarmPriority: 0 },
  { id: 'h15', zoneId: 'z15', type: 'VAV', subtype: 'VAV-15', state: 'ON', mode: 'AUTO', setpoint: 24, supplyTemp: 14, returnTemp: 24, fanSpeed: 'LOW', occupancyMode: true, runHours: 4600, alarmPriority: 0 },
]

export const LIGHT_ZONES = [
  { id: 'l1', zoneId: 'z1', name: 'Lobby Main', dimLevel: 80, state: 'ON', scene: 'NORMAL', power: 2.4 },
  { id: 'l2', zoneId: 'z2', name: 'Office 1 Open', dimLevel: 100, state: 'ON', scene: 'NORMAL', power: 3.2 },
  { id: 'l3', zoneId: 'z3', name: 'Office 2 Open', dimLevel: 90, state: 'ON', scene: 'NORMAL', power: 3.0 },
  { id: 'l4', zoneId: 'z4', name: 'Lab A Lights', dimLevel: 100, state: 'ON', scene: 'NORMAL', power: 2.0 },
  { id: 'l5', zoneId: 'z5', name: 'Lab B Lights', dimLevel: 100, state: 'ON', scene: 'NORMAL', power: 2.0 },
  { id: 'l6', zoneId: 'z6', name: 'Parking Lights', dimLevel: 30, state: 'ON', scene: 'NIGHT', power: 8.0 },
  { id: 'l7', zoneId: 'z7', name: 'Cafeteria', dimLevel: 60, state: 'ON', scene: 'NORMAL', power: 1.5 },
  { id: 'l8', zoneId: 'z8', name: 'Storage', dimLevel: 50, state: 'ON', scene: 'NORMAL', power: 0.6 },
  { id: 'l9', zoneId: 'z9', name: 'Cleanroom', dimLevel: 100, state: 'ON', scene: 'NORMAL', power: 1.0 },
  { id: 'l10', zoneId: 'z10', name: 'Office B Open', dimLevel: 90, state: 'ON', scene: 'NORMAL', power: 2.4 },
  { id: 'l11', zoneId: 'z11', name: 'Lobby B Main', dimLevel: 75, state: 'ON', scene: 'NORMAL', power: 1.8 },
  { id: 'l12', zoneId: 'z12', name: 'Clinic Lights', dimLevel: 100, state: 'ON', scene: 'NORMAL', power: 1.2 },
  { id: 'l13', zoneId: 'z15', name: 'Corridor 2F', dimLevel: 40, state: 'ON', scene: 'NORMAL', power: 0.8 },
]

export const DOORS = [
  { id: 'd1', zoneId: 'z1', name: 'Main Entrance', state: 'UNLOCKED', alarmState: 'NORMAL' },
  { id: 'd2', zoneId: 'z1', name: 'Lobby Emergency', state: 'LOCKED', alarmState: 'NORMAL' },
  { id: 'd3', zoneId: 'z2', name: 'Office 1 Entry', state: 'UNLOCKED', alarmState: 'NORMAL' },
  { id: 'd4', zoneId: 'z3', name: 'Office 2 Entry', state: 'UNLOCKED', alarmState: 'NORMAL' },
  { id: 'd5', zoneId: 'z4', name: 'Lab A Access', state: 'LOCKED', alarmState: 'NORMAL' },
  { id: 'd6', zoneId: 'z5', name: 'Lab B Access', state: 'LOCKED', alarmState: 'NORMAL' },
  { id: 'd7', zoneId: 'z6', name: 'Parking Gate', state: 'UNLOCKED', alarmState: 'NORMAL' },
  { id: 'd8', zoneId: 'z7', name: 'Cafeteria Door', state: 'LOCKED', alarmState: 'NORMAL' },
  { id: 'd9', zoneId: 'z9', name: 'Cleanroom Airlock', state: 'LOCKED', alarmState: 'NORMAL' },
  { id: 'd10', zoneId: 'z10', name: 'Office B Entry', state: 'UNLOCKED', alarmState: 'NORMAL' },
  { id: 'd11', zoneId: 'z11', name: 'Lobby B Entry', state: 'LOCKED', alarmState: 'NORMAL' },
  { id: 'd12', zoneId: 'z14', name: 'Stair A Door', state: 'LOCKED', alarmState: 'NORMAL' },
]

export const ELEVATORS = [
  {
    id: 'e1', buildingId: 'b1', name: 'Elevator Bank A',
    cars: [
      { id: 'ec1', elevatorId: 'e1', name: 'Car A1', floor: 5, direction: 'IDLE', doorState: 'CLOSED', state: 'NORMAL', recallFloor: 0 },
      { id: 'ec2', elevatorId: 'e1', name: 'Car A2', floor: 1, direction: 'UP', doorState: 'CLOSED', state: 'NORMAL', recallFloor: 0 },
      { id: 'ec3', elevatorId: 'e1', name: 'Car A3', floor: 8, direction: 'DOWN', doorState: 'CLOSED', state: 'NORMAL', recallFloor: 0 },
    ],
  },
  {
    id: 'e2', buildingId: 'b1', name: 'Elevator Bank B',
    cars: [
      { id: 'ec4', elevatorId: 'e2', name: 'Car B1', floor: 1, direction: 'IDLE', doorState: 'OPEN', state: 'NORMAL', recallFloor: 0 },
      { id: 'ec5', elevatorId: 'e2', name: 'Car B2', floor: 3, direction: 'IDLE', doorState: 'CLOSED', state: 'RECALL', recallFloor: 1 },
    ],
  },
  {
    id: 'e3', buildingId: 'b1', name: 'Freight Elevator',
    cars: [
      { id: 'ec6', elevatorId: 'e3', name: 'Freight 1', floor: -1, direction: 'IDLE', doorState: 'CLOSED', state: 'NORMAL', recallFloor: 0 },
    ],
  },
]

export const FIRE_PANELS = [
  {
    id: 'fp1', buildingId: 'b1', name: 'Main Panel - Tower A',
    devices: [
      { id: 'fd1', panelId: 'fp1', type: 'SMOKE', state: 'NORMAL', zone: 'Lobby' },
      { id: 'fd2', panelId: 'fp1', type: 'SMOKE', state: 'NORMAL', zone: 'Office 1' },
      { id: 'fd3', panelId: 'fp1', type: 'HEAT', state: 'NORMAL', zone: 'Kitchen' },
      { id: 'fd4', panelId: 'fp1', type: 'MANUAL_CALL', state: 'NORMAL', zone: 'Corridor 2F' },
    ],
  },
  {
    id: 'fp2', buildingId: 'b1', name: 'Panel - Tower A Lab',
    devices: [
      { id: 'fd5', panelId: 'fp2', type: 'SMOKE', state: 'NORMAL', zone: 'Lab A' },
      { id: 'fd6', panelId: 'fp2', type: 'SMOKE', state: 'ALARM', zone: 'Lab B' },
      { id: 'fd7', panelId: 'fp2', type: 'GAS', state: 'NORMAL', zone: 'Gas Storage' },
    ],
  },
  {
    id: 'fp3', buildingId: 'b1', name: 'Panel - Tower B',
    devices: [
      { id: 'fd8', panelId: 'fp3', type: 'SMOKE', state: 'NORMAL', zone: 'Lobby B' },
      { id: 'fd9', panelId: 'fp3', type: 'SMOKE', state: 'NORMAL', zone: 'Office B' },
    ],
  },
]

export const METERS = [
  {
    id: 'm1', buildingId: 'b1', type: 'ELECTRIC', name: 'Main Feeder L1', unit: 'kW', value: 142.5, cumulative: 1245780,
    readings: Array.from({ length: 48 }, (_, i) => ({
      id: `mr${i}`, meterId: 'm1', value: 120 + Math.sin(i * 0.3) * 30 + Math.random() * 10, timestamp: new Date(Date.now() - (47 - i) * 300000),
    })),
  },
  {
    id: 'm2', buildingId: 'b1', type: 'ELECTRIC', name: 'Main Feeder L2', unit: 'kW', value: 98.3, cumulative: 892400,
    readings: Array.from({ length: 48 }, (_, i) => ({
      id: `mr${48 + i}`, meterId: 'm2', value: 85 + Math.sin(i * 0.25 + 1) * 20 + Math.random() * 8, timestamp: new Date(Date.now() - (47 - i) * 300000),
    })),
  },
  {
    id: 'm3', buildingId: 'b1', type: 'ELECTRIC', name: 'HVAC Feeder', unit: 'kW', value: 210.0, cumulative: 1856300,
    readings: Array.from({ length: 48 }, (_, i) => ({
      id: `mr${96 + i}`, meterId: 'm3', value: 180 + Math.sin(i * 0.2 + 2) * 40 + Math.random() * 15, timestamp: new Date(Date.now() - (47 - i) * 300000),
    })),
  },
  {
    id: 'm4', buildingId: 'b1', type: 'ELECTRIC', name: 'Lighting Feeder', unit: 'kW', value: 45.2, cumulative: 398100,
    readings: Array.from({ length: 48 }, (_, i) => ({
      id: `mr${144 + i}`, meterId: 'm4', value: 38 + Math.sin(i * 0.35 + 0.5) * 10 + Math.random() * 5, timestamp: new Date(Date.now() - (47 - i) * 300000),
    })),
  },
  {
    id: 'm5', buildingId: 'b1', type: 'WATER', name: 'Water Main', unit: 'm³/h', value: 12.8, cumulative: 28450,
    readings: Array.from({ length: 48 }, (_, i) => ({
      id: `mr${192 + i}`, meterId: 'm5', value: 10 + Math.sin(i * 0.15) * 3 + Math.random() * 2, timestamp: new Date(Date.now() - (47 - i) * 300000),
    })),
  },
]

export const ALARMS = [
  { id: 'a1', buildingId: 'b1', zoneId: 'z5', zoneName: 'Lab B', type: 'FIRE', severity: 'critical', message: 'Smoke detected in Lab B', status: 'open', source: 'smoke-detector', comment: '', createdAt: new Date(Date.now() - 120000) },
  { id: 'a2', buildingId: 'b1', zoneId: 'z9', zoneName: 'Cleanroom', type: 'HVAC', severity: 'warning', message: 'Cleanroom pressure differential low', status: 'open', source: 'bacnet', comment: '', createdAt: new Date(Date.now() - 3600000) },
  { id: 'a3', buildingId: 'b1', zoneId: 'z4', zoneName: 'Lab A', type: 'HVAC', severity: 'warning', message: 'AHU-04 supply temp deviation', status: 'open', source: 'bacnet', comment: '', createdAt: new Date(Date.now() - 7200000) },
  { id: 'a4', buildingId: 'b1', zoneId: 'z13', zoneName: 'Rooftop', type: 'EQUIPMENT', severity: 'info', message: 'Exhaust fan EF-13 runtime > 20k hours', status: 'open', source: 'system', comment: '', createdAt: new Date(Date.now() - 86400000) },
  { id: 'a5', buildingId: 'b1', zoneId: 'z6', zoneName: 'Parking', type: 'SECURITY', severity: 'warning', message: 'Parking gate forced open', status: 'acknowledged', source: 'access-control', comment: 'False alarm - sensor glitch', createdAt: new Date(Date.now() - 172800000) },
  { id: 'a6', buildingId: 'b1', zoneId: 'z2', zoneName: 'Office 1', type: 'ENVIRONMENTAL', severity: 'info', message: 'CO2 level elevated in Office 1', status: 'resolved', source: 'sensor', comment: '', createdAt: new Date(Date.now() - 259200000) },
  { id: 'a7', buildingId: 'b1', zoneId: 'z12', zoneName: 'Clinic', type: 'HVAC', severity: 'critical', message: 'Clinic temperature out of range', status: 'open', source: 'bacnet', comment: '', createdAt: new Date(Date.now() - 300000) },
  { id: 'a8', buildingId: 'b1', zoneId: 'z6', zoneName: 'Parking', type: 'SECURITY', severity: 'info', message: 'Unauthorized access attempt - Parking Door', status: 'open', source: 'access-control', comment: '', createdAt: new Date(Date.now() - 600000) },
]

export const AUDIT_LOG_BASE: any[] = []

export const CAMERAS = [
  { id: 'c1', buildingId: 'b1', name: 'Lobby Cam 1', state: 'ONLINE', streamUrl: '' },
  { id: 'c2', buildingId: 'b1', name: 'Parking Cam 1', state: 'ONLINE', streamUrl: '' },
  { id: 'c3', buildingId: 'b1', name: 'Lab Corridor Cam', state: 'OFFLINE', streamUrl: '' },
]

export const TENANTS = [
  { id: 't1', buildingId: 'b1', name: 'BioGen Labs', unit: '4A', contact: '+628123456789' },
  { id: 't2', buildingId: 'b1', name: 'MediCare Clinic', unit: '3B', contact: '+628987654321' },
  { id: 't3', buildingId: 'b1', name: 'PharmaCorp', unit: '2A', contact: '+628111222333' },
]
