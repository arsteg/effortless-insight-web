import { fireEvent, render, screen, waitFor } from '@/test/test-utils'

import { AssistantActions } from '../assistant-actions'
import { apiClient } from '@/lib/api/client'
import type { AssistantConfirmAction, AssistantNavigateAction } from '@/types/assistant'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/dashboard',
}))

jest.mock('@/lib/api/client', () => ({
  apiClient: { post: jest.fn(), put: jest.fn() },
  getAccessToken: () => 'token',
}))

const postMock = apiClient.post as jest.Mock

const navigateAction: AssistantNavigateAction = {
  type: 'navigate',
  intent: 'team',
  label: 'Team & invitations',
  webRoute: '/team',
  mobileRoute: null,
}

const confirmAction: AssistantConfirmAction = {
  type: 'confirm_action',
  kind: 'create_task',
  summary: "Create task 'Reply to DRC-01'",
  method: 'POST',
  path: '/api/v1/tasks',
  body: { title: 'Reply to DRC-01' },
}

describe('AssistantActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('navigate chip routes on click', async () => {
    render(<AssistantActions actions={[navigateAction]} />)
    fireEvent.click(screen.getByRole('button', { name: /team & invitations/i }))
    expect(pushMock).toHaveBeenCalledWith('/team')
  })

  it('confirm card NEVER executes without an explicit click', () => {
    render(<AssistantActions actions={[confirmAction]} />)
    expect(screen.getByText(/needs your confirmation/i)).toBeInTheDocument()
    expect(postMock).not.toHaveBeenCalled()
  })

  it('confirm executes the whitelisted call with the /api/v1 prefix stripped', async () => {
    postMock.mockResolvedValueOnce({ data: {} })
    render(<AssistantActions actions={[confirmAction]} />)

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/tasks', { title: 'Reply to DRC-01' }))
    expect(await screen.findByText('Done')).toBeInTheDocument()
  })

  it('dismissing with Not now removes the card without executing', async () => {
    render(<AssistantActions actions={[confirmAction]} />)
    fireEvent.click(screen.getByRole('button', { name: /not now/i }))
    expect(screen.queryByText(/needs your confirmation/i)).not.toBeInTheDocument()
    expect(postMock).not.toHaveBeenCalled()
  })

  it('402 failure shows the plan upgrade message', async () => {
    const axiosError = Object.assign(new Error('402'), {
      isAxiosError: true,
      response: { status: 402 },
    })
    postMock.mockRejectedValueOnce(axiosError)
    render(<AssistantActions actions={[confirmAction]} />)

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    expect(
      await screen.findByText(/not available on your current plan/i)
    ).toBeInTheDocument()
  })
})
