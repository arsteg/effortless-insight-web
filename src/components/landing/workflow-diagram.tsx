'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface WorkflowStep {
  icon: LucideIcon
  title: string
  description: string
  duration?: string
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[]
  className?: string
  variant?: 'horizontal' | 'vertical'
}

export function WorkflowDiagram({
  steps,
  className,
  variant = 'horizontal',
}: WorkflowDiagramProps) {
  if (variant === 'vertical') {
    return (
      <div className={cn('relative', className)}>
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-400 to-primary-200" />

        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative flex gap-6 group">
                {/* Step number */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      Step {index + 1}
                    </span>
                    {step.duration && (
                      <span className="text-xs text-gray-500">{step.duration}</span>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h4>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Horizontal line for desktop */}
      <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={index} className="relative text-center group">
              {/* Step number circle */}
              <div className="relative z-10 mx-auto mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform mx-auto">
                  <Icon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-primary-100">
                  <span className="text-sm font-bold text-primary-600">
                    {index + 1}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="mt-6">
                {step.duration && (
                  <span className="inline-block text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded mb-2">
                    {step.duration}
                  </span>
                )}
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>

              {/* Arrow for mobile/tablet */}
              {index < steps.length - 1 && (
                <div className="lg:hidden flex justify-center my-4">
                  <svg
                    className="w-6 h-6 text-primary-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
