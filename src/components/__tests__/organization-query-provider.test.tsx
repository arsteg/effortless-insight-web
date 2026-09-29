import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Providers } from '../providers'

let mockOrganizationId = 'firm'
jest.mock('@/stores/organization-store', () => ({
  useOrganizationStore: (selector: (state: unknown) => unknown) =>
    selector({ currentOrganization: { id: mockOrganizationId } }),
}))
jest.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) => selector({ user: { id: 'ca' } }),
}))
jest.mock('@/components/theme-provider', () => ({ ThemeProvider: ({ children }: { children: React.ReactNode }) => children }))
jest.mock('@/components/ui/tooltip', () => ({ TooltipProvider: ({ children }: { children: React.ReactNode }) => children }))
jest.mock('@/components/ui/toaster', () => ({ Toaster: () => null }))

function Page({ fetchData }: { fetchData: () => Promise<string> }) {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: fetchData })
  const [filter, setFilter] = useState('')
  return <><div>{data ?? 'Loading'}</div><input aria-label="Client filter" value={filter} onChange={e => setFilter(e.target.value)} /></>
}

beforeEach(() => { mockOrganizationId = 'firm' })

test('switching organization fetches fresh data and clears old page selections without a browser reload', async () => {
  const fetchData = jest.fn(async () => mockOrganizationId)
  const view = render(<Providers><Page fetchData={fetchData} /></Providers>)
  await screen.findByText('firm')
  fireEvent.change(screen.getByLabelText('Client filter'), { target: { value: 'old GSTIN' } })
  mockOrganizationId = 'client'
  view.rerender(<Providers><Page fetchData={fetchData} /></Providers>)
  expect(screen.queryByText('firm')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Client filter')).toHaveValue('')
  await screen.findByText('client')
  mockOrganizationId = 'firm'
  view.rerender(<Providers><Page fetchData={fetchData} /></Providers>)
  await screen.findByText('firm')
  expect(fetchData).toHaveBeenCalledTimes(3)
})

test('a late response from the previous organization cannot replace the selected client data', async () => {
  let finishOldRequest!: (value: string) => void
  const oldRequest = new Promise<string>(resolve => { finishOldRequest = resolve })
  const fetchData = jest.fn(() => mockOrganizationId === 'firm' ? oldRequest : Promise.resolve('client notices'))
  const view = render(<Providers><Page fetchData={fetchData} /></Providers>)
  await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))
  mockOrganizationId = 'client'
  view.rerender(<Providers><Page fetchData={fetchData} /></Providers>)
  await screen.findByText('client notices')
  await act(async () => { finishOldRequest('old firm notices'); await oldRequest })
  expect(screen.queryByText('old firm notices')).not.toBeInTheDocument()
  expect(screen.getByText('client notices')).toBeInTheDocument()
})
