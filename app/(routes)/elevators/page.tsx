import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpFromLine, ArrowUp, ArrowDown, DoorOpen, DoorClosed } from 'lucide-react'
import { ElevatorRecallForm } from './elevator-recall-form'
import { ElevatorClearRecallButton } from './elevator-clear-recall'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Elevators | BMC',
  description: 'Elevator car status, direction, floor recall control',
}

const carStateBadge: Record<string, string> = {
  NORMAL: 'bg-green-500/10 text-green-400',
  FAULT: 'bg-red-500/10 text-red-400',
  RECALL: 'bg-amber-500/10 text-amber-400',
}

function DirectionIcon({ direction }: { direction: string }) {
  switch (direction) {
    case 'UP':
      return <ArrowUp className="w-5 h-5 text-green-400" />
    case 'DOWN':
      return <ArrowDown className="w-5 h-5 text-red-400" />
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-gray-500 text-lg">—</span>
  }
}

function DoorIcon({ doorState }: { doorState: string }) {
  switch (doorState) {
    case 'OPEN':
      return <DoorOpen className="w-4 h-4 text-blue-400" />
    case 'CLOSED':
      return <DoorClosed className="w-4 h-4 text-gray-400" />
    default:
      return <DoorClosed className="w-4 h-4 text-gray-500" />
  }
}

export default async function ElevatorsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const elevators = await prisma.elevator.findMany({
    include: { cars: true },
    orderBy: { name: 'asc' },
  })

  const totalCars = elevators.reduce((sum, e) => sum + e.cars.length, 0)
  const recallCars = elevators.reduce((sum, e) => sum + e.cars.filter((c) => c.state === 'RECALL').length, 0)

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Elevators</h1>
        <p className="text-gray-400 mt-1">
          {elevators.length} bank{elevators.length !== 1 ? 's' : ''} · {totalCars} car{totalCars !== 1 ? 's' : ''}
          {recallCars > 0 && ` · ${recallCars} under recall`}
        </p>
      </div>

      {/* Elevator Banks */}
      {elevators.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-12 text-center">
          <ArrowUpFromLine className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Elevators</h2>
          <p className="text-gray-400">No elevator banks configured.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {elevators.map((elevator) => (
            <section key={elevator.id}>
              <h2 className="text-xl font-semibold text-white mb-4">{elevator.name}</h2>
              {elevator.cars.length === 0 ? (
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8 text-center">
                  <p className="text-gray-500">No cars configured</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {elevator.cars.map((car) => (
                    <div
                      key={car.id}
                      className={`bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-5 ${
                        car.state === 'RECALL' ? 'ring-1 ring-amber-500/40' : ''
                      }`}
                    >
                      {/* Car Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white">{car.name}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            carStateBadge[car.state] ?? 'bg-gray-500/10 text-gray-400'
                          }`}
                        >
                          {car.state}
                        </span>
                      </div>

                      {/* Floor + Direction */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="bg-gray-900/60 rounded-lg px-4 py-2 text-center">
                          <p className="text-2xl font-bold text-white">{car.floor}</p>
                          <p className="text-xs text-gray-500">Floor</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <DirectionIcon direction={car.direction} />
                          <span className="text-xs text-gray-500 mt-0.5 capitalize">{car.direction.toLowerCase()}</span>
                        </div>
                      </div>

                      {/* Door State */}
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <DoorIcon doorState={car.doorState} />
                        <span>{car.doorState === 'OPEN' ? 'Open' : 'Closed'}</span>
                      </div>

                      {/* Recall Info */}
                      {car.state === 'RECALL' && car.recallFloor != null && car.recallFloor > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-3">
                          <p className="text-xs text-amber-400">
                            Recalled to floor {car.recallFloor}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-700/50">
                        <ElevatorRecallForm carId={car.id} currentFloor={car.floor} />
                        {car.state === 'RECALL' && (
                          <ElevatorClearRecallButton carId={car.id} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
