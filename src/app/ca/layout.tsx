import { CaLayout } from '@/components/layout'
import { AuthenticatedNotifications } from '@/components/authenticated-notifications'

export default function CaRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <CaLayout>
      {children}
      <AuthenticatedNotifications />
    </CaLayout>
  )
}
