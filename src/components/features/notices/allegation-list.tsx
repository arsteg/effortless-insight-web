'use client'

import { useState, useCallback, useEffect } from 'react'
import { reconcileDraft, printDraft } from '@/lib/allegation-draft'
import { useNoticeResponse } from '@/hooks/use-notice-response'
import { usePermissions } from '@/hooks/use-permissions'
import {
  Loader2,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Scale,
} from 'lucide-react'

import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useToast } from '@/hooks/use-toast'
import { noticesApi } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AllegationCard } from './allegation-card'
import { MissingInfoPanel } from './missing-info-panel'
import { AIDisclaimer } from './ai-disclaimer'
import type {
  AllegationResponse,
  AllegationWiseDraftResponse,
} from '@/types/allegation'
import { formatAmount } from '@/types/allegation'

// The shared API interceptor rejects normalized errors; some early exits retain
// the Axios envelope. Read both without depending on transport-specific nesting.
function getErrorDetails(error: unknown): { code?: string; message?: string; status?: number } {
  if (!error || typeof error !== 'object') return {}
  const value = error as { code?: string; message?: string; response?: { status?: number; data?: { code?: string; message?: string } } }
  return {
    code: value.response?.data?.code ?? value.code,
    message: value.response?.data?.message ?? value.message,
    status: value.response?.status,
  }
}

interface AllegationListProps {
  noticeId: string
  onSwitchToSimple?: () => void
}

