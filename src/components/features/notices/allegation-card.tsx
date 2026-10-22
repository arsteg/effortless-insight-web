'use client'

import { useState, useEffect } from 'react'
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Scale,
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Paperclip,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { noticesApi } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import type { Allegation, AllegationResponse } from '@/types/allegation'
import { formatAmount, getStatusLabel } from '@/types/allegation'

interface AllegationCardProps {
  noticeId: string
  allegation: Allegation
  response: AllegationResponse
  isExpanded: boolean
  onToggleExpand: () => void
  tone?: 'formal' | 'conciliatory' | 'defensive'
  language?: 'en' | 'hi'
  taxpayerContext?: Record<string, unknown>
  disabled?: boolean
  onBusyChange?: (id: string, busy: boolean) => void
  onResponseUpdate: (allegationId: string, response: AllegationResponse) => void
}

export function AllegationCard({
  noticeId,
  allegation,
  response,
  isExpanded,
  onToggleExpand,
  tone = 'formal',
  language = 'en',
  onResponseUpdate,
  taxpayerContext,
  disabled = false,
  onBusyChange,
}: AllegationCardProps) {
  const { toast } = useToast()
  const [customInstructions, setCustomInstructions] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)

  const statusClass = { complete: 'bg-mint-50 text-mint-700 border-mint-200', needs_review: 'bg-amber-50 text-amber-700 border-amber-200', missing_info: 'bg-coral-50 text-coral-700 border-coral-200' }[response.status]
  const statusLabel = getStatusLabel(response.status)

  // Regenerate mutation
  const regenerateMutation = useMutation({
    mutationFn: () =>
      noticesApi.regenerateAllegationResponse(noticeId, {
        allegation,
        taxpayerContext,
        tone,
        language,
        customInstructions: customInstructions || undefined,
      }),
    onSuccess: (data) => {
      onResponseUpdate(allegation.id, data)
      setCustomInstructions('')
      setShowInstructions(false)
      toast({
        title: 'Response regenerated',
        description: `Response for allegation ${allegation.serialNumber} has been regenerated.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Regeneration failed',
        description: (error as { message?: string }).message || 'Failed to regenerate response. Please try again.',
        variant: 'destructive',
      })
    },
  })

  useEffect(() => {
    onBusyChange?.(allegation.id, regenerateMutation.isPending)
    return () => onBusyChange?.(allegation.id, false)
  }, [allegation.id, regenerateMutation.isPending, onBusyChange])

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {allegation.id}
                  </Badge>
                  {allegation.legalProvision && (
                    <Badge variant="secondary" className="text-xs">
                      <Scale className="h-3 w-3 mr-1" />
                      {allegation.legalProvision}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-xs ${statusClass}`}
                  >
                    {response.status === 'complete' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {response.status === 'needs_review' && <HelpCircle className="h-3 w-3 mr-1" />}
                    {response.status === 'missing_info' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {statusLabel}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{allegation.category}</span>
                  {allegation.amountInvolved != null && (
                    <span className="font-semibold text-coral-600 dark:text-coral-400">
                      {formatAmount(allegation.amountInvolved)}
                    </span>
                  )}
                  {allegation.period && (
                    <span>{allegation.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm line-clamp-2 text-muted-foreground">
                  {allegation.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(response.confidence * 100)}%
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>AI confidence score</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <Separator />

            {/* Full allegation text */}
            <div>
              <h4 className="text-sm font-medium mb-2">Allegation</h4>
              <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                {allegation.description}
              </p>
              {allegation.evidenceCited.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-muted-foreground">Evidence cited: </span>
                  {allegation.evidenceCited.map((evidence, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs ml-1">
                      <Paperclip className="h-3 w-3 mr-1" />
                      {evidence}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Response text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Your Response</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInstructions(!showInstructions)}
                  disabled={disabled || regenerateMutation.isPending}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
              </div>

              {showInstructions && (
                <div className="mb-3 p-3 bg-lavender-50 dark:bg-lavender-900/20 rounded-md space-y-2">
                  <Label htmlFor={`instructions-${allegation.id}`} className="text-xs">
                    Custom instructions for regeneration (optional)
                  </Label>
                  <Input
                    id={`instructions-${allegation.id}`}
                    maxLength={1000}
                    placeholder="e.g., Focus on procedural compliance, mention supplier's compliance status..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => regenerateMutation.mutate()}
                      disabled={disabled || regenerateMutation.isPending}
                    >
                      {regenerateMutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowInstructions(false)
                        setCustomInstructions('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <Textarea
                value={response.responseText}
                aria-label={`Response to allegation ${allegation.serialNumber}`}
                disabled={disabled || regenerateMutation.isPending}
                onChange={(e) => onResponseUpdate(allegation.id, { ...response, responseText: e.target.value, status: response.missingInformation.length ? 'missing_info' : 'needs_review' })}
                className="min-h-[150px] text-sm"
                placeholder="Response text..."
              />
            </div>

            {/* Legal basis */}
            {response.legalBasis.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Scale className="h-4 w-4" />
                  Legal Basis
                </h4>
                <div className="flex flex-wrap gap-2">
                  {response.legalBasis.map((basis, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {basis}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Supporting evidence */}
            {response.supportingEvidence.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Supporting Evidence
                </h4>
                <div className="space-y-2">
                  {response.supportingEvidence.map((doc, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 p-2 rounded-md text-sm ${
                        doc.available
                          ? 'bg-mint-50 dark:bg-mint-900/20'
                          : 'bg-amber-50 dark:bg-amber-900/20'
                      }`}
                    >
                      <Paperclip className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{doc.documentName}</div>
                        <div className="text-xs text-muted-foreground">{doc.relevance}</div>
                      </div>
                      {!doc.available && (
                        <Badge variant="outline" className="text-xs text-amber-600">
                          Not available
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Case law references */}
            {response.caseLawReferences && response.caseLawReferences.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Case Law References
                </h4>
                <div className="space-y-2">
                  {response.caseLawReferences.map((caseLaw, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-azure-50 dark:bg-azure-900/20 rounded-md text-sm"
                    >
                      <div className="font-medium">{caseLaw.citation}</div>
                      <div className="text-xs text-muted-foreground">{caseLaw.court}</div>
                      <div className="mt-1 text-xs">{caseLaw.principle}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing information */}
            {response.missingInformation.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  Missing Information
                </h4>
                <ul className="space-y-1">
                  {response.missingInformation.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md"
                    >
                      <span className="text-amber-500">*</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
