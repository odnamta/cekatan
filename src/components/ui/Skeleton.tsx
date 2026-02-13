/**
 * Reusable skeleton loading placeholder.
 *
 * Renders a pulsing rectangle with configurable shape.
 * Wrap multiple Skeleton elements in a container with `animate-pulse`
 * for a single coordinated pulse, or each Skeleton pulses independently.
 */

type SkeletonProps = {
  className?: string
  /** Shorthand width (e.g. "w-32") — merged into className */
  w?: string
  /** Shorthand height (e.g. "h-6") — merged into className */
  h?: string
  /** Use rounded-full instead of rounded */
  circle?: boolean
}

export function Skeleton({ className = '', w, h, circle }: SkeletonProps) {
  return (
    <div
      className={`bg-slate-200 dark:bg-slate-700 ${circle ? 'rounded-full' : 'rounded'} animate-pulse ${w ?? ''} ${h ?? ''} ${className}`}
    />
  )
}

/** A group wrapper that coordinates a single pulse animation for its children. */
export function SkeletonGroup({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={`animate-pulse ${className}`}>{children}</div>
}
