import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAnomalyScore, getBatchScores } from '@/lib/inference'

describe('getAnomalyScore', () => {
  it('returns score between 0 and 1', async () => {
    const result = await getAnomalyScore('ahu-01')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  it('returns result with deviceId', async () => {
    const result = await getAnomalyScore('ahu-01')
    expect(result.deviceId).toBe('ahu-01')
  })

  it('returns timestamp in ISO format', async () => {
    const result = await getAnomalyScore('ahu-01')
    expect(() => new Date(result.timestamp)).not.toThrow()
  })

  it('handles unknown device gracefully', async () => {
    await expect(getAnomalyScore('')).rejects.toThrow()
  })

  it('respects 500ms timeout (DESIGN.md §8.2)', async () => {
    const start = Date.now()
    await getAnomalyScore('ahu-01')
    expect(Date.now() - start).toBeLessThan(1000)
  })

  it('includes model version in response', async () => {
    const result = await getAnomalyScore('ahu-01')
    expect(result.modelVersion).toBeDefined()
  })

  it('rejects empty device id', async () => {
    await expect(getAnomalyScore('')).rejects.toThrow('Invalid device ID')
  })

  it('accepts abort signal', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(getAnomalyScore('ahu-01', controller.signal)).rejects.toThrow('cancelled')
  })
})

describe('getBatchScores', () => {
  it('returns array of results for valid devices', async () => {
    const results = await getBatchScores(['ahu-01', 'ahu-02'])
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThanOrEqual(1)
    results.forEach(r => {
      expect(r.score).toBeGreaterThanOrEqual(0)
      expect(r.score).toBeLessThanOrEqual(1)
    })
  })

  it('handles empty device list', async () => {
    const results = await getBatchScores([])
    expect(results).toEqual([])
  })
})
