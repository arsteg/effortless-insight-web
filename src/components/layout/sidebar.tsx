'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  Upload,
  RefreshCw,
  Calendar,
  Lock,
  LifeBuoy,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
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
    requiredFeature: FeatureCodes.AdvancedAnalytics,
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
    requiredFeature: FeatureCodes.Collaboration,
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

/**
 * Shared active-route + feature-gate logic so the desktop diary tabs and the
 * mobile drawer resolve state identically (single source of truth).
 */
function useNavHelpers() {
  const pathname = usePathname()
  const { data: features } = useFeatures()

  const isActive = (href: string) => {
    if (href === '/notices' && pathname === '/notices/upload') return false
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const hasFeatureAccess = (featureCode?: string) => {
    if (!featureCode) return true
    return features?.includes(featureCode) ?? true // Default to true while loading
  }

  return { isActive, hasFeatureAccess }
}

/**
 * A single diary-style index tab, centred vertically in the top bar beside the
 * brand. A rounded chip with a layered border and a thin top accent gives it a
 * tabbed, physical feel that reads as clearly distinct from the header's plain
 * icon controls. The active tab is distinguished by colour, weight, border and
 * the azure accent.
 */
function DiaryTab({
  item,
  active,
  isLocked,
}: {
  item: NavItem
  active: boolean
  isLocked: boolean
}) {
  const Icon = item.icon
  const showBadge = !isLocked && !!item.badge && item.badge > 0

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          aria-label={item.title}
          aria-current={active ? 'page' : undefined}
          href={isLocked ? '/settings/billing' : item.href}
          className={cn(
            'diary-tab group relative flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium outline-none',
            'transition-[background-color,color,border-color,box-shadow] duration-150',
            active
              ? 'border-azure-500/40 bg-azure-500/10 font-semibold text-foreground shadow-soft'
              : 'border-border/50 bg-muted/40 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground hover:shadow-soft',
            isLocked && 'opacity-70',
          )}
        >
          {/* Thin diary-tab accent along the top edge of the active chip */}
          {active && (
            <span
              aria-hidden
              className="absolute inset-x-2.5 top-0 h-[2.5px] rounded-full bg-azure-500"
            />
          )}
          <Icon
            className={cn(
              'h-4 w-4 shrink-0 transition-colors',
              active ? 'text-azure-600' : 'text-muted-foreground group-hover:text-foreground',
            )}
          />
          <span>{item.title}</span>
          {isLocked && <Lock aria-hidden className="h-3.5 w-3.5 text-amber-500" />}
          {showBadge && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1.5 text-xs font-semibold leading-none text-white">
              {item.badge}
            </span>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="font-medium">
        <p>
          {item.title}
          {isLocked ? ' · Upgrade required' : ''}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * Desktop / tablet primary navigation: diary index tabs rendered inline in the
 * header, immediately beside the company label. Scrolls horizontally when the
 * viewport is too narrow to show every tab, so all destinations stay reachable.
 */
export function DesktopNavTabs() {
  const { isActive, hasFeatureAccess } = useNavHelpers()

  const renderTab = (item: NavItem) => {
    const isLocked = !!item.requiredFeature && !hasFeatureAccess(item.requiredFeature)
    return (
      <DiaryTab key={item.href} item={item} active={isActive(item.href)} isLocked={isLocked} />
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="diary-rail-scroll hidden min-w-0 flex-1 items-center justify-center gap-1.5 overflow-x-auto px-2 py-1 md:flex">
        <nav aria-label="Main navigation" className="flex items-center gap-1.5">
          {mainNavItems.map(renderTab)}
        </nav>

        <div aria-hidden className="mx-1 h-6 w-px shrink-0 bg-border/70" />

        <nav aria-label="Workspace navigation" className="flex items-center gap-1.5">
          {bottomNavItems.map(renderTab)}
        </nav>
      </div>
    </TooltipProvider>
  )
}

/** Horizontal link used inside the mobile drawer. */
function MobileNavLink({
  item,
  active,
  isLocked,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  isLocked: boolean
  onNavigate: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      aria-label={item.title}
      aria-current={active ? 'page' : undefined}
      href={isLocked ? '/settings/billing' : item.href}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
        active
          ? 'bg-secondary text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        isLocked && 'opacity-60',
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-azure-500"
        />
      )}
      <Icon
        className={cn(
          'h-5 w-5 shrink-0 transition-colors',
          active ? 'text-azure-600' : 'text-muted-foreground group-hover:text-accent-foreground',
        )}
      />
      <span>{item.title}</span>
      {isLocked && <Lock className="ml-auto h-3.5 w-3.5 text-amber-500" />}
      {!isLocked && !!item.badge && item.badge > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1.5 text-xs font-semibold text-white">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

/**
 * Mobile navigation: an accessible drawer with horizontal labels, opened from
 * the header's menu button on small screens.
 */
export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const { isActive, hasFeatureAccess } = useNavHelpers()

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)')
    const closeMobileNavigation = () => {
      if (desktop.matches) setSidebarOpen(false)
    }
    desktop.addEventListener('change', closeMobileNavigation)
    return () => desktop.removeEventListener('change', closeMobileNavigation)
  }, [setSidebarOpen])

  const onNavigate = () => {
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const renderLink = (item: NavItem) => {
    const isLocked = !!item.requiredFeature && !hasFeatureAccess(item.requiredFeature)
    return (
      <MobileNavLink
        key={item.href}
        item={item}
        active={isActive(item.href)}
        isLocked={isLocked}
        onNavigate={onNavigate}
      />
    )
  }

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent
        side="left"
        className="product-ui flex w-72 flex-col p-0 md:hidden"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          document.getElementById('mobile-menu-trigger')?.focus()
        }}
      >
        <div className="border-b px-5 py-5">
          <SheetTitle className="text-base">EffortlessInsight</SheetTitle>
          <SheetDescription className="mt-1 text-xs">Your GST workspace</SheetDescription>
        </div>
        <nav aria-label="Mobile navigation" className="flex-1 space-y-1 overflow-y-auto p-3">
          {mainNavItems.map(renderLink)}
          <Separator className="my-4" />
          {bottomNavItems.map(renderLink)}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
