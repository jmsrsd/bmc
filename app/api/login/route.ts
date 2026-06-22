import { NextResponse } from 'next/server'
import { verifyPassword, createSessionCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      )
    }

    const valid = await verifyPassword(password)

    if (!valid) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      )
    }

    const cookie = createSessionCookie()
    const response = NextResponse.json({ success: true })
    response.cookies.set(cookie.name, cookie.value, {
      maxAge: cookie.maxAge,
      path: cookie.path,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
    })

    return response
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
