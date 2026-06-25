/**
 * Zone grouping utilities — group zones by tower (Knowledge/Science/Support) and floor.
 * Used across Building Overview, HVAC, Lighting pages for consistent navigation.
 */

export type ZoneGroup = {
  tower: string
  towerSlug: string
  floors: { floor: number; zones: any[] }[]
}

const TOWER_PATTERNS = [
  { prefix: 'Knowledge Tower —', tower: 'Knowledge Tower', slug: 'knowledge-tower' },
  { prefix: 'Science Tower —', tower: 'Science Tower', slug: 'science-tower' },
] as const

/**
 * Extract tower name from a zone's name.
 * "Knowledge Tower — 2F Premium Office" → "Knowledge Tower"
 * "Food Court & Amenities" → "Support Areas"
 */
export function extractTower(name: string): { tower: string; slug: string } {
  for (const p of TOWER_PATTERNS) {
    if (name.startsWith(p.prefix)) return { tower: p.tower, slug: p.slug }
  }
  return { tower: 'Support Areas', slug: 'support-areas' }
}

/**
 * Strip tower prefix for display in zone cards.
 * "Knowledge Tower — 2F Premium Office" → "2F Premium Office"
 * "Food Court & Amenities" → "Food Court & Amenities" (unchanged)
 */
export function stripTowerPrefix(name: string): string {
  for (const p of TOWER_PATTERNS) {
    if (name.startsWith(p.prefix)) return name.slice(p.prefix.length).trim()
  }
  return name
}

/** Tower ordering: Knowledge (1), Science (2), Support (3) */
function towerRank(tower: string): number {
  if (tower === 'Knowledge Tower') return 1
  if (tower === 'Science Tower') return 2
  return 3
}

/**
 * Group zones into Tower → Floor hierarchy.
 * Floors sorted descending (top floor first).
 * Towers sorted: Knowledge → Science → Support.
 */
export function groupZonesByTowerAndFloor<T extends { name: string; floor: number }>(
  zones: T[],
): ZoneGroup[] {
  // Store both tower name and slug per zone
  const map = new Map<string, { slug: string; floorMap: Map<number, T[]> }>()

  for (const zone of zones) {
    const { tower, slug } = extractTower(zone.name)
    if (!map.has(tower)) map.set(tower, { slug, floorMap: new Map() })
    const entry = map.get(tower)!
    if (!entry.floorMap.has(zone.floor)) entry.floorMap.set(zone.floor, [])
    entry.floorMap.get(zone.floor)!.push(zone)
  }

  // Sort towers, then floors descending
  const towers = Array.from(map.keys()).sort((a, b) => towerRank(a) - towerRank(b))

  return towers.map((tower) => {
    const { slug, floorMap } = map.get(tower)!
    const floors = Array.from(floorMap.entries())
      .map(([floor, zones]) => ({ floor, zones }))
      .sort((a, b) => b.floor - a.floor) // highest floor first

    return { tower, towerSlug: slug, floors }
  })
}
