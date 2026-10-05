'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Loader2, ShieldQuestion, X } from 'lucide-react'
import { isAxiosError } from 'axios'

import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAssistantStore } from '@/stores/assistant-store'
import type {
  AssistantAction,
  AssistantConfirmAction,
  AssistantNavigateAction,
} from '@/types/assistant'

const CONFIRM_LABELS: Record<string, string> = {
  auto_draft: 'Generate AI draft',
  create_task: 'Create task',
  add_reminder: 'Add reminder',
  update_status: 'Update status',
}

export function AssistantActions({ actions }: { actions: AssistantAction[] }) {
  if (!actions.length) return null
  return (
    <div className="mt-2 flex flex-col gap-2" data-testid="assistant-actions">
      {actions.map((action, index) =>
        action.type === 'navigate' ? (
          <NavigateChip key={`${action.intent}-${index}`} action={action} />
        ) : (
          <ConfirmActionCard key={`${action.kind}-${index}`} action={action} />
        )
      )}
    </div>
  )
}

function NavigateChip({ action }: { action: AssistantNavigateAction }) {
  const router = useRouter()
  const close = useAssistantStore((state) => state.close)

  if (!action.webRoute) return null
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-fit gap-1.5"
      onClick={() => {
        router.push(action.webRoute!)
        close()
      }}
    >
      {action.label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Button>
  )
}

type ConfirmState = 'idle' | 'running' | 'done' | 'dismissed' | 'failed'

/**
 * A write proposed by the assistant. NOTHING happens until the user clicks
 * Confirm — then the browser itself calls the normal API endpoint with the
 * user's own session, exactly as if they had used the regular UI.
 */
function ConfirmActionCard({ action }: { action: AssistantConfirmAction }) {
  const [state, setState] = useState<ConfirmState>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const execute = async () => {
    setState('running')
    try {
      // action.path is "/api/v1/..." from the whitelist; apiClient baseURL
      // already ends with /api/v1, so strip the prefix.
      const path = action.path.replace(/^\/api\/v1/, '')
      if (action.method === 'PUT') {
        await apiClient.put(path, action.body)
      } else {
        await apiClient.post(path, action.body)
      }
      setState('done')
    } catch (error) {
      setState('failed')
      if (isAxiosError(error) && error.response?.status === 402) {
        setMessage('This feature is not available on your current plan. See Settings → Billing.')
      } else if (isAxiosError(error) && error.response?.status === 403) {
        setMessage('Your role does not allow this action.')
      } else {
        setMessage('The action failed. Please try it from the regular screen.')
      }
    }
  }

  if (state === 'dismissed') return null

  return (
    <Card className="border-lavender-200 bg-lavender-50/50 p-3 dark:border-lavender-900 dark:bg-lavender-950/30">
      <div className="flex items-start gap-2">
        <ShieldQuestion className="mt-0.5 h-4 w-4 shrink-0 text-lavender-600" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {CONFIRM_LABELS[action.kind] ?? action.kind} — needs your confirmation
          </p>
          <p className="mt-0.5 text-sm">{action.summary}</p>

          {state === 'done' && (
            <p className="mt-1.5 flex items-center gap-1 text-sm text-mint-700 dark:text-mint-400">
              <Check className="h-3.5 w-3.5" /> Done
            </p>
          )}
          {state === 'failed' && message && (
            <p className="mt-1.5 text-sm text-coral-600 dark:text-coral-400">{message}</p>
          )}

          {(state === 'idle' || state === 'running') && (
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={execute} disabled={state === 'running'}>
                {state === 'running' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  'Confirm'
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setState('dismissed')}
                disabled={state === 'running'}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Not now
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
