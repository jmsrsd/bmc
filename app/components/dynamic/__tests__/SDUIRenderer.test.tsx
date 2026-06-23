import { describe, it, expect, vi, afterEach, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SDUIRenderer } from '../SDUIRenderer'
import { UnknownWidget } from '../UnknownWidget'
import type { WidgetConfig } from '@/lib/ui-config/types'

// Mock Server Actions that child UI components depend on
vi.mock('@/lib/actions', () => ({
  setTemperature: vi.fn(async () => ({})),
  setFanSpeed: vi.fn(async () => ({})),
  setHvacMode: vi.fn(async () => ({})),
  setDimLevel: vi.fn(async () => ({})),
  toggleLight: vi.fn(async () => ({})),
  setDoorState: vi.fn(async () => ({})),
}))

const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

const baseConfig: WidgetConfig = {
  id: 'test-1',
  type: 'hvac-control',
  title: 'Test Widget',
  capabilities: [],
}

describe('SDUIRenderer', () => {
  afterEach(() => {
    consoleErrorSpy.mockClear()
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders HvacCard for hvac-control type', () => {
    render(<SDUIRenderer config={{ ...baseConfig, type: 'hvac-control', title: 'Main Zone HVAC' }} />)
    expect(screen.getByText('Main Zone HVAC')).toBeInTheDocument()
  })

  it('renders HvacCard for hvac-status type', () => {
    render(<SDUIRenderer config={{ ...baseConfig, type: 'hvac-status', title: 'HVAC Status' }} />)
    expect(screen.getByText('HVAC Status')).toBeInTheDocument()
  })

  it('renders LightingCard for lighting-control type', () => {
    render(<SDUIRenderer config={{ ...baseConfig, type: 'lighting-control', title: 'Zone Lights' }} />)
    expect(screen.getByText('Zone Lights')).toBeInTheDocument()
  })

  it('renders DoorCard for door-status type', () => {
    render(<SDUIRenderer config={{ ...baseConfig, type: 'door-status', title: 'Front Door' }} />)
    expect(screen.getByText('Front Door')).toBeInTheDocument()
  })

  it('renders UnknownWidget for unrecognized type and logs error', () => {
    process.env.NODE_ENV = 'development'
    render(<SDUIRenderer config={{ ...baseConfig, type: 'bogus-type', title: 'Bogus' }} />)
    expect(screen.getByText(/unknown widget/i)).toBeInTheDocument()
    expect(screen.getByText(/bogus-type/i)).toBeInTheDocument()
    expect(screen.getByText('test-1')).toBeInTheDocument()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'SDUI: unknown widget type "bogus-type" for test-1'
    )
  })

  it('passes config prop to rendered widget', () => {
    render(<SDUIRenderer config={{ ...baseConfig, type: 'lighting-control', title: 'Custom Lights' }} />)
    expect(screen.getByText('Custom Lights')).toBeInTheDocument()
  })
})

describe('UnknownWidget', () => {
  const OLD_ENV = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = OLD_ENV
  })

  it('shows unknown widget type and id in development', () => {
    process.env.NODE_ENV = 'development'
    const config: WidgetConfig = { ...baseConfig, type: 'bogus-type', title: 'Bogus' }
    render(<UnknownWidget config={config} />)
    expect(screen.getByText(/unknown widget/i)).toBeInTheDocument()
    expect(screen.getByText(/bogus-type/i)).toBeInTheDocument()
    expect(screen.getByText('test-1')).toBeInTheDocument()
  })

  it('returns null in production', () => {
    process.env.NODE_ENV = 'production'
    const config: WidgetConfig = { ...baseConfig, type: 'bogus-type', title: 'Bogus' }
    const { container } = render(<UnknownWidget config={config} />)
    expect(container.firstChild).toBeNull()
  })
})
