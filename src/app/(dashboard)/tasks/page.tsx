'use client'

import Link from 'next/link'
import { CheckSquare, FileText, ArrowRight } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TasksPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">
          Manage and track tasks related to your GST notices.
        </p>
      </div>

      {/* Info Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Task Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Tasks are organized per notice to help you track specific action items
            for each GST notice. You can create, assign, and manage tasks directly
            from the notice detail page.
          </p>

          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="font-medium mb-2">How to manage tasks:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Open a notice from the Notices page</li>
              <li>Navigate to the Tasks tab in the notice detail</li>
              <li>Click &quot;Add Task&quot; to create a new task</li>
              <li>Assign tasks to team members, set due dates, and track progress</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button asChild>
              <Link href="/notices">
                <FileText className="mr-2 h-4 w-4" />
                View Notices
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - Placeholder */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Tasks awaiting completion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Tasks past their due date
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Tasks completed recently
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Future: All Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Tasks created from notice details will appear here. Navigate to a
            notice and add tasks to get started.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/notices">Browse Notices</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
