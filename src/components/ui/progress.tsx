'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percent = (Math.min(Math.max(value, 0), max) / max) * 100

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
          className
        )}
        {...props}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }
