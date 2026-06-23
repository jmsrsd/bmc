# BMC Revision Plan — Biomedical Campus Data Alignment

## Goal
Replace generic "Green Office Tower" demo data with verified real-world data for **Biomedical Campus (BMC) BSD City** — a Sinar Mas Land smart building in the Digital Hub SEZ.

## Research Sources
- dhub-sez.com (official SEZ website — tower specs, tenants, floor plans)
- sinarmasland.com (sustainability case study)
- gbcindonesia.org (GREENSHIP GOLD certification)
- tatamulia.co.id (contractor — GFA 30,638 sqm, 2BS+8F+4F podium)
- asiapropertyawards.com (award details)
- Various news articles (Etana, Monash, Odoo, NEC, FS Regenera, etc.)

## Verification
- Prior to deleting this file, all scoped deliverables must be confirmed written and syntactically valid.
- Delete this file only after the full plan is carried out.

## Execution Steps

### 1. `prisma/seed.ts` — Full rewrite
- Building: Biomedical Campus, real address (Kavling Digital Hub, Jl. Damai Foresta, Sampora, Cisauk)
- 2-tower zone structure: Knowledge Tower (8 office floors GF-8 + 2BS) + Science Tower (4 medical floors GF-3 + 2BS)
- Knowledge Tower zones: Premium Office (floors 2-7), Lobby (GF), Executive (8F), Retail/Podium (mezzanine)
- Science Tower zones: Bio Cell Lab (1F), Fertility Center (2F), Advanced Diagnostics (3F), Lobby/Amenities (GF)
- Real tenants per floor (Odoo 6F KT, NEC, Monash; FS Regenera 1F ST, Alpha IVF 2F ST, ATOP 3F ST, etc.)
- Biomedical sensors: temp/humidity (cold storage), VOCs, particle count, medical gas pressure, CO2
- Alarms: lab temp excursion, medical gas pressure drop, HEPA filter clog, biohazard alert, power quality
- Amenities data: 280 car lots, 294 motorcycle lots, facility features

### 2. `DESIGN.md` §1 — Update context
- Building name, address, developer, architect (NBBJ), certification (GREENSHIP GOLD)
- Dual-tower structure description
- Smart building features (VMS FR/QR, smart parking, Microsoft-backed BMS)

### 3. `USECASE.md` — Add biomedical use cases
- UC-BIO-01: Monitor lab cold storage (2-8°C, -20°C, -80°C)
- UC-BIO-02: Medical gas monitoring (O₂, N₂, CO₂ pressure)
- UC-BIO-03: Cleanroom HEPA + particle count
- UC-BIO-04: VMS/FR access for restricted zones

### 4. UI metadata — Building name references
- `app/layout.tsx` — title/description for BMC
- `app/page.tsx` — dashboard references

### 5. `lib/types.ts` — Add ZoneType entries
- LABORATORY, CLINIC, CLEANROOM, PHARMACY, BIOSAFETY if missing

## Files NOT modified
- AGENTS.md, TESTING.md, middleware.ts, auth.ts, prisma.ts, useSSE.ts
- API routes, SSE routes, test infrastructure, Prisma schema
- .next/, node_modules/
