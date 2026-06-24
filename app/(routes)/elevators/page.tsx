import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ArrowUpFromLine } from 'lucide-react'
import { ElevatorRecallForm } from './elevator-recall-form'
import { ElevatorClearRecallButton } from './elevator-clear-recall'
import { BackLink, PageHeader, EmptyState, ElevatorCard } from '@/components/ui/primitives'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Elevators | BMC',
  description: 'Elevator car status, direction, floor recall control',
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
      <BackLink href="/" label="Dashboard" />
      <PageHeader
        title="Elevators"
        subtitle={`${elevators.length} bank${elevators.length !== 1 ? 's' : ''} · ${totalCars} car${totalCars !== 1 ? 's' : ''}${recallCars > 0 ? ` · ${recallCars} under recall` : ''}`}
      />

      {elevators.length === 0 ? (
        <EmptyState
          icon={<ArrowUpFromLine className="w-12 h-12" />}
          title="No Elevators"
          description="No elevator banks configured."
        />
      ) : (
        <div className="space-y-8">
          {elevators.map((elevator) => (
            <section key={elevator.id}>
              <h2 className="text-xl font-semibold text-white mb-4">{elevator.name}</h2>
              {elevator.cars.length === 0 ? (
                <div className="bg-bg-surface/50 backdrop-blur border border-border-hairline rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">No cars configured</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {elevator.cars.map((car) => (
                    <ElevatorCard
                      key={car.id}
                      car={car}
                      recallForm={<ElevatorRecallForm carId={car.id} currentFloor={car.floor} />}
                      clearRecallBtn={car.state === 'RECALL' ? <ElevatorClearRecallButton carId={car.id} /> : undefined}
                    />
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
