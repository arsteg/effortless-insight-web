'use client'

import { cn } from '@/lib/utils'
import { AnimatedCounter } from './animated-counter'

interface StatCardProps {
  value: number
  suffix?: string
  prefix?: string
  label: string
  description?: string
  className?: string
  decimals?: number
}

export function StatCard({
  value,
  suffix = '',
  prefix = '',
  label,
  description,
  className,
  decimals = 0,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative group p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
          <AnimatedCounter
            end={value}
            suffix={suffix}
            prefix={prefix}
            decimals={decimals}
          />
        </div>
        <div className="text-lg font-semibold text-gray-900">{label}</div>
        {description && (
          <div className="text-sm text-gray-500 mt-1">{description}</div>
        )}
      </div>
    </div>
  )
}
