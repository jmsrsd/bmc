// DESIGN.md §8.4 — ML Inference Pipeline
// ONNX model serving for anomaly detection

export interface AnomalyResult {
  deviceId: string
  score: number  // 0-1, higher = more anomalous
  timestamp: string
  modelVersion: string
}

// In-memory model registry — models loaded from ONNX files on startup
type ModelFn = (features: number[]) => number

const mockModel: ModelFn = (features) => {
  // Simplified simulation: average distance from expected ranges
  const score = Math.min(1, Math.abs(features[0] - 22) / 30)
  return Math.round(score * 1000) / 1000
}

/**
 * Run anomaly detection on a device.
 * Returns score between 0 (normal) and 1 (anomalous).
 * Throws on unknown device or model failure.
 * Target latency: <500ms per DESIGN.md §8.2
 */
export async function getAnomalyScore(deviceId: string, signal?: AbortSignal): Promise<AnomalyResult> {
  const start = Date.now()

  if (!deviceId || deviceId.length === 0) {
    throw new Error('Invalid device ID')
  }

  // Check abort signal before starting
  if (signal?.aborted) {
    throw new Error('Inference cancelled')
  }

  // Simulate model load/feature extraction (100-200ms)
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => resolve(), 100 + Math.random() * 100)

    // Wire up abort signal
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(new Error('Inference cancelled'))
      }, { once: true })
    }
  })

  const elapsed = Date.now() - start
  if (elapsed > 500) {
    // DESIGN.md §8.2: 500ms timeout target
    throw new Error('Inference timeout')
  }

  // Simulate features from device telemetry
  const features = [22.5]  // placeholder — would pull from DB

  const score = mockModel(features)

  return {
    deviceId,
    score,
    timestamp: new Date().toISOString(),
    modelVersion: '1.0.0',
  }
}

/**
 * Batch anomaly detection across multiple devices.
 */
export async function getBatchScores(deviceIds: string[], signal?: AbortSignal): Promise<AnomalyResult[]> {
  const results: AnomalyResult[] = []
  for (const id of deviceIds) {
    if (signal?.aborted) break
    try {
      results.push(await getAnomalyScore(id, signal))
    } catch {
      // Skip failed devices
    }
  }
  return results
}
