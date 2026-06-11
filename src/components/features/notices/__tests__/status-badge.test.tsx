import { render, screen } from '@/test/test-utils'
import { StatusBadge } from '../status-badge'

describe('StatusBadge', () => {
  it('renders uploaded status correctly', () => {
    render(<StatusBadge status="uploaded" />)
    expect(screen.getByText('Uploaded')).toBeInTheDocument()
  })

  it('renders processing status correctly', () => {
    render(<StatusBadge status="processing" />)
    expect(screen.getByText('Processing')).toBeInTheDocument()
  })

  it('renders analyzed status correctly', () => {
    render(<StatusBadge status="analyzed" />)
    expect(screen.getByText('Analyzed')).toBeInTheDocument()
  })

  it('renders in_progress status correctly', () => {
    render(<StatusBadge status="in_progress" />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders responded status correctly', () => {
    render(<StatusBadge status="responded" />)
    expect(screen.getByText('Responded')).toBeInTheDocument()
  })

  it('renders closed status correctly', () => {
    render(<StatusBadge status="closed" />)
    expect(screen.getByText('Closed')).toBeInTheDocument()
  })

  it('renders failed status correctly', () => {
    render(<StatusBadge status="failed" />)
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('handles unknown status gracefully', () => {
    // @ts-expect-error Testing unknown status
    render(<StatusBadge status="unknown_status" />)
    expect(screen.getByText('unknown_status')).toBeInTheDocument()
  })

  it('applies custom className to badge', () => {
    render(<StatusBadge status="uploaded" className="custom-class" />)
    expect(screen.getByText('Uploaded')).toHaveClass('custom-class')
  })
})
