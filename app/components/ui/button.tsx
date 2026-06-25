'use client'

import { forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'danger' | 'warning' | 'ghost' | 'normal'
export type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-[#0A84FF]/10 text-[#0A84FF] hover:bg-[#0A84FF]/20',
  danger: 'bg-[#FF453A]/10 text-[#FF453A] hover:bg-[#FF453A]/20',
  warning: 'bg-[#FF9F0A]/10 text-[#FF9F0A] hover:bg-[#FF9F0A]/20',
  normal: 'bg-[#32D74B]/10 text-[#32D74B] hover:bg-[#32D74B]/20',
  ghost: 'bg-transparent text-[#AEAEB2] hover:bg-[#242427]',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 font-medium ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
