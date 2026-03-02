import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Cekatan — Platform Asesmen & Pemetaan Kompetensi'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #172554 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Checkmark icon */}
        <svg width="120" height="120" viewBox="0 0 40 40" fill="none">
          <path
            d="M6 21L15 30L34 10"
            stroke="#4D94FF"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Wordmark */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: 'white',
            marginTop: 24,
            letterSpacing: '-0.02em',
          }}
        >
          cekatan
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            marginTop: 16,
          }}
        >
          Platform Asesmen &amp; Pemetaan Kompetensi
        </div>
      </div>
    ),
    { ...size },
  )
}
