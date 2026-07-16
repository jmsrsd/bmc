import { describe, it, expect } from 'vitest'
import { extractTower, stripTowerPrefix, groupZonesByTowerAndFloor } from '../zone-group'

describe('extractTower', () => {
  it('identifies Knowledge Tower from prefixed name', () => {
    expect(extractTower('Knowledge Tower — 2F Premium Office')).toEqual({
      tower: 'Knowledge Tower',
      slug: 'knowledge-tower',
    })
  })

  it('identifies Science Tower from prefixed name', () => {
    expect(extractTower('Science Tower — 1F Lab Alpha')).toEqual({
      tower: 'Science Tower',
      slug: 'science-tower',
    })
  })

  it('falls back to Support Areas for unrecognised names', () => {
    expect(extractTower('Food Court & Amenities')).toEqual({
      tower: 'Support Areas',
      slug: 'support-areas',
    })
  })

  it('falls back for empty string', () => {
    expect(extractTower('')).toEqual({ tower: 'Support Areas', slug: 'support-areas' })
  })
})

describe('stripTowerPrefix', () => {
  it('removes Knowledge Tower prefix', () => {
    expect(stripTowerPrefix('Knowledge Tower — 2F Premium Office')).toBe('2F Premium Office')
  })

  it('removes Science Tower prefix', () => {
    expect(stripTowerPrefix('Science Tower — 1F Lab Alpha')).toBe('1F Lab Alpha')
  })

  it('returns name unchanged when no prefix matches', () => {
    expect(stripTowerPrefix('Food Court & Amenities')).toBe('Food Court & Amenities')
  })

  it('handles empty string', () => {
    expect(stripTowerPrefix('')).toBe('')
  })
})

describe('groupZonesByTowerAndFloor', () => {
  const sampleZones = [
    { id: 'z1', name: 'Knowledge Tower — 2F Premium Office', floor: 2 },
    { id: 'z2', name: 'Knowledge Tower — 1F Lobby', floor: 1 },
    { id: 'z3', name: 'Science Tower — 3F Lab Gamma', floor: 3 },
    { id: 'z4', name: 'Science Tower — 1F Lab Alpha', floor: 1 },
    { id: 'z5', name: 'Food Court', floor: 1 },
  ]

  it('groups zones by tower then floor descending', () => {
    const result = groupZonesByTowerAndFloor(sampleZones)
    expect(result).toHaveLength(3)

    // Tower order: Knowledge → Science → Support
    expect(result[0].tower).toBe('Knowledge Tower')
    expect(result[1].tower).toBe('Science Tower')
    expect(result[2].tower).toBe('Support Areas')
  })

  it('floors sorted descending within each tower', () => {
    const result = groupZonesByTowerAndFloor(sampleZones)
    const knowledge = result[0]
    expect(knowledge.floors.map((f) => f.floor)).toEqual([2, 1])
  })

  it('each floor contains correct zones', () => {
    const result = groupZonesByTowerAndFloor(sampleZones)
    const science2f = result[1].floors.find((f) => f.floor === 3)
    expect(science2f?.zones).toHaveLength(1)
    expect(science2f?.zones[0].id).toBe('z3')
  })

  it('returns empty array for empty input', () => {
    expect(groupZonesByTowerAndFloor([])).toEqual([])
  })

  it('sets towerSlug on each group', () => {
    const result = groupZonesByTowerAndFloor(sampleZones)
    expect(result[0].towerSlug).toBe('knowledge-tower')
    expect(result[1].towerSlug).toBe('science-tower')
    expect(result[2].towerSlug).toBe('support-areas')
  })

  it('handles single zone', () => {
    const result = groupZonesByTowerAndFloor([{ id: 'z1', name: 'Knowledge Tower — 1F', floor: 1 }])
    expect(result).toHaveLength(1)
    expect(result[0].floors[0].zones).toHaveLength(1)
  })
})
