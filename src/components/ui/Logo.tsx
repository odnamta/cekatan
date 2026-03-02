/**
 * Brand Logo — Checkmark icon + "cekatan" wordmark.
 * Based on Brand Identity Guidelines v1.0.
 *
 * SVG source of truth: path d="M6 21L15 30L34 10"
 * Font: Space Grotesk Bold, lowercase, never capitalize.
 */

interface LogoProps {
  /** Show full lockup (icon + wordmark) or icon only */
  variant?: 'full' | 'icon'
  /** Size preset */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

const sizes = {
  sm: { icon: 20, text: 'text-base', gap: 'gap-1.5' },
  md: { icon: 28, text: 'text-xl', gap: 'gap-2' },
  lg: { icon: 40, text: 'text-3xl', gap: 'gap-3' },
}

export function Logo({ variant = 'full', size = 'md', className = '' }: LogoProps) {
  const s = sizes[size]

  const icon = (
    <svg
      width={s.icon}
      height={s.icon}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 21L15 30L34 10"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-600 dark:text-blue-400"
      />
    </svg>
  )

  if (variant === 'icon') {
    return <span className={className}>{icon}</span>
  }

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      {icon}
      <span
        className={`${s.text} font-bold text-slate-900 dark:text-white`}
        style={{ fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif' }}
      >
        cekatan
      </span>
    </span>
  )
}
