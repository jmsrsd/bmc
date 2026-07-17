import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { ElevatorRecallForm } from './elevator-recall-form'
import { ElevatorClearRecall } from './elevator-clear-recall'
import { STATE_COLORS } from './_helpers'
import { Arrow, StatusDot } from './_components'

function ElevatorCarCard({ car, elevatorName }: { car: any; elevatorName: string }) {
  return (
    <div className="bg-surface/50 border border-hairline rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-medium text-white">{car.name}</h3>
          <p className="text-[12px] text-secondary mt-0.5">{elevatorName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-medium uppercase tracking-wider"
            style={{ color: STATE_COLORS[car.state] ?? '#8E8E93' }}
          >
            {car.state}
          </span>
          <StatusDot state={car.state} />
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-4">
        <div className="flex items-baseline gap-2">
          <span
            className="font-['JetBrains_Mono'] text-[28px] text-white leading-none"
          >
            {car.floor}
          </span>
          <span className="text-[12px] text-secondary">Floor</span>
        </div>
        <Arrow direction={car.direction} />
      </div>

      <div className="flex items-center gap-3 mt-3 text-[12px] text-body">
        <span>Door: {car.doorState}</span>
      </div>

      {car.state === 'NORMAL' && (
        <ElevatorRecallForm
          carId={car.id}
          currentFloor={car.floor}
          carName={car.name}
        />
      )}

      {car.state === 'RECALL' && (
        <ElevatorClearRecall carId={car.id} carName={car.name} />
      )}
    </div>
  )
}

export default async function ElevatorsPage() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      elevators: {
        include: {
          cars: true,
        },
      },
    },
  })

  if (!building) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-secondary text-[14px]">Building not found</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Elevators" subtitle="Car status & recall control" />
      {building.elevators.length === 0 ? (
        <p className="text-[14px] text-secondary mt-6">No elevators configured</p>
      ) : (
        building.elevators.map((elevator: any) => (
          <div key={elevator.id} className="mt-6 first:mt-6">
            {elevator.cars.length === 0 ? (
              <p className="text-[12px] text-secondary">{elevator.name} — No cars</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {elevator.cars.map((car: any) => (
                  <ElevatorCarCard
                    key={car.id}
                    car={car}
                    elevatorName={elevator.name}
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}