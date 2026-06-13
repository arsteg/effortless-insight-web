'use client'

import { useState } from 'react'
import { Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatAmount, getInvoiceStatusBadgeVariant } from '@/lib/api/billing'
import type { Invoice } from '@/types/billing'

interface BillingHistoryProps {
  invoices?: Invoice[]
  isLoading?: boolean
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onDownload?: (invoiceId: string) => void
  isDownloading?: boolean
}

export function BillingHistory({
  invoices,
  isLoading,
  page = 1,
  totalPages = 1,
  onPageChange,
  onDownload,
  isDownloading,
}: BillingHistoryProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownload = async (invoiceId: string) => {
    setDownloadingId(invoiceId)
    await onDownload?.(invoiceId)
    setDownloadingId(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No invoices yet</p>
            <p className="text-sm text-muted-foreground">
              Your invoices will appear here after your first payment
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>Your invoices and payment history</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                <TableCell>{formatAmount(invoice.total)}</TableCell>
                <TableCell>
                  <Badge variant={getInvoiceStatusBadgeVariant(invoice.status)}>
                    {formatStatus(invoice.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(invoice.id)}
                    disabled={isDownloading || downloadingId === invoice.id}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {downloadingId === invoice.id ? 'Downloading...' : 'PDF'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatStatus(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'pending':
      return 'Pending'
    case 'paid':
      return 'Paid'
    case 'void':
      return 'Void'
    case 'refunded':
      return 'Refunded'
    default:
      return status
  }
}
