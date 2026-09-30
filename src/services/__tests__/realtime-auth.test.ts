import axios from 'axios'
import { getRealtimeAccessToken, refreshAccessToken, setTokens } from '@/lib/api/client'

const token = (expiresIn: number) => `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expiresIn }))}.signature`
beforeEach(() => { localStorage.clear() })
afterEach(() => jest.restoreAllMocks())

it('reads the latest token on each connection attempt', async () => {
  const first = token(3600)
  setTokens(first, 'refresh')
  expect(await getRealtimeAccessToken()).toBe(first)
  const next = token(7200)
  setTokens(next, 'next-refresh')
  expect(await getRealtimeAccessToken()).toBe(next)
})

it('shares a single rotating refresh across REST and concurrent hubs', async () => {
  setTokens(token(-1), 'refresh')
  const fresh = token(3600)
  const post = jest.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: fresh, refreshToken: 'rotated' } } })
  const results = await Promise.all([getRealtimeAccessToken(), getRealtimeAccessToken(), refreshAccessToken()])
  expect(results).toEqual([fresh, fresh, fresh])
  expect(post).toHaveBeenCalledTimes(1)
  expect(localStorage.getItem('refresh_token')).toBe('rotated')
})

it('allows a new refresh after a transient failure', async () => {
  setTokens(token(-1), 'refresh')
  const fresh = token(3600)
  jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ data: { data: { accessToken: fresh, refreshToken: 'rotated' } } })
  await expect(getRealtimeAccessToken()).rejects.toThrow('offline')
  expect(localStorage.getItem('refresh_token')).toBe('refresh')
  expect(await getRealtimeAccessToken()).toBe(fresh)
})
