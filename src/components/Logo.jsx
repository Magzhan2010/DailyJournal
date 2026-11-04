import { useId } from 'react'

/**
 * The mark — a mashup of the logos of the tools this journal lives with:
 *
 *   Apple   → the rounded tile and the leaf
 *   Meta    → the infinity ribbon
 *   NVIDIA  → the eye in the middle
 *   Claude  → the spark in the pupil
 *   Google  → the four-colour gradient on the ribbon
 *   Codex   → the chevron in the corner
 *
 * variant="full"   everything (footer, big sizes)
 * variant="mark"   tile + ribbon + eye
 * variant="simple" tile + ribbon (small sizes, under 24px)
 */
export default function Logo({ size = 24, variant = 'full', className = '' }) {
  const uid = useId().replace(/:/g, '')
  const ribbonId = `ribbon-${uid}`
  const tileId = `tile-${uid}`
  const cutId = `cut-${uid}`

  const detail = variant === 'full'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={ribbonId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="34%" stopColor="#EA4335" />
          <stop offset="66%" stopColor="#FBBC05" />
          <stop offset="100%" stopColor="#34A853" />
        </linearGradient>

        <linearGradient id={tileId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eaf1ff" />
        </linearGradient>

        <mask id={cutId}>
          <rect width="512" height="512" fill="white" />
          <circle cx="256" cy="256" r="58" fill="black" />
        </mask>
      </defs>

      {/* the tile (Apple) */}
      <rect
        x="6"
        y="6"
        width="500"
        height="500"
        rx="118"
        fill={`url(#${tileId})`}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="8"
      />

      {/* the ribbon (Meta) with the Google gradient */}
      <g mask={variant === 'simple' ? undefined : `url(#${cutId})`}>
        <path
          d="M 92 256 C 92 166, 224 166, 256 256 C 288 346, 420 346, 420 256 C 420 166, 288 166, 256 256 C 224 346, 92 346, 92 256 Z"
          fill="none"
          stroke={`url(#${ribbonId})`}
          strokeWidth="30"
          strokeLinecap="round"
        />
      </g>

      {/* the eye (NVIDIA) with the spark (Claude) in the pupil */}
      {variant !== 'simple' && (
        <g>
          <path
            d="M 294 234 A 42 42 0 1 0 294 278"
            fill="none"
            stroke="#76B900"
            strokeWidth="19"
            strokeLinecap="round"
          />
          <circle cx="256" cy="256" r="17" fill="#76B900" />
          <path
            d="M 256 245 L 261 251 L 267 256 L 261 261 L 256 267 L 251 261 L 245 256 L 251 251 Z"
            fill="#ffffff"
          />
        </g>
      )}

      {detail && (
        <>
          {/* the chevron (Codex) */}
          <path
            d="M 338 372 L 384 404 L 338 436"
            fill="none"
            stroke="#1d1d1f"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* the apple (Apple) */}
          <g transform="translate(336 58) rotate(14 41 41) scale(3.4)">
            <path
              d="M12 21c-1.5 0-2.2-.8-3.4-.8-1.2 0-2 .8-3.4.8C2.6 21 0 17.2 0 12.4 0 8.6 1.8 6 4.2 6c1.3 0 2.3.8 3.3.8.9 0 1.9-.9 3.5-.9 1.5 0 2.8.8 3.6 1.7-3.2 1.8-2.7 6.3.5 7.6-.6 1.4-1.3 2.8-2.4 3.8-.9.8-1.8 1.4-3.1 1.4z"
              fill="#1d1d1f"
            />
            <path
              d="M9 5.5c0-1.7 1.4-3.1 3.1-3.1.2 1.7-1.4 3.2-3.1 3.1z"
              fill="#1d1d1f"
            />
          </g>
        </>
      )}
    </svg>
  )
}
