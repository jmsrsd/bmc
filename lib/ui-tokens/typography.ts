// Typography class tokens — DESIGN.md §7.4.2

export const CN = {
  // Metric / large number display
  metric: "font-['JetBrains_Mono'] text-[32px] font-light text-white leading-none tracking-[-0.02em]",
  metricSmall: "font-['JetBrains_Mono'] text-[28px] font-light text-white leading-none",

  // Page title
  h1: 'text-[24px] font-semibold text-white leading-tight tracking-[-0.02em]',

  // Section title
  sectionTitle: 'text-[18px] font-semibold text-white',

  // Body text
  body: 'text-[14px] text-white',
  bodyMuted: 'text-[14px] text-[#AEAEB2]',
  bodyDim: 'text-[14px] text-[#8E8E93]',

  // Small / label
  label: 'text-[12px] text-[#8E8E93]',
  labelMono: "text-[12px] font-['JetBrains_Mono'] text-[#8E8E93]",

  // Data cell
  cellMono: "text-[14px] font-['JetBrains_Mono'] text-white",

  // Status label
  statusLabel: 'text-[11px] font-medium uppercase tracking-wider',
} as const
