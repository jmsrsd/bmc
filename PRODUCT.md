# BMC — Product Design Context

## Identity

**Brand:** Biomedical Campus (BMC) — Indonesia's first integrated smart building for healthcare, technology, and education. Dual-tower (Knowledge Tower + Science Tower), Digital Hub SEZ, BSD City.

**Lane:** Professional — this is app UI / dashboard / tool. Design serves the product. Information delivery, precise monitoring, anomaly detection. Not marketing, not editorial.

**Register:** Product — dashboard UI for facility management. The user reads data, responds to statuses, controls building systems.

**Audience:** Facility managers, building engineers, security operators, energy analysts. Technical professionals. High-density information environment. Used daily for hours.

## Voice & Tone

- **Precise:** Every label is exact. No decorative language. "AHU-01 Supply Temp 14.2°C", not "Temperature Overview".
- **Calm:** Dark, quiet interface. Data is the signal. No flashing, no bounce, no decorative motion.
- **Authoritative:** Status indicators command attention by their rarity. An active alarm is visually significant precisely because everything else is silent.
- **Professional:** Industry terms used correctly (BACnet, AHU, VAV, setpoint, demand response, Kafka topic, Sparkplug B).

## Anti-References

Never produce:
- Bright/colorful SaaS dashboards (blue/white/teal)
- "Gaming" aesthetics (neon, glows, dark purple)
- Skeuomorphic building controls (fake switches, 3D dials)
- Warm/cream/sand backgrounds
- Gradient text or glassmorphism-as-default
- Card-centric dashboards with drop shadows

## Visual Strategy

### Color Strategy: Restrained

Dark mode exclusively. The UI is a silent stage. Only status anomalies (critical alarms) command attention.

**Theme justification:** Operators monitor this in dim control rooms. Light mode would be physically uncomfortable during night shifts. Dark mode is not a style choice — it's ergonomic.

**Palette reference:**
- Canvas: `#0B0B0C` (near-black)
- Surface: `#121214` (dark card)
- Elevated: `#1C1C1E` (dropdown/popover)
- Border hairline: `#242427` (1px dividers only)
- Status critical: `#FF453A` (6px LED)
- Status warning: `#FF9F0A` (6px LED)
- Status normal: `#32D74B` (6px LED)
- Status active: `#0A84FF` (interactive)

### Typography

- Headings: SF Pro Display, 24px Semi-Bold, -0.02em tracking
- Section titles: Inter 14px Medium, `#8E8E93`
- Data/metrics: JetBrains Mono 32px Light, white
- Body: Inter 12px Regular, `#AEAEB2`
- Mono for all telemetry, measurements, IDs

### Density

Medium-low density. Data cards with generous padding (p-4 to p-6), 16px grid gap, 24px section spacing. Information-dense but not cramped.

### Motion

Zero decorative animation. No bounce, no elastic, no parallax. Status transitions (alarm → acknowledged) use subtle crossfade if any. `prefers-reduced-motion` respected.

## Design Conventions

- **Status LEDs:** 6px (`w-1.5 h-1.5`) rounded dots, not text badges where possible
- **Cards:** Glassmorphism-light (`bg-bg-surface/50 backdrop-blur border border-border-hairline rounded-xl`). Avoid `border-l-4` side accents.
- **Grid:** 12-column ink grid, 16px gap
- **Icons:** Lucide, monochrome. Icon color matches status (critical=red, warning=amber)
- **Empty states:** Present and informative — never blank/loading spinners

## Key Experience Principles

1. **Information, not interface** — the UI retreats; data and anomalies command attention
2. **Physical hardware mental model** — status indicators mimic precise emissive LEDs
3. **Data density** — operators scan, not read. Show more, explain less
4. **Alarm rarity** — if everything is urgent, nothing is
5. **Restraint over decoration** — no heavy borders, shadows, gradients
