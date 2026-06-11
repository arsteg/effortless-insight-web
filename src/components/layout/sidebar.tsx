'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  Upload,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Notices',
    href: '/notices',
    icon: FileText,
  },
  {
    title: 'Upload',
    href: '/notices/upload',
    icon: Upload,
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
]

const bottomNavItems: NavItem[] = [
  {
    title: 'Team',
    href: '/team',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, sidebarCollapsed, toggleSidebarCollapsed, setSidebarOpen } =
    useAppStore()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href)
    const Icon = item.icon

    const linkContent = (
      <Link
        href={item.href}
        onClick={() => {
          // Close sidebar on mobile after navigation
          if (window.innerWidth < 768) {
            setSidebarOpen(false)
          }
        }}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          active
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          sidebarCollapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!sidebarCollapsed && <span>{item.title}</span>}
        {!sidebarCollapsed && item.badge && item.badge > 0 && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs text-primary">
            {item.badge}
          </span>
        )}
      </Link>
    )

    if (sidebarCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.title}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return linkContent
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300 md:static md:z-auto',
          sidebarCollapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Sidebar header with logo */}
        <div className="hidden md:flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            {sidebarCollapsed ? (
              <Image
                src="/small-logo.svg"
                alt="EffortlessInsight"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            ) : (
              <Image
                src="/logo.svg"
                alt="EffortlessInsight"
                width={140}
                height={32}
                style={{ width: 'auto', height: '32px' }}
              />
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebarCollapsed}
            className="h-8 w-8 shrink-0"
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                sidebarCollapsed && 'rotate-180'
              )}
            />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>

        {/* Mobile header with logo */}
        <div className="flex h-16 items-center border-b px-4 md:hidden">
          <Link href="/dashboard">
            <Image
              src="/logo.svg"
              alt="EffortlessInsight"
              width={140}
              height={32}
              style={{ width: 'auto', height: '32px' }}
            />
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          <Separator className="my-4" />

          <nav className="space-y-1">
            {bottomNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  )
}
