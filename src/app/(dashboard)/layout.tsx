import { DashboardLayout } from '@/components/layout'
import { AuthenticatedNotifications } from '@/components/authenticated-notifications'

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      {children}
      <AuthenticatedNotifications />
    </DashboardLayout>
  )
}