export function AllegationList({ noticeId, onSwitchToSimple }: AllegationListProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [localDraft, setDraftResponse] = useState<AllegationWiseDraftResponse | null>(null)
  const [expandedAllegations, setExpandedAllegations] = useState<Set<string> | null>(null)
  const [tone, setTone] = useState<'formal' | 'conciliatory' | 'defensive'>('formal')
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [taxpayerNotes, setTaxpayerNotes] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [regenerating, setRegenerating] = useState<Set<string>>(new Set())
  const handleBusyChange = useCallback((id: string, pending: boolean) => {
    setRegenerating(current => { const next = new Set(current); if (pending) next.add(id); else next.delete(id); return next })
  }, [])

  const { canDraftResponse } = usePermissions()
  const saved = useNoticeResponse(noticeId)
  const draftResponse = localDraft ?? saved.data?.allegationDraft ?? null
  const firstAllegationId = draftResponse?.allegations[0]?.id
  const expandedIds = expandedAllegations ?? new Set(firstAllegationId ? [firstAllegationId] : [])
  const readOnly = !canDraftResponse || (!!saved.data && saved.data.status !== 'draft')
  const saveMutation = useMutation({
    mutationFn: async (draft: AllegationWiseDraftResponse) => {
      const response = await noticesApi.saveDraft(noticeId, draft.combinedDraft || '', draft)
      if (!response.allegationDraft) throw new Error('The server did not return the structured draft. Keep this page open and update the API before retrying.')
      return response
    },
    onSuccess: (response) => {
      queryClient.setQueryData(['notices', noticeId, 'response'], response)
      setDraftResponse(null)
      toast({ title: 'Draft saved', description: 'The structured reply is saved. Use Simple Draft to submit it for review.', variant: 'success' })
    },
    onError: (error) => toast({ title: 'Save failed', description: getErrorDetails(error).message || 'Your edits are still here. Please retry saving.', variant: 'destructive' }),
  })
  useEffect(() => {
    if (!localDraft) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [localDraft])

  const reprocessMutation = useMutation({
    mutationFn: () => noticesApi.retryProcessing(noticeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices', noticeId] })
      toast({ title: 'Reprocessing queued', description: 'Wait for AI Analysis to finish, then generate the allegation-wise reply again.' })
    },
    onError: (error) => toast({ title: 'Reprocessing failed',
      description: getErrorDetails(error).message || 'Please retry.', variant: 'destructive' }),
  })

  const generationOptions = draftResponse?.generationOptions ?? {
    tone, language, includeCaseLaw: true,
    taxpayerContext: taxpayerNotes.trim() ? { notes: taxpayerNotes.trim() } : undefined,
  }
  // Generate allegation-wise draft mutation
  const generateMutation = useMutation({
    mutationFn: async () =>
      reconcileDraft({ ...await noticesApi.generateAllegationWiseDraft(noticeId, generationOptions), generationOptions }),
    onSuccess: (data) => {
      reprocessMutation.reset()
      setDraftResponse(data)
      // Auto-expand first allegation
      if (data.allegations.length > 0) {
        setExpandedAllegations(new Set([data.allegations[0].id]))
      }
      toast({
        title: 'Allegation-wise draft generated',
        description: `Generated responses for ${data.allegations.length} allegation${data.allegations.length !== 1 ? 's' : ''}.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Generation failed',
        description: getErrorDetails(error).message || 'Please retry.',
        variant: 'destructive',
      })
    },
  })

  const handleToggleExpand = useCallback((allegationId: string) => {
    setExpandedAllegations((prev) => {
      const next = new Set(prev ?? (firstAllegationId ? [firstAllegationId] : []))
      if (next.has(allegationId)) {
        next.delete(allegationId)
      } else {
        next.add(allegationId)
      }
      return next
    })
  }, [firstAllegationId])

  const handleExpandAll = useCallback(() => {
    if (draftResponse) {
      setExpandedAllegations(new Set(draftResponse.allegations.map((a) => a.id)))
    }
  }, [draftResponse])

  const handleCollapseAll = useCallback(() => {
    setExpandedAllegations(new Set())
  }, [])

  const handleResponseUpdate = useCallback((allegationId: string, response: AllegationResponse) => {
    setDraftResponse(current => {
      const draft = current ?? saved.data?.allegationDraft
      if (!draft) return null
      return reconcileDraft({ ...draft, responses: draft.responses.map(r => r.allegationId === allegationId ? response : r) })
    })
  }, [saved.data])

  const getResponseForAllegation = (allegationId: string): AllegationResponse | undefined => {
    return draftResponse?.responses.find((r) => r.allegationId === allegationId)
  }

  const totalAmount = draftResponse?.allegations.reduce(
    (sum, a) => sum + (a.amountInvolved || 0),
    0
  )

  const completeCount = draftResponse?.responses.filter((r) => r.status === 'complete').length || 0
  const reviewCount = draftResponse?.responses.filter((r) => r.status === 'needs_review').length || 0
  const missingCount = draftResponse?.responses.filter((r) => r.status === 'missing_info').length || 0

  const busy = generateMutation.isPending || saveMutation.isPending || reprocessMutation.isPending || regenerating.size > 0
  if (saved.isLoading) return <p role="status">Loading saved reply...</p>
  if (saved.isError) return <div role="alert">Could not load your saved reply. <Button onClick={() => saved.refetch()}>Retry</Button></div>

  const generationError = getErrorDetails(generateMutation.error)
  const needsTranscript = generationError?.code === 'NOTICE_TEXT_UNAVAILABLE'
  const quotaPanel = generationError.code === 'USAGE_CAP_EXCEEDED' ? (
    <div role="alert" className="rounded-md border border-amber-300 p-4 space-y-2">
      <p className="font-medium">AI usage limit reached</p>
      <p>{generationError.message}</p>
      <a href="/settings/billing" className="underline">View plan and usage</a>
    </div>
  ) : null
  const recoveryPanel = needsTranscript ? (
    <div role="alert" className="rounded-md border border-amber-300 p-4 space-y-3">
      <p>{generationError?.message}</p>
      {reprocessMutation.isSuccess ? <p>Reprocessing queued. Wait for AI Analysis to finish, then click Generate again.</p> :
        <Button variant="outline" disabled={busy || readOnly} onClick={() => reprocessMutation.mutate()}>
          {reprocessMutation.isPending ? 'Queuing reprocessing...' : 'Reprocess notice'}
        </Button>}
    </div>
  ) : null

  // Initial state - no draft generated yet
  if (!draftResponse) {
    return (
      <Card className="border-lavender-200 dark:border-lavender-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-lavender-600" />
            Allegation-wise Reply Drafting
          </CardTitle>
          <CardDescription>
            Generate structured, point-by-point responses for each allegation in the notice.
            Each response will include legal basis, supporting evidence, and identification of missing information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quotaPanel}
          {recoveryPanel}
          <Collapsible open={showSettings} onOpenChange={setShowSettings}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span>Generation Settings</span>
                {showSettings ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tone</label>
                  <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="conciliatory">Conciliatory</SelectItem>
                      <SelectItem value="defensive">Defensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Language</label>
                  <Select value={language} onValueChange={(v) => setLanguage(v as typeof language)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <label className="block text-sm font-medium" htmlFor={`taxpayer-notes-${noticeId}`}>Taxpayer facts and available evidence (optional)</label>
          <Textarea id={`taxpayer-notes-${noticeId}`} value={taxpayerNotes} maxLength={10000}
            disabled={busy || readOnly} onChange={event => setTaxpayerNotes(event.target.value)}
            placeholder="Describe the facts and list documents you have verified are available. Unconfirmed evidence will be marked missing." />
          <Button
            className="w-full bg-gradient-to-r from-lavender-500 to-indigo-500 hover:from-lavender-600 hover:to-indigo-600 text-white"
            onClick={() => { if (!draftResponse || window.confirm('Replace all current allegation responses with a new AI draft?')) generateMutation.mutate() }}
            disabled={busy || readOnly}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting allegations and generating responses...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Allegation-wise Draft
              </>
            )}
          </Button>

          {onSwitchToSimple && (
            <div className="text-center">
              <Button variant="link" size="sm" onClick={onSwitchToSimple}>
                Or use simple draft mode instead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Draft has been generated
  return (
    <div className="space-y-4">
      {quotaPanel}
      {recoveryPanel}
      <div className="flex items-center gap-3">
        <Button disabled={busy || readOnly || !localDraft || draftResponse.responses.some(r => !r.responseText.trim())}
          onClick={() => saveMutation.mutate(reconcileDraft(draftResponse))}>
          {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
        </Button>
        <span role="status" className="text-sm text-muted-foreground">{readOnly ? 'This reply is read-only.' : localDraft ? 'Unsaved changes' : 'Saved'}</span>
      </div>
      {/* Header with summary */}
      <Card className="border-lavender-200 dark:border-lavender-800">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-lavender-600" />
                Allegation-wise Reply Draft
              </CardTitle>
              <CardDescription className="mt-1">
                {draftResponse.allegations.length} allegation{draftResponse.allegations.length !== 1 ? 's' : ''} identified
                {totalAmount ? ` | Total demand: ${formatAmount(totalAmount)}` : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { if (!draftResponse || window.confirm('Replace all current allegation responses with a new AI draft?')) generateMutation.mutate() }}
                disabled={busy || readOnly}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-1 hidden sm:inline">Regenerate All</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="bg-mint-50 text-mint-700 border-mint-200 dark:bg-mint-900/20 dark:text-mint-400 dark:border-mint-800">
                {completeCount} Complete
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                {reviewCount} Needs Review
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="bg-coral-50 text-coral-700 border-coral-200 dark:bg-coral-900/20 dark:text-coral-400 dark:border-coral-800">
                {missingCount} Missing Info
              </Badge>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="ghost" size="sm" onClick={handleExpandAll}>
              <ChevronDown className="h-4 w-4 mr-1" />
              Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCollapseAll}>
              <ChevronUp className="h-4 w-4 mr-1" />
              Collapse All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Missing info summary */}
      {draftResponse.missingInfoSummary.length > 0 && (
        <MissingInfoPanel items={draftResponse.missingInfoSummary} />
      )}

      {/* Allegation cards */}
      <div className="space-y-4">
        {draftResponse.allegations.map((allegation) => {
          const response = getResponseForAllegation(allegation.id)
          if (!response) return null

          return (
            <AllegationCard
              key={allegation.id}
              noticeId={noticeId}
              allegation={allegation}
              response={response}
              isExpanded={expandedIds.has(allegation.id)}
              onToggleExpand={() => handleToggleExpand(allegation.id)}
              tone={generationOptions.tone}
              language={generationOptions.language}
              taxpayerContext={generationOptions.taxpayerContext}
              onResponseUpdate={handleResponseUpdate}
              onBusyChange={handleBusyChange}
              disabled={busy || readOnly}
            />
          )
        })}
      </div>

      {/* Combined draft section */}
      {draftResponse.combinedDraft && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Combined Response Document</CardTitle>
            <CardDescription>
              Complete response document combining all allegation responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md overflow-auto max-h-[400px]">
                {draftResponse.combinedDraft}
              </pre>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                try { printDraft(reconcileDraft(draftResponse).combinedDraft || '') }
                catch (error) { toast({ title: 'Print failed', description: (error as Error).message, variant: 'destructive' }) }
              }}>
                <Download className="h-4 w-4 mr-1" />
                Print / Save as PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Disclaimer */}
      <AIDisclaimer />

      {/* Processing metadata */}
      {draftResponse.metadata && (
        <div className="text-xs text-muted-foreground text-center">
          Model: {draftResponse.metadata.model} |
          Tokens: {draftResponse.metadata.inputTokens} in / {draftResponse.metadata.outputTokens} out |
          Processing time: {Math.round(draftResponse.metadata.processingTimeMs / 1000)}s |
          Cost: ${draftResponse.metadata.estimatedCost.toFixed(4)}
        </div>
      )}
    </div>
  )
}
