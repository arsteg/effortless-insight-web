import { EmailAccount, getSyncStatusLabel } from './email-sync';

const account: EmailAccount = {
  id: 'account', provider: 'outlook', email: 'owner@example.com', status: 'connected',
  isConnected: true, autoSyncEnabled: true, connectedAt: '2026-10-12', lastSyncAt: '2026-10-12',
};

test.each([
  ['completed', undefined, 'Synced'],
  ['completed_with_warnings', 'no_gstin_match', 'Synced with warnings'],
  ['completed_with_warnings', 'monthly_limit_reached', 'Notice limit reached'],
  ['completed_with_warnings', 'NOTICE_LIMIT_EXCEEDED', 'Notice limit reached'],
  ['completed_with_warnings', 'subscription_required', 'Subscription required'],
  ['failed', 'provider_failed', 'Sync failed'],
])('maps %s / %s to %s', (status, errorCode, expected) => {
  expect(getSyncStatusLabel({ ...account, lastSyncResult: {
    status, errorCode, emailsScanned: 4, noticesImported: 1,
    attachmentsSkipped: 0, duplicatesSkipped: 2, failedToProcess: 1,
  } })).toBe(expected);
});

test('expired authorization overrides an older successful sync', () => {
  expect(getSyncStatusLabel({ ...account, status: 'reauthentication_required' })).toBe('Reconnect required');
});

test('legacy partial imports show warnings instead of failure', () => {
  expect(getSyncStatusLabel({ ...account, status: 'sync_failed', lastSyncError: 'Review required',
    lastSyncResult: { emailsScanned: 4, noticesImported: 1, attachmentsSkipped: 0,
      duplicatesSkipped: 2, failedToProcess: 1 } })).toBe('Synced with warnings');
});
