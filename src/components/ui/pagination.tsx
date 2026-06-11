'use client'

import * as React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const range = React.useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 3 // siblings + current + first + last

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
      return [...leftRange, 'dots', totalPages]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      )
      return [1, 'dots', ...rightRange]
    }

    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    )
    return [1, 'dots', ...middleRange, 'dots', totalPages]
  }, [currentPage, totalPages, siblingCount])

  if (totalPages <= 1) return null

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('flex justify-center', className)}
    >
      <ul className="flex items-center gap-1">
        <li>
          <PaginationButton
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </PaginationButton>
        </li>
        <li>
          <PaginationButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationButton>
        </li>
        {range.map((page, index) => (
          <li key={index}>
            {page === 'dots' ? (
              <span className="flex h-9 w-9 items-center justify-center">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <PaginationButton
                onClick={() => onPageChange(page as number)}
                isActive={currentPage === page}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </PaginationButton>
            )}
          </li>
        ))}
        <li>
          <PaginationButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </PaginationButton>
        </li>
        <li>
          <PaginationButton
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </PaginationButton>
        </li>
      </ul>
    </nav>
  )
}

interface PaginationButtonProps extends ButtonProps {
  isActive?: boolean
}

function PaginationButton({
  isActive,
  className,
  ...props
}: PaginationButtonProps) {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="icon"
      className={cn('h-9 w-9', className)}
      {...props}
    />
  )
}

interface PaginationInfoProps {
  currentPage: number
  pageSize: number
  totalCount: number
  className?: string
}

export function PaginationInfo({
  currentPage,
  pageSize,
  totalCount,
  className,
}: PaginationInfoProps) {
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalCount)

  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      Showing <span className="font-medium">{start}</span> to{' '}
      <span className="font-medium">{end}</span> of{' '}
      <span className="font-medium">{totalCount}</span> results
    </p>
  )
}
