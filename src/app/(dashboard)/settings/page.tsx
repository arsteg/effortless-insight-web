import Link from 'next/link'
import { User, Building2, Users, CreditCard, Bell, Shield } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const settingsLinks = [
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
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsLinks.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
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
