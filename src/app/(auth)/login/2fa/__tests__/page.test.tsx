import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { useRouter, useSearchParams } from 'next/navigation'
import TwoFactorPage from '../page'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'
import type { User } from '@/types'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock auth API
jest.mock('@/lib/api/auth', () => ({
  authApi: {
    login2fa: jest.fn(),
    getMe: jest.fn(),
  },
}))

// Mock auth store
jest.mock('@/stores/auth-store', () => ({
  useAuthStore: jest.fn(),
}))

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
}

const mockToast = jest.fn()

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: true,
  mobileVerified: false,
  is2faEnabled: true,
  role: 'admin',
  organizations: [],
  createdAt: '2024-01-01T00:00:00Z',
}

const mockSetUser = jest.fn()

describe('TwoFactorPage (OAuth + 2FA Flow)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
    ;(useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ setUser: mockSetUser })
    )
    sessionStorage.clear()
  })

  describe('Security: Direct access without partialToken', () => {
    it('should redirect to /login when partialToken is missing', () => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      })

      render(<TwoFactorPage />)

      expect(mockRouter.replace).toHaveBeenCalledWith('/login')
    })

    it('should redirect to /login when partialToken is empty string', () => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(''),
      })

      render(<TwoFactorPage />)

      // Empty string is falsy, should redirect
      expect(mockRouter.replace).toHaveBeenCalledWith('/login')
    })
  })

  describe('UI rendering with valid partialToken', () => {
    beforeEach(() => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue('valid-partial-token'),
      })
    })

    it('should render 2FA form when partialToken is present', () => {
      render(<TwoFactorPage />)

      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
      expect(
        screen.getByText('Enter the verification code from your authenticator app')
      ).toBeInTheDocument()
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument()
    })

    it('should have verify button disabled when code is incomplete', () => {
      render(<TwoFactorPage />)

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      expect(verifyButton).toBeDisabled()
    })

    it('should enable verify button when 6-digit code is entered', () => {
      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '123456' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      expect(verifyButton).not.toBeDisabled()
    })

    it('should only allow numeric input', () => {
      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: 'abc123def456' } })

      expect(input).toHaveValue('123456')
    })

    it('should limit input to 6 digits', () => {
      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '12345678' } })

      expect(input).toHaveValue('123456')
    })
  })

  describe('Successful 2FA verification (THE FIX)', () => {
    beforeEach(() => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue('valid-partial-token'),
      })
      ;(authApi.login2fa as jest.Mock).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        backupCodeUsed: false,
      })
      ;(authApi.getMe as jest.Mock).mockResolvedValue(mockUser)
    })

    it('should call login2fa with correct parameters', async () => {
      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '123456' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(authApi.login2fa).toHaveBeenCalledWith('valid-partial-token', '123456')
      })
    })

    it('should fetch user data after successful 2FA (regression test)', async () => {
      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '123456' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(authApi.getMe).toHaveBeenCalled()
      })
    })

    it('should update auth store with user data (regression test)', async () => {
      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '123456' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(mockUser)
      })
    })

    it('should show success toast after verification', async () => {
      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '123456' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
          variant: 'success',
        })
      })
    })

    it('should redirect to /dashboard by default', async () => {
      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '123456' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should redirect to stored oauth_redirect URL when present', async () => {
      sessionStorage.setItem('oauth_redirect', '/dashboard/notices')

      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '123456' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/notices')
      })
    })

    it('should clear oauth_redirect from sessionStorage after use', async () => {
      sessionStorage.setItem('oauth_redirect', '/dashboard/notices')

      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '123456' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(sessionStorage.getItem('oauth_redirect')).toBeNull()
      })
    })
  })

  describe('Invalid 2FA code error handling', () => {
    beforeEach(() => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue('valid-partial-token'),
      })
    })

    it('should show error toast on invalid code', async () => {
      ;(authApi.login2fa as jest.Mock).mockRejectedValue(
        new Error('Invalid verification code')
      )

      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '000000' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Verification failed',
          description: 'Invalid verification code',
          variant: 'destructive',
        })
      })
    })

    it('should show generic error message when error has no message', async () => {
      ;(authApi.login2fa as jest.Mock).mockRejectedValue({})

      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '000000' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Verification failed',
          description: 'Invalid verification code. Please try again.',
          variant: 'destructive',
        })
      })
    })

    it('should remain on page after error to allow retry', async () => {
      ;(authApi.login2fa as jest.Mock).mockRejectedValue(
        new Error('Invalid verification code')
      )

      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '000000' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled()
      })

      // Should NOT redirect
      expect(mockRouter.push).not.toHaveBeenCalled()
      expect(mockRouter.replace).not.toHaveBeenCalled()

      // Form should still be visible
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument()
    })

    it('should not call getMe when login2fa fails', async () => {
      ;(authApi.login2fa as jest.Mock).mockRejectedValue(
        new Error('Invalid verification code')
      )

      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '000000' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled()
      })

      expect(authApi.getMe).not.toHaveBeenCalled()
    })

    it('should not call setUser when login2fa fails', async () => {
      ;(authApi.login2fa as jest.Mock).mockRejectedValue(
        new Error('Invalid verification code')
      )

      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '000000' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled()
      })

      expect(mockSetUser).not.toHaveBeenCalled()
    })
  })

  describe('Loading states', () => {
    beforeEach(() => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue('valid-partial-token'),
      })
    })

    it('should show loading state during verification', async () => {
      // Make login2fa hang indefinitely
      ;(authApi.login2fa as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      )

      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '123456' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(screen.getByText(/verifying/i)).toBeInTheDocument()
      })
    })

    it('should disable input during verification', async () => {
      ;(authApi.login2fa as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      )

      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '123456' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(input).toBeDisabled()
      })
    })

    it('should disable buttons during verification', async () => {
      ;(authApi.login2fa as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      )

      render(<TwoFactorPage />)

      const input = screen.getByPlaceholderText('000000')
      fireEvent.change(input, { target: { value: '123456' } })

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      fireEvent.click(verifyButton)

      await waitFor(() => {
        expect(verifyButton).toBeDisabled()
        expect(screen.getByRole('button', { name: /back to login/i })).toBeDisabled()
      })
    })
  })

  describe('Back to login navigation', () => {
    beforeEach(() => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue('valid-partial-token'),
      })
    })

    it('should have back to login link pointing to /login', () => {
      render(<TwoFactorPage />)

      const backLink = screen.getByRole('link', { name: /back to login/i })
      expect(backLink).toHaveAttribute('href', '/login')
    })
  })
})
