import { render, screen } from '@/test/test-utils'
import { PriorityBadge } from '../priority-badge'

describe('PriorityBadge', () => {
  it('renders low priority correctly', () => {
    render(<PriorityBadge priority="low" />)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('renders medium priority correctly', () => {
    render(<PriorityBadge priority="medium" />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders high priority correctly', () => {
    render(<PriorityBadge priority="high" />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('renders critical priority correctly', () => {
    render(<PriorityBadge priority="critical" />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('applies appropriate variant classes for each priority', () => {
    // Low uses secondary variant
    const { rerender } = render(<PriorityBadge priority="low" />)
    expect(screen.getByText('Low')).toHaveClass('bg-secondary')

    // Medium uses default variant (primary)
    rerender(<PriorityBadge priority="medium" />)
    expect(screen.getByText('Medium')).toHaveClass('bg-primary')

    // High uses warning variant
    rerender(<PriorityBadge priority="high" />)
    expect(screen.getByText('High')).toHaveClass('bg-yellow-100')

    // Critical uses danger variant
    rerender(<PriorityBadge priority="critical" />)
    expect(screen.getByText('Critical')).toHaveClass('bg-red-100')
  })

  it('handles unknown priority gracefully', () => {
    // @ts-expect-error Testing unknown priority
    render(<PriorityBadge priority="unknown" />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })
})
