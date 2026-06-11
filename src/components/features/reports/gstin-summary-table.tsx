'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { GstinSummary } from '@/types'

interface GstinSummaryTableProps {
  data?: GstinSummary[]
  isLoading?: boolean
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function GstinSummaryTable({ data, isLoading }: GstinSummaryTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GSTIN Summary</CardTitle>
          <CardDescription>Breakdown by GST registration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GSTIN Summary</CardTitle>
          <CardDescription>Breakdown by GST registration</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No GSTIN data available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>GSTIN Summary</CardTitle>
        <CardDescription>Breakdown by GST registration</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GSTIN</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Active</TableHead>
              <TableHead className="text-right">Resolved</TableHead>
              <TableHead className="text-right">Pending Amount</TableHead>
              <TableHead className="text-right">Resolved Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.gstin}>
                <TableCell className="font-mono text-sm">{item.gstin}</TableCell>
                <TableCell>
                  <div>
                    <div>{item.stateName}</div>
                    {item.tradeName && (
                      <div className="text-xs text-muted-foreground">{item.tradeName}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{item.activeNotices}</TableCell>
                <TableCell className="text-right">{item.resolvedNotices}</TableCell>
                <TableCell className="text-right text-orange-600">
                  {formatCurrency(item.pendingAmount)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {formatCurrency(item.resolvedAmount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
