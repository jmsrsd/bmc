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
  primary: 'bg-active/10 text-active hover:bg-active/20',
  danger: 'bg-critical/10 text-critical hover:bg-critical/20',
  warning: 'bg-warning/10 text-warning hover:bg-warning/20',
  normal: 'bg-normal/10 text-normal hover:bg-normal/20',
  ghost: 'bg-transparent text-body hover:bg-hairline',
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
