'use client'

import { useState } from 'react'
import { useNoticeResponse } from '@/hooks/use-notice-response'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Scale } from 'lucide-react'
import { ResponseEditor } from './response-editor'
import { AllegationList } from './allegation-list'
import { FeatureGate } from '@/components/features/subscription/feature-gate'
import { FeatureCodes } from '@/hooks/use-feature-access'

interface ResponseEditorWrapperProps {
  noticeId: string
}

export function ResponseEditorWrapper({ noticeId }: ResponseEditorWrapperProps) {
  const saved = useNoticeResponse(noticeId)
  const [selection, setSelection] = useState<{ noticeId: string; mode: 'simple' | 'allegation-wise' } | null>(null)
  const mode = selection?.noticeId === noticeId ? selection.mode
    : saved.data?.allegationDraft ? 'allegation-wise' : 'simple'
  const setMode = (next: 'simple' | 'allegation-wise') => setSelection({ noticeId, mode: next })

  if (saved.isLoading) return <p role="status">Loading saved reply...</p>
  if (saved.isError) return <div role="alert">Could not load your saved reply. <Button onClick={() => saved.refetch()}>Retry</Button></div>

  return (
    <div className="space-y-4">
      <FeatureGate feature={FeatureCodes.DraftReply} hideWhenUnavailable>
        <Card className="border-lavender-100 dark:border-lavender-900 bg-gradient-to-r from-lavender-50/50 to-indigo-50/50 dark:from-lavender-900/20 dark:to-indigo-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-lavender-600" />
              Response Drafting Mode
            </CardTitle>
            <CardDescription>
              Choose how you want to draft your response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Simple Draft</span>
                </TabsTrigger>
                <TabsTrigger value="allegation-wise" className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  <span>Allegation-wise</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-2 text-xs text-muted-foreground">
                {mode === 'simple' ? (
                  <p>Generate a single continuous draft response for the entire notice.</p>
                ) : (
                  <p>Extract allegations and generate structured, point-by-point responses with legal basis and evidence.</p>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </FeatureGate>

      <div hidden={mode !== 'simple'}><ResponseEditor key={`simple-${noticeId}`} noticeId={noticeId} /></div>
      <div hidden={mode !== 'allegation-wise'}>
        <AllegationList key={`allegations-${noticeId}`} noticeId={noticeId} onSwitchToSimple={() => setMode('simple')} />
      </div>
    </div>
  )
}
