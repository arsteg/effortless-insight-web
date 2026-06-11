'use client'

import { type ReactNode, Suspense } from 'react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorBoundary } from './error-boundary'

interface QueryBoundaryProps {
  children: ReactNode
  loadingFallback?: ReactNode
  errorFallback?: ReactNode
}

function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

function QueryErrorFallback({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Failed to load data</CardTitle>
        </div>
        <CardDescription>
          {error.message || 'An error occurred while fetching data.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={reset} variant="outline" className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

export function QueryBoundary({
  children,
  loadingFallback,
  errorFallback,
}: QueryBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onError={() => {}}
          fallback={
            errorFallback || (
              <QueryErrorFallback error={new Error('Something went wrong')} reset={reset} />
            )
          }
        >
          <Suspense fallback={loadingFallback || <DefaultLoadingFallback />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
