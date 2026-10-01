import { fireEvent, render, screen } from '@/test/test-utils'

import { AssistantLauncher } from '../assistant-launcher'
import { useAssistantStore } from '@/stores/assistant-store'
import { useFeatureAccess } from '@/hooks/use-feature-access'

jest.mock('@/hooks/use-feature-access', () => ({
  FeatureCodes: { AskAi: 'ask_ai' },
  useFeatureAccess: jest.fn(),
}))

const useFeatureAccessMock = useFeatureAccess as jest.Mock

describe('AssistantLauncher', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAssistantStore.setState({ isOpen: false })
  })

  it('renders the Ask AI pill when Ask AI is enabled and opens the panel', () => {
    useFeatureAccessMock.mockReturnValue({ hasAccess: true, isLoading: false })
    render(<AssistantLauncher />)

    const button = screen.getByTestId('assistant-launcher')
    expect(button).toHaveTextContent('Ask AI')
    expect(useFeatureAccessMock).toHaveBeenCalledWith('ask_ai')

    fireEvent.click(button)
    expect(useAssistantStore.getState().isOpen).toBe(true)
  })

  it('is hidden on plans without Ask AI', () => {
    useFeatureAccessMock.mockReturnValue({ hasAccess: false, isLoading: false })
    render(<AssistantLauncher />)
    expect(screen.queryByTestId('assistant-launcher')).not.toBeInTheDocument()
  })

  it('is hidden while the feature list is still loading', () => {
    useFeatureAccessMock.mockReturnValue({ hasAccess: false, isLoading: true })
    render(<AssistantLauncher />)
    expect(screen.queryByTestId('assistant-launcher')).not.toBeInTheDocument()
  })

  it('is hidden while the panel is open', () => {
    useFeatureAccessMock.mockReturnValue({ hasAccess: true, isLoading: false })
    useAssistantStore.setState({ isOpen: true })
    render(<AssistantLauncher />)
    expect(screen.queryByTestId('assistant-launcher')).not.toBeInTheDocument()
  })
})
