export const STATE_COLORS: Record<string, string> = {
  NORMAL: '#32D74B',
  RECALL: '#FF9F0A',
  FAULT: '#FF453A',
}

export function getStatusColor(state: string): string {
  return STATE_COLORS[state] ?? '#8E8E93'
}

export function getFloorDisplay(floor: number): string {
  return floor >= 0 ? `F${floor}` : `B${Math.abs(floor)}`
}

export function buildElevatorRows(building: any): any[] {
  if (!building) return []
  return building.elevators.flatMap((elevator: any) =>
    elevator.cars.map((car: any) => ({
      id: car.id,
      carName: car.name,
      elevatorName: elevator.name,
      floor: car.floor,
      direction: car.direction,
      state: car.state,
      doorState: car.doorState,
      statusColor: getStatusColor(car.state),
    }))
  )
}
