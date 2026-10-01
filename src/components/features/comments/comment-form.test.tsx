import { fireEvent, render, screen } from '@testing-library/react'
import { CommentForm } from './comment-form'

jest.mock('@/hooks/use-permissions', () => ({ usePermissions: () => ({ canComment: true }) }))

const user = { id: '01a0d6ec-4fd9-71a4-8023-5cd47d719bb8', name: 'istc test ca' }

test('selecting a user displays only their name and submits their ID separately', () => {
  const submit = jest.fn()
  render(<CommentForm onSubmit={submit} availableUsers={[user]} showVisibilityToggle={false} />)
  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: '@istc', selectionStart: 5 } })
  fireEvent.click(screen.getByRole('button', { name: /istc test ca/ }))
  expect(input).toHaveValue('@istc test ca ')
  expect(submit).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Comment' }))
  expect(submit).toHaveBeenCalledWith(`@[${user.name}](${user.id})`, undefined)
})

test('edit mode hides GUIDs and keyboard submission retains them', () => {
  const submit = jest.fn()
  render(<CommentForm onSubmit={submit} initialContent={`Hi @[${user.name}](${user.id})`} showVisibilityToggle={false} />)
  const input = screen.getByRole('textbox')
  expect(input).toHaveValue('Hi @istc test ca')
  fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true })
  expect(submit).toHaveBeenCalledWith(`Hi @[${user.name}](${user.id})`, undefined)
})
