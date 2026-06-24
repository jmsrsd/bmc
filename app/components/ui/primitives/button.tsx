'use client'

import { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'status-active' | 'status-warning' | 'status-critical' | 'status-normal'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  active?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-status-active hover:opacity-90 text-white',
  secondary: 'bg-bg-surface hover:bg-border-hairline text-muted-foreground',
  'status-active': 'bg-status-active hover:opacity-90 text-white',
  'status-warning': 'bg-status-warning hover:opacity-90 text-white',
  'status-critical': 'bg-status-critical hover:opacity-95 text-white',
  'status-normal': 'bg-status-normal hover:opacity-90 text-white',
}

export function Button({ variant = 'primary', active = false, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-status-active disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    />
  )
}