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
  RefreshCw,
  Calendar,
  Lock,
  LifeBuoy,
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
import { useFeatures, FeatureCodes } from '@/hooks/use-feature-access'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  /** Feature code required to access this item. If not available, shows lock icon */
  requiredFeature?: string
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
    title: 'GST Sync',
    href: '/gst-sync',
    icon: RefreshCw,
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
    requiredFeature: FeatureCodes.Workflows,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    requiredFeature: FeatureCodes.AdvancedReporting,
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
]

const bottomNavItems: NavItem[] = [
  {
    title: 'Team',
    href: '/team',
    icon: Users,
  },
  {
    title: 'Support',
    href: '/support',
    icon: LifeBuoy,
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
  const { data: features } = useFeatures()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const hasFeatureAccess = (featureCode?: string) => {
    if (!featureCode) return true
    return features?.includes(featureCode) ?? true // Default to true while loading
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href)
    const Icon = item.icon
    const isLocked = item.requiredFeature && !hasFeatureAccess(item.requiredFeature)

    const linkContent = (
      <Link
        href={isLocked ? '/settings/billing' : item.href}
        onClick={() => {
          // Close sidebar on mobile after navigation
          if (window.innerWidth < 768) {
            setSidebarOpen(false)
          }
        }}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          active
            ? 'bg-azure-50 text-azure-700 shadow-soft'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          isLocked && 'opacity-60',
          sidebarCollapsed && 'justify-center px-2'
        )}
      >
        {/* Active azure rail */}
        {active && !sidebarCollapsed && (
          <span
            aria-hidden
            className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-azure-500"
          />
        )}
        <Icon
          className={cn(
            'h-5 w-5 shrink-0 transition-colors',
            active ? 'text-azure-600' : 'text-muted-foreground group-hover:text-accent-foreground'
          )}
        />
        {!sidebarCollapsed && <span>{item.title}</span>}
        {!sidebarCollapsed && isLocked && (
          <Lock className="ml-auto h-3.5 w-3.5 text-amber-500" />
        )}
        {!sidebarCollapsed && !isLocked && item.badge && item.badge > 0 && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1.5 text-xs font-semibold text-white">
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
            <p>{item.title}{isLocked ? ' (Upgrade required)' : ''}</p>
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
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/70 bg-card/80 backdrop-blur-xl transition-all duration-300 md:static md:z-auto',
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
