import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ResponseEditorWrapper } from './response-editor-wrapper'
import { noticesApi } from '@/lib/api'
import type { NoticeResponse } from '@/types'
import type { AllegationWiseDraftResponse } from '@/types/allegation'

jest.mock('@/lib/api', () => ({ noticesApi: { getLatestResponse: jest.fn(), saveDraft: jest.fn(), generateAllegationWiseDraft: jest.fn(), retryProcessing: jest.fn(), regenerateAllegationResponse: jest.fn() } }))
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }))
jest.mock('@/hooks/use-permissions', () => ({ usePermissions: () => ({ canDraftResponse: true }) }))
jest.mock('./response-editor', () => ({ ResponseEditor: () => <p>Simple editor</p> }))
jest.mock('@/components/features/subscription/feature-gate', () => ({ FeatureGate: ({ children }: { children: React.ReactNode }) => <>{children}</> }))
const api = noticesApi as jest.Mocked<typeof noticesApi>
const draft: AllegationWiseDraftResponse = {
  allegations: [{ id: 'ALG-1', serialNumber: 1, description: 'Unpaid tax', category: 'Tax', evidenceCited: [] }],
  responses: [{ allegationId: 'ALG-1', responseText: 'Generated reply', legalBasis: [], supportingEvidence: [], missingInformation: [], confidence: .5, status: 'needs_review' }],
  missingInfoSummary: [], metadata: { model: 'test', processingTimeMs: 0, inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
}
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return { ...render(<QueryClientProvider client={client}><ResponseEditorWrapper noticeId="notice-1" /></QueryClientProvider>), client }
}
beforeEach(() => jest.resetAllMocks())
test('save, refresh with empty cache, and revisit restores the structured editor and edited reply', async () => {
  let stored: NoticeResponse | null = null
  api.getLatestResponse.mockImplementation(async () => {
    if (!stored) throw { code: 'NOT_FOUND', message: 'No saved response' }
    return stored
  })
  api.generateAllegationWiseDraft.mockResolvedValue(draft)
  api.saveDraft.mockImplementation(async (_id, content, structured) => {
    stored = { id: 'saved', noticeId: 'notice-1', draftContent: content, allegationDraft: structured, status: 'draft', version: 1, createdById: 'user', createdAt: '' }
    return stored
  })
  const first = mount()
  fireEvent.mouseDown(await screen.findByRole('tab', { name: 'Allegation-wise' }), { button: 0, ctrlKey: false })
  fireEvent.click(screen.getByRole('button', { name: 'Generate Allegation-wise Draft' }))
  fireEvent.change(await screen.findByRole('textbox', { name: 'Response to allegation 1' }), { target: { value: 'Saved edited reply' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }))
  await screen.findByText('Saved')
  first.unmount()
  first.client.clear()
  const second = mount()
  await waitFor(() => expect(screen.getByRole('tab', { name: 'Allegation-wise' })).toHaveAttribute('aria-selected', 'true'))
  expect(screen.getByRole('textbox', { name: 'Response to allegation 1' })).toHaveValue('Saved edited reply')
  expect(api.generateAllegationWiseDraft).toHaveBeenCalledTimes(1)
  // Explicit tab choices are respected even if the query refreshes.
  fireEvent.mouseDown(screen.getByRole('tab', { name: 'Simple Draft' }), { button: 0, ctrlKey: false })
  await second.client.invalidateQueries({ queryKey: ['notices', 'notice-1', 'response'] })
  expect(screen.getByRole('tab', { name: 'Simple Draft' })).toHaveAttribute('aria-selected', 'true')
  second.unmount()
  second.client.clear()
  mount()
  await waitFor(() => expect(screen.getByRole('tab', { name: 'Allegation-wise' })).toHaveAttribute('aria-selected', 'true'))
})
test('a saved simple draft still opens in Simple Draft mode', async () => {
  api.getLatestResponse.mockResolvedValue({ id: 'saved', noticeId: 'notice-1', draftContent: 'Simple text', status: 'draft', version: 1, createdById: 'user', createdAt: '' })
  mount()
  expect(await screen.findByRole('tab', { name: 'Simple Draft' })).toHaveAttribute('aria-selected', 'true')
})
test('loading errors are shown rather than treated as an absent draft', async () => {
  api.getLatestResponse.mockRejectedValue({ code: 'INTERNAL_ERROR', message: 'Database unavailable' })
  mount()
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load your saved reply')
  expect(screen.queryByRole('button', { name: 'Generate Allegation-wise Draft' })).not.toBeInTheDocument()
})
