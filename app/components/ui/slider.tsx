'use client'

type SliderProps = {
  name: string
  min: number
  max: number
  step: number
  value: number
  showLabels?: boolean
  unit?: string
  disabled?: boolean
  formAction?: (formData: FormData) => void
}

export function Slider({
  name, min, max, step, value,
  showLabels = true,
  unit = '',
  disabled = false,
  formAction,
}: SliderProps) {
  const input = (
    <input
      type="range"
      name={name}
      min={min}
      max={max}
      step={step}
      defaultValue={value}
      disabled={disabled}
      className="w-full h-[6px] rounded-full appearance-none cursor-pointer bg-hairline
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-[18px]
        [&::-webkit-slider-thumb]:h-[18px]
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-active
        [&::-webkit-slider-thumb]:shadow-md
        [&::-webkit-slider-thumb]:cursor-pointer"
    />
  )

  const labels = showLabels ? (
    <div className="flex justify-between mt-1">
      <span className="text-[11px] text-secondary">{min}{unit}</span>
      <span className="text-[13px] font-medium text-white">{value}{unit}</span>
      <span className="text-[11px] text-secondary">{max}{unit}</span>
    </div>
  ) : null

  if (formAction) {
    return (
      <form action={formAction}>
        {input}
        {labels}
      </form>
    )
  }

  return (
    <div>
      {input}
      {labels}
    </div>
  )
}
