import { NoticeUpdateService } from '../notice-updates'

const mockConnection = {
  state: 'Disconnected',
  start: jest.fn(), stop: jest.fn(), invoke: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(), onclose: jest.fn(), onreconnected: jest.fn(),
}
jest.mock('@/lib/api/client', () => ({ getRealtimeAccessToken: jest.fn() }))
jest.mock('@microsoft/signalr', () => ({
  HubConnectionState: { Connected: 'Connected', Disconnected: 'Disconnected' },
  LogLevel: { Warning: 3 },
  HubConnectionBuilder: jest.fn(() => {
    const builder = { withUrl: jest.fn(), withAutomaticReconnect: jest.fn(), configureLogging: jest.fn(), build: () => mockConnection }
    builder.withUrl.mockReturnValue(builder)
    builder.withAutomaticReconnect.mockReturnValue(builder)
    builder.configureLogging.mockReturnValue(builder)
    return builder
  }),
}))

beforeEach(() => {
  jest.useFakeTimers()
  jest.clearAllMocks()
  mockConnection.state = 'Disconnected'
  mockConnection.start.mockImplementation(async () => { mockConnection.state = 'Connected' })
  mockConnection.stop.mockImplementation(async () => { mockConnection.state = 'Disconnected' })
})
afterEach(() => jest.useRealTimers())

it('survives Strict Mode cleanup and remount during negotiation', async () => {
  let finish!: () => void
  mockConnection.start.mockImplementationOnce(() => new Promise<void>(resolve => {
    finish = () => { mockConnection.state = 'Connected'; resolve() }
  }))
  const service = new NoticeUpdateService()
  const first = service.connect('org')
  await Promise.resolve()
  await service.disconnect()
  const second = service.connect('org')
  await jest.advanceTimersByTimeAsync(1000)
  expect(mockConnection.stop).not.toHaveBeenCalled()
  finish()
  await Promise.all([first, second])
  expect(mockConnection.start).toHaveBeenCalledTimes(1)
  expect(mockConnection.invoke).toHaveBeenCalledWith('JoinOrganization', 'org')
  await service.disconnect()
  await jest.advanceTimersByTimeAsync(1000)
  expect(mockConnection.stop).toHaveBeenCalledTimes(1)
})

it('retries an initial negotiation failure', async () => {
  mockConnection.start.mockRejectedValueOnce(new Error('offline'))
  const service = new NoticeUpdateService()
  await expect(service.connect('org')).rejects.toThrow('offline')
  await jest.advanceTimersByTimeAsync(1000)
  expect(mockConnection.start).toHaveBeenCalledTimes(2)
  expect(mockConnection.invoke).toHaveBeenCalledWith('JoinOrganization', 'org')
  await service.disconnect()
  await jest.advanceTimersByTimeAsync(1000)
})

it('keeps the connection until the last consumer leaves', async () => {
  const service = new NoticeUpdateService()
  await Promise.all([service.connect('org'), service.connect('org')])
  await service.disconnect()
  await jest.advanceTimersByTimeAsync(1000)
  expect(mockConnection.stop).not.toHaveBeenCalled()
  await service.disconnect()
  await jest.advanceTimersByTimeAsync(1000)
  expect(mockConnection.stop).toHaveBeenCalledTimes(1)
})

it('rejoins the organization after reconnecting', async () => {
  const service = new NoticeUpdateService()
  await service.connect('org')
  mockConnection.invoke.mockClear()
  const reconnected = mockConnection.onreconnected.mock.calls[0][0]
  reconnected()
  await jest.advanceTimersByTimeAsync(0)
  expect(mockConnection.invoke).toHaveBeenCalledWith('JoinOrganization', 'org')
  await service.disconnect()
  await jest.advanceTimersByTimeAsync(1000)
})

it('joins the latest organization when it changes during startup', async () => {
  let finish!: () => void
  mockConnection.start.mockImplementationOnce(() => new Promise<void>(resolve => {
    finish = () => { mockConnection.state = 'Connected'; resolve() }
  }))
  const service = new NoticeUpdateService()
  const first = service.connect('old-org')
  await Promise.resolve()
  await service.disconnect()
  const second = service.connect('new-org')
  finish()
  await Promise.all([first, second])
  expect(mockConnection.invoke).not.toHaveBeenCalledWith('JoinOrganization', 'old-org')
  expect(mockConnection.invoke).toHaveBeenCalledWith('JoinOrganization', 'new-org')
  await service.disconnect()
  await jest.advanceTimersByTimeAsync(1000)
})
