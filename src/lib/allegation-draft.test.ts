import { reconcileDraft, printDraft } from './allegation-draft'
import type { AllegationWiseDraftResponse } from '@/types/allegation'

const draft = (): AllegationWiseDraftResponse => ({
  allegations: [1, 2].map(i => ({ id: `ALG-${i}`, serialNumber: i, description: `Issue ${i}`, category: 'Other', evidenceCited: [] })),
  responses: [1, 2].map(i => ({ allegationId: `ALG-${i}`, responseText: `Reply ${i}`, legalBasis: ['Section 16'], supportingEvidence: [], missingInformation: ['Challan'], confidence: 0.5, status: 'missing_info' })),
  combinedDraft: 'STALE', missingInfoSummary: ['STALE'],
  metadata: { model: 'test', processingTimeMs: 0, inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
})
test('edited and regenerated replies replace stale preview and missing information', () => {
  const value = draft()
  value.responses[0].responseText = 'Edited reply'
  value.responses[0].missingInformation = []
  const result = reconcileDraft(value)
  expect(result.combinedDraft).toContain('Edited reply')
  expect(result.combinedDraft).toContain('Reply 2')
  expect(result.combinedDraft).not.toContain('STALE')
  expect(result.missingInfoSummary).toEqual(['Challan (Allegation ALG-2)'])
})
test('partial and duplicate replies are rejected', () => {
  const value = draft()
  value.responses.pop()
  expect(() => reconcileDraft(value)).toThrow()
  value.responses.push(value.responses[0])
  expect(() => reconcileDraft(value)).toThrow()
})
test('response order follows the allegations', () => {
  const value = draft()
  value.responses.reverse()
  expect(reconcileDraft(value).responses[0].allegationId).toBe('ALG-1')
})
test('print uses text nodes so draft content cannot inject HTML', () => {
  const doc = document.implementation.createHTMLDocument()
  const popup = { document: doc, focus: jest.fn(), print: jest.fn(), opener: {} }
  jest.spyOn(window, 'open').mockReturnValue(popup as unknown as Window)
  printDraft('<script>alert(1)</script>')
  expect(doc.querySelector('script')).toBeNull()
  expect(doc.body.textContent).toContain('<script>')
  expect(popup.print).toHaveBeenCalled()
  expect(popup.opener).toBeNull()
  jest.restoreAllMocks()
})
