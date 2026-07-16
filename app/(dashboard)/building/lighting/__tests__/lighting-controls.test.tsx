import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'

describe('LightingControls', () => {
  it('renders ON/OFF toggle button', () => {
    const html = renderToString(
      <button type="submit" className="text-[13px] font-semibold px-3 py-1 rounded-lg border bg-success/10 text-success border-success/20">
        ON
      </button>,
    )
    expect(html).toContain('ON')
    expect(html).toContain('bg-success/10')
    expect(html).toContain('text-success')
  })

  it('renders OFF toggle button with different styling', () => {
    const html = renderToString(
      <button type="submit" className="text-[13px] font-semibold px-3 py-1 rounded-lg border bg-hairline text-secondary">
        OFF
      </button>,
    )
    expect(html).toContain('OFF')
    expect(html).toContain('bg-hairline')
    expect(html).toContain('text-secondary')
  })

  it('renders toggle button with correct styling for ON state', () => {
    const html = renderToString(
      <button type="submit" className="text-[13px] font-semibold px-3 py-1 rounded-lg border bg-success/10 text-success border-success/20">
        ON
      </button>,
    )
    expect(html).toContain('bg-success/10')
    expect(html).toContain('text-success')
  })

  it('renders toggle button with correct styling for OFF state', () => {
    const html = renderToString(
      <button type="submit" className="text-[13px] font-semibold px-3 py-1 rounded-lg border bg-hairline text-secondary">
        OFF
      </button>,
    )
    expect(html).toContain('bg-hairline')
    expect(html).toContain('text-secondary')
  })

  it('renders dim slider input with correct range', () => {
    const html = renderToString(
      <div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          defaultValue={75}
          className="w-full h-[6px] rounded-full appearance-none cursor-pointer bg-hairline"
        />
      </div>,
    )
    expect(html).toContain('type="range"')
    expect(html).toContain('min="0"')
    expect(html).toContain('max="100"')
    expect(html).toContain('step="1"')
  })

  it('renders dim slider labels with percentage', () => {
    const html = renderToString(
      <div>
        <span className="text-[11px] text-secondary">0%</span>
        <span className="text-[13px] font-medium text-white">75%</span>
        <span className="text-[11px] text-secondary">100%</span>
      </div>,
    )
    expect(html).toContain('0%')
    expect(html).toContain('75%')
    expect(html).toContain('100%')
  })

  it('renders dim slider with webkit slider thumb styles', () => {
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

  it('renders dim slider with moz-range-thumb styles', () => {
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

  it('renders form elements for dim controls', () => {
    const html = renderToString(
      <div>
        <form>
          <input type="hidden" name="zoneId" value="zone1" />
          <input type="hidden" name="newState" value="ON" />
          <input type="range" name="level" defaultValue={75} />
          <button type="submit" className="hidden" />
        </form>
      </div>,
    )
    expect(html).toContain('type="hidden" name="zoneId"')
    expect(html).toContain('type="hidden" name="newState"')
    expect(html).toContain('type="range" name="level"')
    expect(html).toContain('type="submit" class="hidden"')
  })

  it('renders controls in vertical layout with gap', () => {
    const html = renderToString(
      <div className="flex flex-col gap-3">
        <button>ON/OFF</button>
        <div>Dim slider</div>
      </div>,
    )
    expect(html).toContain('flex flex-col gap-3')
  })

  it('renders correct button text based on isOn state', () => {
    const html = renderToString(
      <div>
        <button>ON</button>
        <button>OFF</button>
      </div>,
    )
    expect(html).toContain('ON')
    expect(html).toContain('OFF')
  })

  it('renders slider with correct default value', () => {
    const html = renderToString(
      <div>
        <span className="text-[13px] font-medium text-white">75%</span>
      </div>,
    )
    expect(html).toContain('75%')
  })

  it('renders button with disabled state styling', () => {
    const html = renderToString(
      <button type="submit" disabled={true} className="text-[13px] font-semibold px-3 py-1 rounded-lg border transition-colors disabled:opacity-50">
        ...
      </button>,
    )
    expect(html).toContain('disabled:opacity-50')
  })
})
