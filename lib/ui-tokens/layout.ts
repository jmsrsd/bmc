// Layout & surface class tokens — DESIGN.md §7.4.3

export const SURFACE = {
  // Glass card / container
  card: 'bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5',
  cardNoPad: 'bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl',

  // Elevated interactive surface
  elevated: 'bg-[#1C1C1E] border border-[#242427] rounded-lg px-3 py-2',

  // Input
  input:
    'w-full bg-[#1C1C1E] border border-[#242427] rounded-lg px-3 py-2.5 text-[14px] text-white placeholder-[#8E8E93] outline-none focus:border-[#0A84FF] transition-colors',

  inputSmall:
    'bg-[#1C1C1E] border border-[#242427] rounded-lg px-3 py-2 text-[13px] text-white placeholder-[#8E8E93] outline-none focus:border-[#0A84FF] transition-colors',

  // Empty state flex center
  emptyCenter: 'flex items-center justify-center min-h-[40vh]',
} as const

export const GRID = {
  cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  statGrid: 'grid grid-cols-1 sm:grid-cols-3 gap-4',
  statGridWide: 'grid grid-cols-2 md:grid-cols-4 gap-4',
} as const

export const BUTTON_VARIANTS = {
  primary: 'bg-[#0A84FF]/10 text-[#0A84FF] hover:bg-[#0A84FF]/20',
  danger: 'bg-[#FF453A]/10 text-[#FF453A] hover:bg-[#FF453A]/20',
  warning: 'bg-[#FF9F0A]/10 text-[#FF9F0A] hover:bg-[#FF9F0A]/20',
  normal: 'bg-[#32D74B]/10 text-[#32D74B] hover:bg-[#32D74B]/20',
  ghost: 'bg-transparent text-[#AEAEB2] hover:bg-[#242427]',

  doorLocked: 'bg-[#32D74B]/10 text-[#32D74B] hover:bg-[#32D74B]/20 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50',
  doorUnlocked: 'bg-[#FF9F0A]/10 text-[#FF9F0A] hover:bg-[#FF9F0A]/20 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50',
} as const
