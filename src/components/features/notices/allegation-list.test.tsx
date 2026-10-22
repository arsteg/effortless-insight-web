import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AllegationList } from './allegation-list'
import { noticesApi } from '@/lib/api'
import type { AllegationWiseDraftResponse } from '@/types/allegation'

jest.mock('@/lib/api', () => ({ noticesApi: { retryProcessing: jest.fn(), getLatestResponse: jest.fn(), saveDraft: jest.fn(), generateAllegationWiseDraft: jest.fn(), regenerateAllegationResponse: jest.fn() } }))
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }))
jest.mock('@/hooks/use-permissions', () => ({ usePermissions: () => ({ canDraftResponse: true }) }))
const api = noticesApi as jest.Mocked<typeof noticesApi>
const draft: AllegationWiseDraftResponse = {
  allegations: [{ id: 'ALG-1', serialNumber: 1, description: 'Unpaid tax', category: 'Tax', evidenceCited: [] }],
  responses: [{ allegationId: 'ALG-1', responseText: 'Original reply', legalBasis: ['Section 73'], supportingEvidence: [], missingInformation: ['Challan'], confidence: .5, status: 'missing_info' }],
  combinedDraft: 'Original combined', missingInfoSummary: ['Challan'],
  metadata: { model: 'test', processingTimeMs: 0, inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
}
const saved = { id: 'response-1', noticeId: 'notice-1', status: 'draft' as const, version: 1, createdById: 'user', createdAt: '', allegationDraft: draft }
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(<QueryClientProvider client={client}><AllegationList noticeId="notice-1" /></QueryClientProvider>)
}
beforeEach(() => { jest.clearAllMocks(); api.getLatestResponse.mockResolvedValue(saved) })
test('restores structured draft and saves edits with updated combined reply', async () => {
  api.saveDraft.mockImplementation(async (_id, content, structured) => ({ ...saved, draftContent: content, allegationDraft: structured }))
  mount()
  fireEvent.click(await screen.findByRole('button', { name: 'Expand All' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Response to allegation 1' }), { target: { value: 'Edited reply' } })
  expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
  expect(screen.getByText(/ALLEGATION 1: Unpaid tax/)).toHaveTextContent('Edited reply')
  fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }))
  await waitFor(() => expect(api.saveDraft).toHaveBeenCalledWith('notice-1', expect.stringContaining('Edited reply'), expect.objectContaining({ responses: [expect.objectContaining({ responseText: 'Edited reply' })] })))
  await screen.findByText('Saved')
})
test('failed save preserves edits', async () => {
  api.saveDraft.mockRejectedValue(new Error('offline'))
  mount()
  fireEvent.click(await screen.findByRole('button', { name: 'Expand All' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Response to allegation 1' }), { target: { value: 'Keep this edit' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save Draft' })).toBeEnabled())
  expect(screen.getByRole('textbox', { name: 'Response to allegation 1' })).toHaveValue('Keep this edit')
  expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
})
test('failed regeneration preserves original reply', async () => {
  api.regenerateAllegationResponse.mockRejectedValue(new Error('AI unavailable'))
  mount()
  fireEvent.click(await screen.findByRole('button', { name: 'Expand All' }))
  fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
  fireEvent.click(screen.getAllByRole('button', { name: 'Regenerate' })[1])
  await waitFor(() => expect(api.regenerateAllegationResponse).toHaveBeenCalled())
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Response to allegation 1' })).toBeEnabled())
  expect(screen.getByRole('textbox', { name: 'Response to allegation 1' })).toHaveValue('Original reply')
})

test('regenerate all refreshes existing text boxes as well as the preview', async () => {
  jest.spyOn(window, 'confirm').mockReturnValue(true)
  api.generateAllegationWiseDraft.mockResolvedValue({ ...draft, responses: [{ ...draft.responses[0], responseText: 'New AI reply', missingInformation: [] }] })
  mount()
  fireEvent.click(await screen.findByRole('button', { name: 'Expand All' }))
  fireEvent.click(screen.getByRole('button', { name: 'Regenerate All' }))
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Response to allegation 1' })).toHaveValue('New AI reply'))
  expect(screen.getByText(/ALLEGATION 1: Unpaid tax/)).toHaveTextContent('New AI reply')
  jest.restoreAllMocks()
})

test('missing OCR offers reprocessing and preserves the current reply', async () => {
  jest.spyOn(window, 'confirm').mockReturnValue(true)
  api.generateAllegationWiseDraft.mockRejectedValue({ success: false, code: 'NOTICE_TEXT_UNAVAILABLE', message: 'Reprocess this notice.' })
  api.retryProcessing.mockResolvedValue({ noticeId: 'notice-1', jobId: 'job-1', status: 'queued' })
  mount()
  fireEvent.click(await screen.findByRole('button', { name: 'Regenerate All' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Reprocess notice' }))
  await waitFor(() => expect(api.retryProcessing).toHaveBeenCalledWith('notice-1'))
  await screen.findByText(/Reprocessing queued. Wait for AI Analysis/)
  fireEvent.click(screen.getByRole('button', { name: 'Expand All' }))
  expect(screen.getByRole('textbox', { name: 'Response to allegation 1' })).toHaveValue('Original reply')
  jest.restoreAllMocks()
})

test.each([
  { success: false, code: 'NOTICE_TEXT_UNAVAILABLE', message: 'Full notice text is unavailable.' },
  { response: { status: 409, data: { code: 'NOTICE_TEXT_UNAVAILABLE', message: 'Full notice text is unavailable.' } } },
])('first draft shows reprocess action for missing transcript: %j', async (error) => {
  api.getLatestResponse.mockRejectedValue({ success: false, code: 'NOT_FOUND', message: 'No response found' })
  api.generateAllegationWiseDraft.mockRejectedValue(error)
  api.retryProcessing.mockResolvedValue({ noticeId: 'notice-1', jobId: 'job-1', status: 'queued' })
  mount()
  fireEvent.click(await screen.findByRole('button', { name: 'Generate Allegation-wise Draft' }))
  const reprocess = await screen.findByRole('button', { name: 'Reprocess notice' })
  expect(screen.getByRole('alert')).toHaveTextContent('Full notice text is unavailable.')
  fireEvent.click(reprocess)
  await waitFor(() => expect(api.retryProcessing).toHaveBeenCalledWith('notice-1'))
  await screen.findByText(/Reprocessing queued. Wait for AI Analysis/)
})

test('quota errors show plan guidance without offering OCR reprocessing', async () => {
  api.getLatestResponse.mockRejectedValue({ success: false, code: 'NOT_FOUND' })
  api.generateAllegationWiseDraft.mockRejectedValue({ success: false, code: 'USAGE_CAP_EXCEEDED', message: 'Monthly AI usage limit reached (5000/5000).' })
  mount()
  fireEvent.click(await screen.findByRole('button', { name: 'Generate Allegation-wise Draft' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('AI usage limit reached')
  expect(screen.getByRole('link', { name: 'View plan and usage' })).toHaveAttribute('href', '/settings/billing')
  expect(screen.queryByRole('button', { name: 'Reprocess notice' })).not.toBeInTheDocument()
})
