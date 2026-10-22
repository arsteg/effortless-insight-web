import type { AllegationWiseDraftResponse } from '@/types/allegation'

// The current responses are the single source of truth for preview, save and print.
export function reconcileDraft(draft: AllegationWiseDraftResponse): AllegationWiseDraftResponse {
  const ids = draft.allegations.map(a => a.id)
  if (!ids.length || new Set(ids).size !== ids.length || draft.responses.length !== ids.length ||
      new Set(draft.responses.map(r => r.allegationId)).size !== ids.length ||
      draft.responses.some(r => !ids.includes(r.allegationId))) {
    throw new Error('Every allegation must have exactly one response. Please regenerate the draft.')
  }
  const responses = draft.allegations.map(a => draft.responses.find(r => r.allegationId === a.id)!)
  const combinedDraft = draft.allegations.map((a, i) => {
    const r = responses[i]
    return `ALLEGATION ${a.serialNumber}: ${a.description}\n\n${r.responseText}` +
      (r.legalBasis.length ? `\n\nLegal Basis: ${r.legalBasis.join('; ')}` : '')
  }).join('\n\n────────────────────\n\n')
  return { ...draft, responses, combinedDraft,
    missingInfoSummary: [...new Set(responses.flatMap(r =>
      r.missingInformation.map(item => `${item} (Allegation ${r.allegationId})`)))] }
}

export function printDraft(content: string) {
  const popup = window.open('', '_blank')
  if (!popup) throw new Error('Allow pop-ups to print or save the reply as PDF.')
  popup.opener = null
  popup.document.title = 'Allegation-wise reply'
  const style = popup.document.createElement('style')
  style.textContent = '@page { margin: 20mm } body { font: 12pt sans-serif; line-height: 1.5 } pre { white-space: pre-wrap; overflow-wrap: anywhere; font: inherit }'
  popup.document.head.appendChild(style)
  const text = popup.document.createElement('pre')
  text.textContent = content
  popup.document.body.appendChild(text)
  popup.focus()
  popup.print()
}
