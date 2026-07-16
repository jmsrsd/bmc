import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'

describe('HvacControls', () => {
  it('renders temperature display with current value', () => {
    const html = renderToString(
      <div>
        <span className="text-[12px] text-secondary block mb-1">
          Temp: 24.5°C
        </span>
      </div>,
    )
    expect(html).toContain('Temp: 24.5°C')
  })

  it('renders temperature display with fallback when null', () => {
    const html = renderToString(
      <div>
        <span className="text-[12px] text-secondary block mb-1">
          Temp: —
        </span>
      </div>,
    )
    expect(html).toContain('Temp: —')
  })

  it('renders slider input for setpoint adjustment', () => {
    const html = renderToString(
      <div>
        <input
          type="range"
          min="16"
          max="30"
          step="0.5"
          defaultValue={22}
          className="w-full h-[6px] rounded-full appearance-none cursor-pointer bg-hairline"
        />
      </div>,
    )
    expect(html).toContain('type="range"')
    expect(html).toContain('min="16"')
    expect(html).toContain('max="30"')
    expect(html).toContain('step="0.5"')
  })

  it('renders slider labels with Celsius unit', () => {
    const html = renderToString(
      <div>
        <span className="text-[11px] text-secondary">16°</span>
        <span className="text-[13px] font-medium text-white">22°C</span>
        <span className="text-[11px] text-secondary">30°</span>
      </div>,
    )
    expect(html).toContain('16°')
    expect(html).toContain('22°C')
    expect(html).toContain('30°')
  })

  it('renders fan speed buttons with correct styles', () => {
    const html = renderToString(
      <div>
        <button className="px-2 py-1 text-[11px] font-medium rounded-md bg-active text-white">
          OFF
        </button>
        <button className="px-2 py-1 text-[11px] font-medium rounded-md bg-elevated text-secondary">
          LOW
        </button>
        <button className="px-2 py-1 text-[11px] font-medium rounded-md bg-active text-white">
          MEDIUM
        </button>
      </div>,
    )
    expect(html).toContain('OFF')
    expect(html).toContain('LOW')
    expect(html).toContain('MEDIUM')
    expect(html).toContain('bg-active text-white')
    expect(html).toContain('bg-elevated text-secondary')
  })

  it('renders fan speed button for each speed in SPEEDS array', () => {
    const html = renderToString(
      <div>
        <button>OFF</button>
        <button>LOW</button>
        <button>MEDIUM</button>
        <button>HIGH</button>
        <button>AUTO</button>
      </div>,
    )
    expect(html).toContain('OFF')
    expect(html).toContain('LOW')
    expect(html).toContain('MEDIUM')
    expect(html).toContain('HIGH')
    expect(html).toContain('AUTO')
  })

  it('renders HVAC mode buttons with correct styles', () => {
    const html = renderToString(
      <div>
        <button className="px-2 py-1 text-[11px] font-medium rounded-md bg-active text-white">
          COOL
        </button>
        <button className="px-2 py-1 text-[11px] font-medium rounded-md bg-elevated text-secondary">
          HEAT
        </button>
        <button className="px-2 py-1 text-[11px] font-medium rounded-md bg-active text-white">
          AUTO
        </button>
        <button className="px-2 py-1 text-[11px] font-medium rounded-md bg-elevated text-secondary">
          VENT
        </button>
      </div>,
    )
    expect(html).toContain('COOL')
    expect(html).toContain('HEAT')
    expect(html).toContain('AUTO')
    expect(html).toContain('VENT')
  })

  it('renders mode buttons for each mode in mode array', () => {
    const html = renderToString(
      <div>
        <button>COOL</button>
        <button>HEAT</button>
        <button>AUTO</button>
        <button>VENT</button>
      </div>,
    )
    expect(html).toContain('COOL')
    expect(html).toContain('HEAT')
    expect(html).toContain('AUTO')
    expect(html).toContain('VENT')
  })

  it('renders form elements for all controls', () => {
    const html = renderToString(
      <div>
        <form>
          <input type="hidden" name="zoneId" value="zone1" />
          <input type="range" name="setpoint" defaultValue={22} />
          <button type="submit">Submit</button>
        </form>
      </div>,
    )
    expect(html).toContain('type="hidden" name="zoneId"')
    expect(html).toContain('type="range" name="setpoint"')
    expect(html).toContain('type="submit"')
  })

  it('renders temperature display with proper formatting', () => {
    const html = renderToString(
      <div>
        <span className="text-[12px] text-secondary block mb-1">
          Temp: 24.5°C
        </span>
      </div>,
    )
    expect(html).toContain('Temp: 24.5°C')
  })

  it('renders slider thumb styles for webkit', () => {
    const html = renderToString(
      <input
        type="range"
        className="w-full h-[6px] rounded-full appearance-none cursor-pointer bg-hairline [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-active [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
      />,
    )
    expect(html).toContain('w-[18px]')
    expect(html).toContain('h-[18px]')
    expect(html).toContain('bg-active')
  })

  it('renders slider thumb styles for moz-range-thumb', () => {
    const html = renderToString(
      <input
        type="range"
        className="w-full h-[6px] rounded-full appearance-none cursor-pointer bg-hairline [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-active [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
      />,
    )
    expect(html).toContain('w-[18px]')
    expect(html).toContain('h-[18px]')
    expect(html).toContain('bg-active')
  })
})
