import { decodeMentionDraft, editMentionDraft, selectDraftMention, encodeMentionDraft } from './mention-draft'

test('editing an existing comment hides IDs and preserves them on submission', () => {
  const draft = decodeMentionDraft('Hi @[CA](user-1)!')
  expect(draft.text).toBe('Hi @CA!')
  expect(encodeMentionDraft(editMentionDraft(draft, 'Hello Hi @CA!'))).toBe('Hello Hi @[CA](user-1)!')
})

test('same-name users keep separate identities', () => {
  let draft = selectDraftMention(decodeMentionDraft('@'), 0, 1, { id: 'one', name: 'CA' })
  draft = editMentionDraft(draft, draft.text + '@')
  draft = selectDraftMention(draft, 4, 5, { id: 'two', name: 'CA' })
  expect(draft.text).toBe('@CA @CA ')
  expect(encodeMentionDraft(draft)).toBe('@[CA](one) @[CA](two) ')
})

test('changing or removing a mention removes the tagged identity', () => {
  const draft = decodeMentionDraft('@[CA](one) hello')
  expect(encodeMentionDraft(editMentionDraft(draft, '@CB hello'))).toBe('@CB hello')
  expect(encodeMentionDraft(editMentionDraft(draft, 'hello'))).toBe('hello')
})
