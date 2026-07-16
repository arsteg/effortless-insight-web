'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  FileText,
  CheckSquare,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDashboard } from '@/hooks/use-dashboard'
import { cn } from '@/lib/utils'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns'

type ViewMode = 'month' | 'week'
type ItemType = 'notice' | 'task'

interface Deadline {
  id: string
  noticeId: string
  noticeNumber: string
  title: string
  dueDate: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: string
  noticeType: string
  itemType: ItemType
}

interface TypeFilters {
  notices: boolean
  tasks: boolean
}

const FILTER_STORAGE_KEY = 'calendar-type-filters'

const priorityColors = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-green-500 text-white',
}

const priorityBorderColors = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
}

const typeColors = {
  notice: 'bg-blue-100 text-blue-800 border-blue-200',
  task: 'bg-purple-100 text-purple-800 border-purple-200',
}

const typeIcons = {
  notice: FileText,
  task: CheckSquare,
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Type filters with localStorage persistence
  const [typeFilters, setTypeFilters] = useState<TypeFilters>({
    notices: true,
    tasks: true,
  })

  // Load filter state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setTypeFilters({
          notices: parsed.notices ?? true,
          tasks: parsed.tasks ?? true,
        })
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, [])

  // Save filter state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(typeFilters))
  }, [typeFilters])

  const { data, isLoading } = useDashboard()

  // Transform dashboard deadlines into calendar events
  const allDeadlines: Deadline[] = useMemo(() => {
    if (!data?.deadlines?.next7Days) return []

    return data.deadlines.next7Days.map((d) => ({
      id: d.id,
      noticeId: d.noticeId || d.id,
      noticeNumber: d.noticeNumber || `#${(d.noticeId || d.id)?.slice(0, 8)}`,
      title: d.title || 'Deadline',
      dueDate: d.dueDate,
      priority: (d.priority as Deadline['priority']) || 'medium',
      status: d.isOverdue ? 'overdue' : 'pending',
      noticeType: d.type === 'task' ? 'Task' : 'GST Notice',
      itemType: d.type === 'task' ? 'task' : 'notice',
    }))
  }, [data?.deadlines?.next7Days])

  // Apply type filters
  const deadlines = useMemo(() => {
    return allDeadlines.filter((d) => {
      if (d.itemType === 'notice' && !typeFilters.notices) return false
      if (d.itemType === 'task' && !typeFilters.tasks) return false
      return true
    })
  }, [allDeadlines, typeFilters])

  // Count by type for legend
  const typeCounts = useMemo(() => {
    return {
      notices: allDeadlines.filter((d) => d.itemType === 'notice').length,
      tasks: allDeadlines.filter((d) => d.itemType === 'task').length,
    }
  }, [allDeadlines])

  // Get deadlines for a specific date
  const getDeadlinesForDate = (date: Date) => {
    return deadlines.filter(d => {
      const deadlineDate = parseISO(d.dueDate)
      return isSameDay(deadlineDate, date)
    })
  }

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = []
    let day = calendarStart

    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }, [currentDate])

  // Generate week days for week view
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate)
    const days = []

    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i))
    }

    return days
  }, [currentDate])

  const navigatePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, -7))
    }
  }

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, 7))
    }
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  const toggleFilter = (type: keyof TypeFilters) => {
    setTypeFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  // Get deadlines for selected date
  const selectedDateDeadlines = selectedDate ? getDeadlinesForDate(selectedDate) : []

  // Check if any filters are disabled
  const hasActiveFilters = !typeFilters.notices || !typeFilters.tasks

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-8 w-8" />
            Deadline Calendar
          </h1>
          <p className="text-muted-foreground">
            View and manage all your notice deadlines in calendar format.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(v: ViewMode) => setViewMode(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={navigateToday}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={navigatePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Active Filters Indicator */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Filtering: showing{' '}
                  {typeFilters.notices && typeFilters.tasks
                    ? 'all items'
                    : typeFilters.notices
                    ? 'notices only'
                    : typeFilters.tasks
                    ? 'tasks only'
                    : 'nothing'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-6 text-xs"
                  onClick={() => setTypeFilters({ notices: true, tasks: true })}
                >
                  Clear filters
                </Button>
              </div>
            )}

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px bg-muted rounded-t-lg overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="bg-background p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {viewMode === 'month' ? (
              <div className="grid grid-cols-7 gap-px bg-muted rounded-b-lg overflow-hidden">
                {calendarDays.map((day, idx) => {
                  const dayDeadlines = getDeadlinesForDate(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'bg-background min-h-[100px] p-2 cursor-pointer transition-colors hover:bg-muted/50',
                        !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                        isSelected && 'ring-2 ring-primary ring-inset',
                        isToday(day) && 'bg-primary/5'
                      )}
                    >
                      <div
                        className={cn(
                          'text-sm font-medium mb-1',
                          isToday(day) && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                        )}
                      >
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayDeadlines.slice(0, 3).map((deadline) => {
                          const TypeIcon = typeIcons[deadline.itemType]
                          return (
                            <div
                              key={deadline.id}
                              className={cn(
                                'text-xs p-1 rounded truncate border-l-2 flex items-center gap-1',
                                priorityBorderColors[deadline.priority]
                              )}
                            >
                              <TypeIcon className="h-3 w-3 shrink-0" />
                              <span className="truncate">{deadline.noticeNumber}</span>
                            </div>
                          )
                        })}
                        {dayDeadlines.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayDeadlines.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-px bg-muted rounded-b-lg overflow-hidden">
                {weekDays.map((day, idx) => {
                  const dayDeadlines = getDeadlinesForDate(day)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'bg-background min-h-[300px] p-2 cursor-pointer transition-colors hover:bg-muted/50',
                        isSelected && 'ring-2 ring-primary ring-inset',
                        isToday(day) && 'bg-primary/5'
                      )}
                    >
                      <div
                        className={cn(
                          'text-sm font-medium mb-2',
                          isToday(day) && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                        )}
                      >
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-2">
                        {dayDeadlines.map((deadline) => {
                          const TypeIcon = typeIcons[deadline.itemType]
                          return (
                            <Link
                              key={deadline.id}
                              href={`/notices/${deadline.noticeId}`}
                              className={cn(
                                'block text-xs p-2 rounded border-l-2 hover:bg-muted/50',
                                priorityBorderColors[deadline.priority]
                              )}
                            >
                              <div className="flex items-center gap-1 font-medium truncate">
                                <TypeIcon className="h-3 w-3 shrink-0" />
                                {deadline.noticeNumber}
                              </div>
                              <div className="text-muted-foreground truncate">{deadline.title}</div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar - Selected Date Details */}
        <div className="space-y-4">
          {/* Filter by Type */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter by Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notice Deadlines Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'p-1.5 rounded',
                    typeFilters.notices ? 'bg-blue-100' : 'bg-muted'
                  )}>
                    <FileText className={cn(
                      'h-4 w-4',
                      typeFilters.notices ? 'text-blue-600' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div>
                    <Label htmlFor="filter-notices" className="text-sm font-medium cursor-pointer">
                      Notice Deadlines
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {typeCounts.notices} item{typeCounts.notices !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {typeFilters.notices ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    id="filter-notices"
                    checked={typeFilters.notices}
                    onCheckedChange={() => toggleFilter('notices')}
                  />
                </div>
              </div>

              {/* Tasks Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'p-1.5 rounded',
                    typeFilters.tasks ? 'bg-purple-100' : 'bg-muted'
                  )}>
                    <CheckSquare className={cn(
                      'h-4 w-4',
                      typeFilters.tasks ? 'text-purple-600' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div>
                    <Label htmlFor="filter-tasks" className="text-sm font-medium cursor-pointer">
                      Tasks
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {typeCounts.tasks} item{typeCounts.tasks !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {typeFilters.tasks ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    id="filter-tasks"
                    checked={typeFilters.tasks}
                    onCheckedChange={() => toggleFilter('tasks')}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setTypeFilters({ notices: true, tasks: true })}
                  disabled={typeFilters.notices && typeFilters.tasks}
                >
                  Show All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setTypeFilters({ notices: false, tasks: false })}
                  disabled={!typeFilters.notices && !typeFilters.tasks}
                >
                  Hide All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Priority Legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Priority Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(priorityColors).map(([priority, color]) => (
                <div key={priority} className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded', color)} />
                  <span className="text-sm capitalize">{priority}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Date Deadlines */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {selectedDate ? format(selectedDate, 'EEEE, MMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateDeadlines.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateDeadlines.map((deadline) => {
                      const TypeIcon = typeIcons[deadline.itemType]
                      return (
                        <Link
                          key={deadline.id}
                          href={`/notices/${deadline.noticeId}`}
                          className={cn(
                            'block p-3 rounded-lg border border-l-4 hover:bg-muted/50 transition-colors',
                            priorityBorderColors[deadline.priority]
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-medium text-sm">
                                <TypeIcon className="h-3.5 w-3.5" />
                                {deadline.noticeNumber}
                              </div>
                              <div className="text-xs text-muted-foreground">{deadline.title}</div>
                              <Badge variant="outline" className={cn('text-xs', typeColors[deadline.itemType])}>
                                {deadline.noticeType}
                              </Badge>
                            </div>
                            <Badge variant="outline" className={cn('text-xs shrink-0', priorityColors[deadline.priority])}>
                              {deadline.priority}
                            </Badge>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {hasActiveFilters ? 'No items match your filters' : 'No deadlines on this date'}
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click on a date to see deadlines</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(priorityColors).map(([priority]) => {
                  const count = deadlines.filter(
                    (d) =>
                      d.priority === priority &&
                      isSameMonth(parseISO(d.dueDate), currentDate)
                  ).length
                  return (
                    <div key={priority} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{priority}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
