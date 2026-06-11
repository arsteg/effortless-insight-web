'use client'

import { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { NoticeFilters as NoticeFiltersType, NoticeStatus, NoticePriority } from '@/types'

interface NoticeFiltersProps {
  filters: NoticeFiltersType
  onFiltersChange: (filters: NoticeFiltersType) => void
  isLoading?: boolean
}

const STATUS_OPTIONS: { value: NoticeStatus; label: string }[] = [
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'processing', label: 'Processing' },
  { value: 'analyzed', label: 'Analyzed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'responded', label: 'Responded' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
  { value: 'failed', label: 'Failed' },
]

const PRIORITY_OPTIONS: { value: NoticePriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export function NoticeFilters({
  filters,
  onFiltersChange,
  isLoading = false,
}: NoticeFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: searchValue || undefined, page: 1 })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as NoticeStatus),
      page: 1,
    })
  }

  const handlePriorityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priority: value === 'all' ? undefined : (value as NoticePriority),
      page: 1,
    })
  }

  const clearFilters = () => {
    setSearchValue('')
    onFiltersChange({ page: 1, pageSize: filters.pageSize })
  }

  const activeFilterCount = [
    filters.status,
    filters.priority,
    filters.search,
    filters.noticeType,
    filters.gstin,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notices by number, GSTIN, or type..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 pr-4"
              disabled={isLoading}
            />
          </div>
        </form>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority || 'all'}
          onValueChange={handlePriorityChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full md:w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {PRIORITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Clear
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <FilterTag
              label={`Search: "${filters.search}"`}
              onRemove={() => {
                setSearchValue('')
                onFiltersChange({ ...filters, search: undefined, page: 1 })
              }}
            />
          )}
          {filters.status && (
            <FilterTag
              label={`Status: ${STATUS_OPTIONS.find((o) => o.value === filters.status)?.label}`}
              onRemove={() => onFiltersChange({ ...filters, status: undefined, page: 1 })}
            />
          )}
          {filters.priority && (
            <FilterTag
              label={`Priority: ${PRIORITY_OPTIONS.find((o) => o.value === filters.priority)?.label}`}
              onRemove={() => onFiltersChange({ ...filters, priority: undefined, page: 1 })}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface FilterTagProps {
  label: string
  onRemove: () => void
}

function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <Badge variant="secondary" className="gap-1 pl-2 pr-1">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 rounded-full p-0.5 hover:bg-muted"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}
