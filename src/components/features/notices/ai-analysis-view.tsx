'use client'

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Scale,
  Sparkles,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { RiskBadge } from './risk-badge'
import { cn } from '@/lib/utils'
import type { NoticeAiReport, ProcessingStatus } from '@/types'

interface AIAnalysisViewProps {
  report?: NoticeAiReport
  processingStatus?: ProcessingStatus
  isLoading?: boolean
  onRetry?: () => void
  isRetrying?: boolean
}

export function AIAnalysisView({
  report,
  processingStatus,
  isLoading = false,
  onRetry,
  isRetrying = false,
}: AIAnalysisViewProps) {
  if (isLoading) {
    return <AIAnalysisSkeleton />
  }

  // Processing state
  if (processingStatus && processingStatus !== 'completed' && processingStatus !== 'failed') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analyzing Notice</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {getProcessingMessage(processingStatus)}
          </p>
          <div className="w-full max-w-xs mt-6">
            <Progress value={getProcessingProgress(processingStatus)} className="h-2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Failed state
  if (processingStatus === 'failed' && !report) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            We encountered an error while analyzing this notice. Please try again.
          </p>
          {onRetry && (
            <Button onClick={onRetry} disabled={isRetrying}>
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Analysis
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // No report available
  if (!report) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
          <p className="text-muted-foreground text-center max-w-md">
            AI analysis is not available for this notice yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <RiskBadge score={report.riskScore} level={report.riskLevel} />
            {report.confidenceScores?.risk && (
              <span className="text-sm text-muted-foreground">
                {Math.round(report.confidenceScores.risk * 100)}% confidence
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {(report.summaryEn || report.summaryHi) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.summaryEn && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">English</p>
                <p className="text-sm leading-relaxed">{report.summaryEn}</p>
              </div>
            )}
            {report.summaryHi && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Hindi</p>
                <p className="text-sm leading-relaxed">{report.summaryHi}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plain English Explanation */}
      {report.plainEnglish && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              What This Means
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{report.plainEnglish}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {report.actionItems && report.actionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.actionItems.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-4 rounded-lg border p-4',
                    item.priority === 1 && 'border-l-4 border-l-red-500',
                    item.priority === 2 && 'border-l-4 border-l-yellow-500',
                    item.priority === 3 && 'border-l-4 border-l-green-500'
                  )}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {item.priority}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.dueInDays !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          {item.dueInDays === 0
                            ? 'Today'
                            : `${item.dueInDays} days`}
                        </Badge>
                      )}
                      {item.assigneeSuggestion && (
                        <Badge variant="secondary" className="text-xs">
                          Suggest: {item.assigneeSuggestion}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Documents */}
      {report.requiredDocuments && report.requiredDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.requiredDocuments.map((doc, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    className={cn(
                      'h-4 w-4 mt-0.5 shrink-0',
                      doc.mandatory ? 'text-red-500' : 'text-muted-foreground'
                    )}
                  />
                  <span>
                    {doc.document}
                    {doc.mandatory && (
                      <Badge variant="danger" className="ml-2 text-xs">
                        Required
                      </Badge>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Legal References */}
      {report.legalReferences && report.legalReferences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="h-5 w-5" />
              Legal References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.legalReferences.map((ref, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">{ref.section}</p>
                  <p className="text-muted-foreground">{ref.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Info */}
      {(report.modelUsed || report.processingTimeMs) && (
        <p className="text-xs text-muted-foreground text-center">
          {report.modelUsed && `Analyzed using ${report.modelUsed}`}
          {report.modelUsed && report.processingTimeMs && ' • '}
          {report.processingTimeMs && `Processed in ${(report.processingTimeMs / 1000).toFixed(1)}s`}
        </p>
      )}
    </div>
  )
}

function getProcessingMessage(status: ProcessingStatus): string {
  const messages: Record<ProcessingStatus, string> = {
    queued: 'Your notice is in the queue and will be processed shortly.',
    ocr_processing: 'Extracting text from your document using OCR...',
    extracting: 'Identifying and extracting key information from the notice...',
    classifying: 'Determining the type and category of this notice...',
    analyzing: 'Our AI is analyzing the notice and generating insights...',
    completed: 'Analysis complete!',
    failed: 'Analysis failed.',
  }
  return messages[status] || 'Processing...'
}

function getProcessingProgress(status: ProcessingStatus): number {
  const progress: Record<ProcessingStatus, number> = {
    queued: 10,
    ocr_processing: 30,
    extracting: 50,
    classifying: 70,
    analyzing: 90,
    completed: 100,
    failed: 0,
  }
  return progress[status] || 0
}

function AIAnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-full mt-2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
