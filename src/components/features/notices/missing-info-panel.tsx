'use client'

import { AlertTriangle, ChevronDown, ChevronUp, FileQuestion } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface MissingInfoPanelProps {
  items: string[]
  className?: string
}

export function MissingInfoPanel({ items, className }: MissingInfoPanelProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (items.length === 0) {
    return null
  }

  return (
    <Card className={`border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Missing Information Summary
                <Badge variant="outline" className="ml-2 text-amber-600 border-amber-300 dark:border-amber-700">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-amber-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-amber-600" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">
              The following documents or information are needed to finalize the responses. Please gather these before submitting.
            </p>
            <ul className="space-y-2">
              {items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm bg-white dark:bg-gray-800 p-2 rounded-md border border-amber-200 dark:border-amber-800"
                >
                  <FileQuestion className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-amber-800 dark:text-amber-200">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
