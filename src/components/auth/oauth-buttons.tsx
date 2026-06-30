'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

import { authApi, OAuthProviderInfo } from '@/lib/api/auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// Provider icons as SVG components
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.4 24H0V12.6h11.4V24z" fill="#00A4EF"/>
      <path d="M24 24H12.6V12.6H24V24z" fill="#FFB900"/>
      <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#F25022"/>
      <path d="M24 11.4H12.6V0H24v11.4z" fill="#7FBA00"/>
    </svg>
  )
}

const providerIcons: Record<string, React.FC<{ className?: string }>> = {
  google: GoogleIcon,
  microsoft: MicrosoftIcon,
}

interface OAuthButtonsProps {
  mode?: 'login' | 'register'
  disabled?: boolean
  className?: string
}

export function OAuthButtons({ mode = 'login', disabled = false, className }: OAuthButtonsProps) {
  const [providers, setProviders] = useState<OAuthProviderInfo[]>([])
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await authApi.getOAuthProviders()
        setProviders(response.providers.filter(p => p.enabled))
      } catch (error) {
        console.error('Failed to fetch OAuth providers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProviders()
  }, [])

  const handleOAuthLogin = async (providerId: string) => {
    setLoadingProvider(providerId)
    try {
      const response = await authApi.getOAuthLoginUrl(providerId)
      // Redirect to provider's login page
      window.location.href = response.loginUrl
    } catch (error) {
      console.error(`Failed to get ${providerId} login URL:`, error)
      setLoadingProvider(null)
    }
  }

  // For re-authentication scenarios (e.g., before sensitive actions)
  const handleOAuthReauth = async (providerId: string) => {
    setLoadingProvider(providerId)
    try {
      const response = await authApi.getOAuthLoginUrl(providerId, { forceReauth: true })
      window.location.href = response.loginUrl
    } catch (error) {
      console.error(`Failed to get ${providerId} reauth URL:`, error)
      setLoadingProvider(null)
    }
  }

  // Don't render anything if no providers are enabled
  if (isLoading) {
    return null
  }

  if (providers.length === 0) {
    return null
  }

  const actionText = mode === 'login' ? 'Sign in' : 'Sign up'

  return (
    <div className={className}>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        {providers.map((provider) => {
          const Icon = providerIcons[provider.name]
          const isProviderLoading = loadingProvider === provider.name

          return (
            <Button
              key={provider.name}
              type="button"
              variant="outline"
              className="w-full"
              disabled={disabled || loadingProvider !== null}
              onClick={() => handleOAuthLogin(provider.name)}
            >
              {isProviderLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : Icon ? (
                <Icon className="mr-2 h-4 w-4" />
              ) : null}
              {actionText} with {provider.displayName}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
