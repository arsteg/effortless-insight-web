import { fireEvent, render, screen } from '@testing-library/react'
import { AIAnalysisView } from '../ai-analysis-view'

jest.mock('@/components/features/subscription/feature-gate', () => ({
  FeatureGate: ({ children }: { children: React.ReactNode }) => children,
}))

describe('analysis failure feedback', () => {
  it('shows the GSTIN reason during an existing retry', () => {
    render(<AIAnalysisView processingStatus="retrying" processingError="The document GSTIN is not registered in this organization." />)
    expect(screen.getByRole('alert')).toHaveTextContent('GSTIN is not registered')
  })

  it('shows the failure reason and allows retry after correction', () => {
    const onRetry = jest.fn()
    render(<AIAnalysisView processingStatus="failed" processingError="Correct the selected GSTIN before retrying." onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Correct the selected GSTIN')
    fireEvent.click(screen.getByRole('button', { name: 'Retry Analysis' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('retains a fallback for older API responses', () => {
    render(<AIAnalysisView processingStatus="failed" />)
    expect(screen.getByRole('alert')).toHaveTextContent('We encountered an error')
  })
})
