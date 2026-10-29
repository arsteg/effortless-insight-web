'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
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

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, sidebarCollapsed, toggleSidebarCollapsed, setSidebarOpen } =
    useAppStore()
  const { data: features } = useFeatures()

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)')
    const closeMobileNavigation = () => {
      if (desktop.matches) setSidebarOpen(false)
    }
    desktop.addEventListener('change', closeMobileNavigation)
    return () => desktop.removeEventListener('change', closeMobileNavigation)
  }, [setSidebarOpen])

  const isActive = (href: string) => {
    if (href === '/notices' && pathname === '/notices/upload') return false
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const hasFeatureAccess = (featureCode?: string) => {
    if (!featureCode) return true
    return features?.includes(featureCode) ?? true // Default to true while loading
  }

  const NavLink = ({ item, mobile = false }: { item: NavItem; mobile?: boolean }) => {
    const collapsed = sidebarCollapsed && !mobile
    const active = isActive(item.href)
    const Icon = item.icon
    const isLocked = item.requiredFeature && !hasFeatureAccess(item.requiredFeature)

    const linkContent = (
      <Link
        aria-label={item.title}
        aria-current={active ? 'page' : undefined}
        href={isLocked ? '/settings/billing' : item.href}
        onClick={() => {
          // Close sidebar on mobile after navigation
          if (window.innerWidth < 768) {
            setSidebarOpen(false)
          }
        }}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
          active
            ? 'bg-secondary text-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          isLocked && 'opacity-60',
          collapsed && 'justify-center px-2'
        )}
      >
        {/* Active azure rail */}
        {active && !collapsed && (
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
        {!collapsed && <span>{item.title}</span>}
        {!collapsed && isLocked && (
          <Lock className="ml-auto h-3.5 w-3.5 text-amber-500" />
        )}
        {!collapsed && !isLocked && item.badge && item.badge > 0 && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1.5 text-xs font-semibold text-white">
            {item.badge}
          </span>
        )}
      </Link>
    )

    if (collapsed) {
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
            {mainNavItems.map((item) => <NavLink key={item.href} item={item} mobile />)}
            <Separator className="my-4" />
            {bottomNavItems.map((item) => <NavLink key={item.href} item={item} mobile />)}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Sidebar */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r bg-card md:flex',
          sidebarCollapsed ? 'w-64 md:w-20' : 'w-60',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Sidebar header with logo */}
        <div className="hidden md:flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            {sidebarCollapsed ? (
              <Image
                src="/small-logo.svg"
                alt="EffortlessInsight - GST notice management"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            ) : (
              <Image
                src="/logo.svg"
                alt="EffortlessInsight - GST notice management"
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

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav aria-label="Main navigation" className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          <Separator className="my-4" />

          <nav aria-label="Workspace navigation" className="space-y-1">
            {bottomNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  )
}
