'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  benefits?: string[]
  className?: string
  iconClassName?: string
  variant?: 'default' | 'gradient' | 'outlined'
  isNew?: boolean
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  benefits,
  className,
  iconClassName,
  variant = 'default',
  isNew = false,
}: FeatureCardProps) {
  const variants = {
    default: 'bg-white border border-gray-100 shadow-sm hover:shadow-xl',
    gradient:
      'bg-gradient-to-br from-white to-primary-50/30 border border-primary-100 shadow-sm hover:shadow-xl',
    outlined: 'bg-white/50 backdrop-blur-sm border-2 border-primary-200 hover:border-primary-400',
  }

  return (
    <div
      className={cn(
        'group relative p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1',
        variants[variant],
        isNew && 'ring-2 ring-green-400 ring-offset-2',
        className
      )}
    >
      {/* New Badge */}
      {isNew && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
          NEW
        </div>
      )}

      <div
        className={cn(
          'w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110',
          isNew
            ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-200'
            : 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-200',
          iconClassName
        )}
      >
        <Icon className="h-7 w-7 text-white" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed mb-4">{description}</p>

      {benefits && benefits.length > 0 && (
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              {benefit}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
