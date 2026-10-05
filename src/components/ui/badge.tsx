import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-mint-50 text-mint-700 dark:bg-mint-500/15 dark:text-mint-300',
        warning:
          'border-transparent bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        danger:
          'border-transparent bg-coral-50 text-coral-700 dark:bg-coral-500/15 dark:text-coral-300',
        info:
          'border-transparent bg-azure-50 text-azure-700 dark:bg-azure-500/15 dark:text-azure-300',
        ai:
          'border-transparent bg-lavender-50 text-lavender-700 dark:bg-lavender-500/15 dark:text-lavender-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
