import { useId } from 'react'

/**
 * The pen-tool logo: a nib inside an arc, with the two-dot drafting line.
 * The slit and the hole are cut out with a mask, so it stays transparent on
 * any background.
 */
export default function Logo({ size = 24, className = '' }) {
  const maskId = `nib-cut-${useId().replace(/:/g, '')}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 640 640"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId}>
          <rect width="640" height="640" fill="white" />
          <path d="M 283 222 L 293 217 L 345 351 L 336 353 Z" fill="black" />
          <circle cx="340" cy="368" r="18" fill="black" />
        </mask>
      </defs>

      <g fill="currentColor" stroke="currentColor">
        {/* the drafting line with its two dots */}
        <line x1="100" y1="235" x2="435" y2="100" strokeWidth="13" strokeLinecap="round" />
        <circle cx="100" cy="235" r="21" stroke="none" />
        <circle cx="435" cy="100" r="21" stroke="none" />

        {/* the arc */}
        <path
          d="M 185 495 A 205 205 0 1 1 523 280"
          fill="none"
          strokeWidth="30"
          strokeLinecap="butt"
        />

        {/* the blocks on the arc */}
        <rect
          x="224"
          y="140"
          width="60"
          height="44"
          transform="rotate(-32 254 162)"
          stroke="none"
        />
        <rect
          x="528"
          y="272"
          width="58"
          height="54"
          transform="rotate(28 557 299)"
          stroke="none"
        />
        <rect
          x="116"
          y="442"
          width="58"
          height="54"
          transform="rotate(32 145 469)"
          stroke="none"
        />

        {/* the nib */}
        <g mask={`url(#${maskId})`}>
          <path d="M 272 212 L 415 330 L 415 455 L 345 492 L 268 428 Z" stroke="none" />
          <rect
            x="330"
            y="450"
            width="112"
            height="30"
            transform="rotate(-20 386 465)"
            stroke="none"
          />
        </g>
      </g>
    </svg>
  )
}
