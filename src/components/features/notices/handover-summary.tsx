'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Users,
  Calendar,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { noticesApi } from '@/lib/api/notices'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type { HandoverSummary } from '@/types'

interface HandoverSummaryProps {
  noticeId: string
  /** If a summary was previously generated, it can be passed here */
  existingSummary?: HandoverSummary
}

export function HandoverSummarySection({
  noticeId,
  existingSummary,
}: HandoverSummaryProps) {
  const { toast } = useToast()
  const [summary, setSummary] = useState<HandoverSummary | undefined>(existingSummary)
  const [additionalContext, setAdditionalContext] = useState('')
  const [showContextInput, setShowContextInput] = useState(false)

  const generateMutation = useMutation({
    mutationFn: () =>
      noticesApi.generateHandoverSummary(noticeId, {
        additionalContext: additionalContext || undefined,
      }),
    onSuccess: (data) => {
      setSummary(data)
      setShowContextInput(false)
      setAdditionalContext('')
      toast({
        title: 'Handover summary generated',
        description: 'The case transfer summary is ready.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to generate summary',
        description: error.message || 'An error occurred while generating the handover summary.',
        variant: 'destructive',
      })
    },
  })

  const handleGenerate = () => {
    generateMutation.mutate()
  }

  // If no summary yet, show generate button
  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-azure-500" />
            Handover Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate an AI-powered handover summary to transfer this case to another team member.
            The summary includes case background, work completed, pending items, and recommended next steps.
          </p>

          {showContextInput && (
            <div className="space-y-2">
              <Label htmlFor="additional-context">Additional Context (Optional)</Label>
              <Textarea
                id="additional-context"
                placeholder="Add any additional context or specific information you want included in the handover summary..."
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2">
            {!showContextInput ? (
              <>
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Summary
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowContextInput(true)}
                >
                  Add Context
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate with Context'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowContextInput(false)}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show the generated summary
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-azure-500" />
          Handover Summary
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Generated {formatDate(summary.generatedAt)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Background */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-azure-500" />
            Case Background
          </h4>
          <p className="text-sm text-muted-foreground">{summary.background}</p>
        </div>

        {/* Work Completed */}
        {summary.workCompleted.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-mint-500" />
              Work Completed
            </h4>
            <ul className="space-y-1">
              {summary.workCompleted.map((item, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 mt-1 shrink-0 text-mint-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pending Items */}
        {summary.pendingItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Items
            </h4>
            <ul className="space-y-1">
              {summary.pendingItems.map((item, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <Clock className="h-3 w-3 mt-1 shrink-0 text-amber-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        {summary.nextSteps.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-azure-500" />
              Recommended Next Steps
            </h4>
            <ol className="space-y-1 list-decimal list-inside">
              {summary.nextSteps.map((step, index) => (
                <li key={index} className="text-sm">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Key Deadlines */}
        {summary.keyDeadlines.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-coral-500" />
              Key Deadlines
            </h4>
            <div className="space-y-2">
              {summary.keyDeadlines.map((deadline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm bg-muted/50 rounded-md px-3 py-2"
                >
                  <span>{deadline.description}</span>
                  <Badge variant="secondary">{deadline.date}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Contacts */}
        {summary.keyContacts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-azure-500" />
              Key Contacts
            </h4>
            <div className="flex flex-wrap gap-2">
              {summary.keyContacts.map((contact, index) => (
                <Badge key={index} variant="secondary">
                  {contact}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Risk Summary */}
        {summary.riskSummary && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-coral-500" />
              Risk Summary
            </h4>
            <p className="text-sm text-muted-foreground">{summary.riskSummary}</p>
          </div>
        )}

        {/* Processing time footer */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          Generated in {summary.processingTimeMs}ms
        </div>
      </CardContent>
    </Card>
  )
}
