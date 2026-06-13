'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
  Building2,
} from 'lucide-react'

import { cn, getInitials } from '@/lib/utils'
import { useAuthStore, useOrganizationStore, useAppStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NotificationCenter } from '@/components/features/notifications'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

export function Header() {
  const router = useRouter()
  const { user, logout, isLoading: authLoading } = useAuthStore()
  const {
    currentOrganization,
    organizations,
    switchOrganization,
    isLoading: orgLoading,
  } = useOrganizationStore()
  const { toggleSidebar } = useAppStore()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleSwitchOrg = async (orgId: string) => {
    await switchOrganization(orgId)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <Image
          src="/small-logo.svg"
          alt="EffortlessInsight"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <span className="hidden md:inline-block">EffortlessInsight</span>
      </Link>

      {/* Organization Switcher */}
      {organizations.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-4 gap-2">
              <Building2 className="h-4 w-4" />
              {orgLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span className="max-w-[150px] truncate">
                  {currentOrganization?.name || 'Select Organization'}
                </span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSwitchOrg(org.id)}
                className={cn(
                  'cursor-pointer',
                  currentOrganization?.id === org.id && 'bg-accent'
                )}
              >
                <div className="flex flex-col">
                  <span>{org.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {org.role} · {org.noticeCount} notices
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notifications */}
      <NotificationCenter />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            {authLoading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : (
              <Avatar>
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
