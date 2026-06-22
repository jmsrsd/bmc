// Shared types for BMC
// USECASE.md actors §1.1
export interface User {
  id: string
  role: Role
  name: string
}

// Matches USECASE.md §1.1 + DESIGN.md §6.2
export type Role = 'viewer' | 'tech' | 'operator' | 'security' | 'energy' | 'admin' | 'superadmin'

export const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 0,
  tech: 1,
  operator: 2,
  security: 3,
  energy: 4,
  admin: 5,
  superadmin: 6,
}

// Matches DESIGN.md §2.2 enums
export type HVACType = 'AHU' | 'VAV' | 'FCU' | 'CHILLER' | 'BOILER' | 'HP' | 'EXHAUST_FAN' | 'HEPA_FILTER' | 'BIOSAFETY_CABINET'
export type HVACMode = 'COOL' | 'HEAT' | 'AUTO' | 'VENT'
export type FanSpeed = 'OFF' | 'LOW' | 'MEDIUM' | 'HIGH' | 'AUTO'
export type HVACState = 'ON' | 'OFF' | 'STANDBY' | 'FAULT'
export type ZoneType = 'OFFICE' | 'LOBBY' | 'CORRIDOR' | 'PARKING' | 'MECHANICAL' | 'WAREHOUSE' | 'STAIR' | 'LAB' | 'CLINIC' | 'CLEANROOM' | 'PHARMACY' | 'BIOSAFETY' | 'RETAIL' | 'FOOD_COURT'
export type SensorType = 'TEMPERATURE' | 'HUMIDITY' | 'CO2' | 'PIR' | 'LIGHT' | 'PRESSURE' | 'FLOW' | 'VIBRATION' | 'SMOKE' | 'VOC' | 'PARTICLE_COUNT' | 'MEDICAL_GAS' | 'DOOR_CONTACT' | 'GAS_PRESSURE'
export type AlarmSeverity = 'info' | 'warning' | 'critical'
export type AlarmStatus = 'open' | 'acknowledged' | 'resolved'
export type DoorState = 'LOCKED' | 'UNLOCKED' | 'OPEN' | 'FORCED'
export type FirePanelState = 'NORMAL' | 'ALARM' | 'FAULT' | 'DISCONNECTED'
export type ElevatorDirection = 'UP' | 'DOWN' | 'IDLE'
export type ElevatorDoorState = 'OPEN' | 'CLOSED' | 'OPENING' | 'CLOSING'

export const BUILDING_ID = 'b1'
