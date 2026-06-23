import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSession } from '@/lib/auth'
import { buildUiConfig } from '@/lib/ui-config/service'
import { UiConfigResponseSchema, type UiConfigResponseT } from '@/lib/ui-config/schema'
import { SUPPORTED_SCHEMA_VERSION } from '@/lib/ui-config/types'

/**
 * GET /api/buildings/[id]/ui-config
 *
 * Returns a versioned, backend-driven UI configuration for the building.
 * Supports conditional requests via ETag / If-None-Match.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: buildingId } = await params

  // 1. Auth gate
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Build UI config
  const config = await buildUiConfig(buildingId)

  // 3. Validate response shape
  const parsed: UiConfigResponseT = UiConfigResponseSchema.parse(config)

  // 4. Compute ETag from JSON body
  const body = JSON.stringify(parsed)
  const etag = crypto.createHash('md5').update(body).digest('hex')

  // 5. Conditional request check
  const ifNoneMatch = _request.headers.get('If-None-Match')
  if (ifNoneMatch === `"${etag}"`) {
    return new NextResponse(null, { status: 304 })
  }

  // 6. Return response
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'ETag': `"${etag}"`,
      'Cache-Control': 'no-cache, must-revalidate',
      'X-SDUI-Version': String(SUPPORTED_SCHEMA_VERSION),
    },
  })
}
