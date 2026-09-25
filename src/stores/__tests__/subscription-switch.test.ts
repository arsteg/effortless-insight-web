import { useSubscriptionStore } from '../subscription-store'
import { billingApi } from '@/lib/api/billing'

jest.mock('@/lib/api/billing', () => ({ billingApi: { getCurrentSubscription: jest.fn() } }))

test('clearing subscription on organization switch ignores the previous organization response', async () => {
  useSubscriptionStore.getState().clearSubscription()
  let finish!: () => void
  jest.mocked(billingApi.getCurrentSubscription).mockImplementationOnce(
    () => new Promise(resolve => {
      finish = () => resolve({ subscription: { id: 'old-organization-plan', status: 'active' } } as Awaited<ReturnType<typeof billingApi.getCurrentSubscription>>)
    })
  )
  const oldRequest = useSubscriptionStore.getState().fetchSubscription()
  useSubscriptionStore.getState().clearSubscription()
  finish()
  await oldRequest
  expect(useSubscriptionStore.getState().subscription).toBeNull()
  expect(useSubscriptionStore.getState().isInitialized).toBe(false)
})
