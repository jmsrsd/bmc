import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/api/building',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=60' }],
      },
      {
        source: '/api/buildings/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=60' }],
      },
      {
        source: '/api/stream/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ]
  },
}

export default nextConfig
