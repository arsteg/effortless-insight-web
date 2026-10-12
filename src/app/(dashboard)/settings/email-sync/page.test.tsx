import { render, screen, waitFor } from '@testing-library/react';
import EmailSyncPage from './page';

const mockReplace = jest.fn();
const mockToast = jest.fn();
const mockRefetch = jest.fn();
const mockMutate = jest.fn();
let mockParams = new URLSearchParams();
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: mockReplace }), useSearchParams: () => mockParams }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mockToast }) }));
jest.mock('@/hooks/use-permissions', () => ({ usePermissions: () => ({ isAdmin: true }) }));
jest.mock('@/hooks/use-email-sync', () => ({
  useEmailAccounts: () => ({ data: { accounts: [], total: 0 }, isLoading: false, refetch: mockRefetch }),
  useInitiateEmailConnection: () => ({ mutateAsync: mockMutate, isPending: false }),
}));
jest.mock('@/components/features/email-sync', () => ({
  EmailSyncConnectionCard: () => null, EmailSyncSettingsDialog: () => null,
  EmailSyncHistoryDialog: () => null, EmailSyncDisconnectDialog: () => null,
}));

beforeEach(() => { jest.clearAllMocks(); mockParams = new URLSearchParams(); });

test.each([
  ['database_schema_outdated', 'migrations'],
  ['connection_lock_failed', 'database connection lock'],
  ['token_encryption_failed', 'field-encryption'],
  ['connection_save_failed', 'write permissions'],
])('shows actionable callback failure %s on the page', async (code, guidance) => {
  mockParams = new URLSearchParams({ email_sync: code });
  render(<EmailSyncPage />);
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(guidance));
  expect(screen.getByRole('alert')).toHaveTextContent(`Reference: ${code}`);
});

test('shows both providers and a safe empty state', () => {
  render(<EmailSyncPage />);
  expect(screen.getAllByText(/Gmail/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Microsoft/i).length).toBeGreaterThan(0);
});

test('server completion refreshes accounts and removes result query', async () => {
  mockParams = new URLSearchParams('email_sync=connected');
  render(<EmailSyncPage />);
  await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Email connected' })));
  expect(mockReplace).toHaveBeenCalledWith('/settings/email-sync');
  expect(mockRefetch).toHaveBeenCalled();
  expect(mockMutate).not.toHaveBeenCalled();
});

test('provider denial displays retry guidance instead of exchanging a code', async () => {
  mockParams = new URLSearchParams('email_sync=access_denied');
  render(<EmailSyncPage />);
  await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  expect(mockMutate).not.toHaveBeenCalled();
});

test('invalid Microsoft secret stays visible after callback URL cleanup', async () => {
  mockParams = new URLSearchParams('email_sync=client_secret_invalid');
  const { rerender } = render(<EmailSyncPage />);
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('secret Value, not the Secret ID'));
  expect(screen.getByRole('alert')).toHaveTextContent('Reference: client_secret_invalid');
  mockParams = new URLSearchParams();
  rerender(<EmailSyncPage />);
  expect(screen.getByRole('alert')).toHaveTextContent('secret Value, not the Secret ID');
});

test('unknown callback values are not reflected in the UI or toast', async () => {
  mockParams = new URLSearchParams({ email_sync: 'private-token-value' });
  render(<EmailSyncPage />);
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Reference: connection_failed'));
  expect(screen.queryByText(/private-token-value/)).not.toBeInTheDocument();
  expect(JSON.stringify(mockToast.mock.calls)).not.toContain('private-token-value');
});
