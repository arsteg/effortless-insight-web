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
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  benefits,
  className,
  iconClassName,
  variant = 'default',
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
        className
      )}
    >
      <div
        className={cn(
          'w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110',
          'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-200',
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
