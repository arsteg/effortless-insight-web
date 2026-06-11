import { AuthLayout } from '@/components/layout'

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayout>{children}</AuthLayout>
}
