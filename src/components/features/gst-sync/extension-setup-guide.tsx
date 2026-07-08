'use client'

import {
  Chrome,
  Download,
  Plus,
  LogIn,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ExtensionSetupGuideProps {
  onAddClient: () => void
}

export function ExtensionSetupGuide({ onAddClient }: ExtensionSetupGuideProps) {
  const steps = [
    {
      number: 1,
      title: 'Install the Chrome Extension',
      description:
        'Download and install the GST Notice Guard extension from the Chrome Web Store.',
      icon: Download,
      action: (
        <Button variant="outline" size="sm" asChild>
          <a
            href="https://chrome.google.com/webstore/detail/gst-notice-guard"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Get Extension
            <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </Button>
      ),
    },
    {
      number: 2,
      title: 'Add Your GSTIN',
      description:
        'Register the GSTINs you want to monitor. This tells the extension which accounts to capture notices from.',
      icon: Plus,
      action: (
        <Button size="sm" onClick={onAddClient}>
          <Plus className="mr-2 h-4 w-4" />
          Add GSTIN
        </Button>
      ),
    },
    {
      number: 3,
      title: 'Sign In to Extension',
      description:
        'Open the extension popup and sign in with your EffortlessInsight account to link your account.',
      icon: LogIn,
    },
    {
      number: 4,
      title: 'Visit GST Portal',
      description:
        'Log into the GST portal as usual. The extension will automatically capture any notices it finds.',
      icon: RefreshCw,
    },
    {
      number: 5,
      title: 'Review & Import',
      description:
        'Captured notices appear here for review. Import them to your main notices list when ready.',
      icon: CheckCircle2,
    },
  ]

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Chrome className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Get Started with GST Notice Sync</CardTitle>
        <CardDescription className="max-w-lg mx-auto">
          Automatically capture and sync GST notices from the portal using our Chrome extension.
          No more manual downloads or missed deadlines.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              {/* Connector line (hidden on mobile) */}
              {step.number < steps.length && (
                <div className="hidden xl:block absolute top-8 left-full w-full h-0.5 bg-border -translate-x-1/2 z-0" />
              )}

              <div className="relative z-10 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background">
                  <span className="text-2xl font-bold text-primary">{step.number}</span>
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                {step.action && <div>{step.action}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Privacy First:</strong> All processing happens in your browser. We never
                store your GST portal credentials.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Automatic Detection:</strong> The extension detects when you visit notice
                pages and captures the data automatically.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Offline Support:</strong> If you&apos;re offline, captured notices are queued and
                synced when you reconnect.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>PDF Downloads:</strong> Optionally download notice PDFs automatically for
                your records.
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default ExtensionSetupGuide
