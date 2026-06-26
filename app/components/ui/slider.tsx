// Shared range slider — extracted from hvac-controls + lighting-controls
'use client'

type SliderProps = {
  name: string
  min: number
  max: number
  step: number
  value: number
  onChange?: (value: number) => void
  formAction?: (formData: FormData) => void
  showLabels?: boolean
  unit?: string
  disabled?: boolean
}

const SLIDER_CLASS =
  'w-full h-[6px] rounded-full appearance-none cursor-pointer bg-[#242427]' +
  ' [&::-webkit-slider-thumb]:appearance-none' +
  ' [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px]' +
  ' [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0A84FF]' +
  ' [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer' +
  ' [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px]' +
  ' [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0A84FF]' +
  ' [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md' +
  ' [&::-moz-range-thumb]:cursor-pointer'

export function Slider({
  name,
  min,
  max,
  step,
  value,
  onChange,
  formAction,
  showLabels = true,
  unit = '',
  disabled = false,
}: SliderProps) {
  const Wrapper = formAction ? 'form' : 'div'

  return (
    <Wrapper action={formAction} className="relative">
      <input type="hidden" name="zoneId" value={''} />
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        defaultValue={value}
        disabled={disabled}
        className={SLIDER_CLASS}
        onChange={(e) => {
          if (!disabled) {
            onChange?.(Number(e.currentTarget.value))
            if (formAction) {
              e.currentTarget.form?.requestSubmit()
            }
          }
        }}
      />
      {showLabels && (
        <div className="flex justify-between mt-1">
          <span className="text-[11px] text-[#8E8E93]">{min}{unit}</span>
          <span className="text-[13px] font-medium text-white">{value}{unit}</span>
          <span className="text-[11px] text-[#8E8E93]">{max}{unit}</span>
        </div>
      )}
    </Wrapper>
  )
}
