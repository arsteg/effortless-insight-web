export interface DraftMention { start: number; end: number; id: string; name: string }
export interface MentionDraft { text: string; mentions: DraftMention[] }

export function decodeMentionDraft(content: string): MentionDraft {
  const mentions: DraftMention[] = []
  let text = '', offset = 0
  for (const match of content.matchAll(/@\[([^\]]+)\]\(([^)]+)\)/g)) {
    text += content.slice(offset, match.index)
    const start = text.length
    text += `@${match[1]}`
    mentions.push({ start, end: text.length, name: match[1], id: match[2] })
    offset = match.index! + match[0].length
  }
  return { text: text + content.slice(offset), mentions }
}

// Keep identities attached to their text ranges, even when two users share a name.
// Editing through a mention removes its identity rather than tagging the wrong user.
export function editMentionDraft(draft: MentionDraft, text: string): MentionDraft {
  let start = 0
  while (start < draft.text.length && start < text.length && draft.text[start] === text[start]) start++
  let oldEnd = draft.text.length, newEnd = text.length
  while (oldEnd > start && newEnd > start && draft.text[oldEnd - 1] === text[newEnd - 1]) { oldEnd--; newEnd-- }
  const delta = newEnd - oldEnd
  const mentions = draft.mentions.flatMap(mention => {
    if (mention.end <= start) return [mention]
    if (mention.start >= oldEnd) return [{ ...mention, start: mention.start + delta, end: mention.end + delta }]
    return []
  })
  return { text, mentions }
}

export function selectDraftMention(draft: MentionDraft, start: number, end: number, user: { id: string; name: string }): MentionDraft {
  const label = `@${user.name}`
  const result = editMentionDraft(draft, draft.text.slice(0, start) + label + ' ' + draft.text.slice(end))
  result.mentions = result.mentions.filter(m => m.end <= start || m.start >= start + label.length)
  result.mentions.push({ start, end: start + label.length, ...user })
  return result
}

export function encodeMentionDraft(draft: MentionDraft): string {
  let text = draft.text
  for (const mention of [...draft.mentions].sort((a, b) => b.start - a.start)) {
    if (text.slice(mention.start, mention.end) === `@${mention.name}`)
      text = text.slice(0, mention.start) + `@[${mention.name}](${mention.id})` + text.slice(mention.end)
  }
  return text
}
