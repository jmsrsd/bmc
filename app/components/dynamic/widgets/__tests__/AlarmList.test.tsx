import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AlarmList } from '../AlarmList'
import type { WidgetConfig } from '@/lib/ui-config/types'

// Mock child UI controls
vi.mock('@/components/ui/alarm-ack-form', () => ({
  AlarmAckForm: vi.fn(() => <div data-testid="alarm-ack-form">AlarmAckForm</div>),
}))

const baseConfig: WidgetConfig = {
  id: 'alarm-1',
  type: 'alarm-list',
  title: 'Fire Alarms',
  deviceId: 'alarm-panel-1',
  capabilities: [],
}

describe('AlarmList', () => {
  it('renders header with title', () => {
    render(<AlarmList config={baseConfig} />)
    expect(screen.getByText('Fire Alarms')).toBeInTheDocument()
  })

  it('renders deviceType badge when provided', () => {
    render(<AlarmList config={{ ...baseConfig, deviceType: 'Smoke Detector' }} />)
    expect(screen.getByText('Smoke Detector')).toBeInTheDocument()
  })

  it('renders Active Alarm section and AlarmAckForm when capability alarm-ack and deviceId present', () => {
    render(<AlarmList config={{ ...baseConfig, capabilities: ['alarm-ack'] }} />)
    expect(screen.getByText('Active Alarm')).toBeInTheDocument()
    expect(screen.getByTestId('alarm-ack-form')).toBeInTheDocument()
    expect(screen.getByText('alarm-panel-1')).toBeInTheDocument()
  })

  it('shows "No alarms" when alarm-ack capability missing', () => {
    render(<AlarmList config={baseConfig} />)
    expect(screen.getByText('No alarms')).toBeInTheDocument()
    expect(screen.queryByText('Active Alarm')).not.toBeInTheDocument()
    expect(screen.queryByTestId('alarm-ack-form')).not.toBeInTheDocument()
  })

  it('does not render Active Alarm when deviceId is missing even with capability', () => {
    const config: WidgetConfig = {
      ...baseConfig,
      deviceId: undefined,
      capabilities: ['alarm-ack'],
    }
    render(<AlarmList config={config} />)
    expect(screen.queryByText('Active Alarm')).not.toBeInTheDocument()
    expect(screen.queryByTestId('alarm-ack-form')).not.toBeInTheDocument()
    // No alarm-ack capability means no alarm-ack control... but wait:
    // The widget checks config.capabilities?.includes('alarm-ack') && config.deviceId
    // If deviceId is missing, the condition is false, so it falls to the else:
    // (!config.capabilities?.includes('alarm-ack')) which is false (it IS included)
    // So neither branch renders. No "No alarms" message, no controls.
    expect(screen.queryByText('No alarms')).not.toBeInTheDocument()
  })
})
