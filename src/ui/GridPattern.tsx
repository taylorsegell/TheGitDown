import { useId } from 'react'

export type GridPatternProps = {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: string
  className?: string
}

/**
 * Drafting-grid ground. Stroke color comes from `currentColor` so the page
 * can paint it with `--line`. Decorative only.
 */
export function GridPattern({
  width = 32,
  height = 32,
  x = -1,
  y = -1,
  strokeDasharray = '0',
  className = '',
}: GridPatternProps) {
  const id = useId()

  return (
    <svg
      aria-hidden="true"
      className={className === '' ? 'home-grid' : `home-grid ${className}`}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            stroke="currentColor"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  )
}
