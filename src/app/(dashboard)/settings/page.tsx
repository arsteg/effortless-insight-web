'use client'

import Link from 'next/link'
import { User, Building2, Users, CreditCard, Bell, Shield, Link2, ClipboardList, Mail, Lock } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useFeatures, FeatureCodes } from '@/hooks/use-feature-access'

const settingsLinks: {
  title: string
  description: string
  href: string
  icon: typeof User
  requiredFeature?: string
}[] = [
  {
    title: 'Profile',
    description: 'Manage your personal account settings',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Organization',
    description: 'Manage your organization details and GSTINs',
    href: '/settings/organization',
    icon: Building2,
  },
  {
    title: 'Team',
    description: 'Manage team members and invitations',
    href: '/team',
    icon: Users,
    requiredFeature: FeatureCodes.Collaboration,
  },
  {
    title: 'Integrations',
    description: 'Connect to GST Portal for automatic notice fetching',
    href: '/settings/integrations',
    icon: Link2,
  },
  {
    title: 'Email Sync',
    description: 'Automatically detect GST notices from your email',
    href: '/settings/email-sync',
    icon: Mail,
  },
  {
    title: 'Task Templates',
    description: 'Reusable task defaults for common notice work',
    href: '/settings/task-templates',
    icon: ClipboardList,
  },
  {
    title: 'Teams',
    description: 'Group members into teams for task assignment',
    href: '/settings/teams',
    icon: Users,
    requiredFeature: FeatureCodes.Collaboration,
  },
  {
    title: 'Billing',
    description: 'Manage your subscription and payment methods',
    href: '/settings/billing',
    icon: CreditCard,
  },
  {
    title: 'Notifications',
    description: 'Configure notification preferences',
    href: '/settings/notifications',
    icon: Bell,
  },
  {
    title: 'Security',
    description: 'Manage password and two-factor authentication',
    href: '/settings/security',
    icon: Shield,
  },
]

export default function SettingsPage() {
  const { data: features } = useFeatures()

  // Same rule as the sidebar: locked items send the user to billing to upgrade
  const hasFeatureAccess = (featureCode?: string) => {
    if (!featureCode) return true
    return features?.includes(featureCode) ?? true // Default to true while loading
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsLinks.map((item) => {
          const Icon = item.icon
          const isLocked = !hasFeatureAccess(item.requiredFeature)
          return (
            <Link key={item.href} href={isLocked ? '/settings/billing' : item.href} className="rounded-xl">
              <Card
                className={cn(
                  'h-full hover:border-primary/30 hover:bg-accent/30 transition-colors cursor-pointer',
                  isLocked && 'opacity-60'
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    {isLocked && <Lock className="ml-auto h-4 w-4 text-amber-500" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
