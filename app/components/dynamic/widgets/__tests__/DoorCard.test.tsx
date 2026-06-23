import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DoorCard } from '../DoorCard'
import type { WidgetConfig } from '@/lib/ui-config/types'

// Mock child UI controls
vi.mock('@/components/ui/door-controls', () => ({
  DoorLockButton: vi.fn(() => <div data-testid="door-lock-button">DoorLockButton</div>),
}))

const baseConfig: WidgetConfig = {
  id: 'door-1',
  type: 'door-status',
  title: 'Main Entrance',
  deviceId: 'door-main',
  capabilities: [],
}

describe('DoorCard', () => {
  it('renders header with title', () => {
    render(<DoorCard config={baseConfig} />)
    expect(screen.getByText('Main Entrance')).toBeInTheDocument()
  })

  it('renders deviceType badge when provided', () => {
    render(<DoorCard config={{ ...baseConfig, deviceType: 'Electronic Strike' }} />)
    expect(screen.getByText('Electronic Strike')).toBeInTheDocument()
  })

  it('renders DoorLockButton when capability lock-unlock and deviceId present', () => {
    render(<DoorCard config={{ ...baseConfig, capabilities: ['lock-unlock'] }} />)
    expect(screen.getByTestId('door-lock-button')).toBeInTheDocument()
  })

  it('does not render DoorLockButton when lock-unlock capability missing', () => {
    render(<DoorCard config={baseConfig} />)
    expect(screen.queryByTestId('door-lock-button')).not.toBeInTheDocument()
  })

  it('does not render DoorLockButton when deviceId is missing even with capability', () => {
    const config: WidgetConfig = {
      ...baseConfig,
      deviceId: undefined,
      capabilities: ['lock-unlock'],
    }
    render(<DoorCard config={config} />)
    expect(screen.queryByTestId('door-lock-button')).not.toBeInTheDocument()
  })
})
