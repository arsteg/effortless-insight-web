import { insertMention, parseMentions, renderTextWithMentions } from './mention-autocomplete'

const user = { id: '01a0d6ec-4fd9-71a4-8023-5cd47d719bb8', name: 'istc test ca' }

test('selected mentions retain identity but display only the name', () => {
  const { newText } = insertMention('Hello @istc', 6, 11, user)
  expect(parseMentions(newText)[0]).toMatchObject({ userId: user.id, name: user.name })
  const element = document.createElement('div')
  element.innerHTML = renderTextWithMentions(newText)
  expect(element.textContent).toBe('Hello @istc test ca ')
})

test('fallback rendering escapes HTML in comment text and mention names', () => {
  const element = document.createElement('div')
  element.innerHTML = renderTextWithMentions(`<img src=x onerror=alert(1)> @[<script>bad</script>](${user.id})`)
  expect(element.querySelector('img, script')).toBeNull()
  expect(element.textContent).toContain('@<script>bad</script>')
})
