'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

interface Deadline {
  id: string
  noticeId: string
  noticeNumber: string
  title: string
  dueDate: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: string
  noticeType: string
}

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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const { data, isLoading } = useDashboard()

  // Transform dashboard deadlines into calendar events
  const deadlines: Deadline[] = useMemo(() => {
    if (!data?.upcomingDeadlines) return []

    return data.upcomingDeadlines.map((d: any) => ({
      id: d.id,
      noticeId: d.noticeId,
      noticeNumber: d.noticeNumber || `#${d.noticeId?.slice(0, 8)}`,
      title: d.title || d.description || 'Notice Deadline',
      dueDate: d.dueDate || d.deadline,
      priority: d.priority || 'medium',
      status: d.status || 'pending',
      noticeType: d.noticeType || 'GST Notice',
    }))
  }, [data?.upcomingDeadlines])

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

  // Get deadlines for selected date
  const selectedDateDeadlines = selectedDate ? getDeadlinesForDate(selectedDate) : []

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
                        {dayDeadlines.slice(0, 3).map((deadline) => (
                          <div
                            key={deadline.id}
                            className={cn(
                              'text-xs p-1 rounded truncate border-l-2',
                              priorityBorderColors[deadline.priority]
                            )}
                          >
                            {deadline.noticeNumber}
                          </div>
                        ))}
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
                        {dayDeadlines.map((deadline) => (
                          <Link
                            key={deadline.id}
                            href={`/notices/${deadline.noticeId}`}
                            className={cn(
                              'block text-xs p-2 rounded border-l-2 hover:bg-muted/50',
                              priorityBorderColors[deadline.priority]
                            )}
                          >
                            <div className="font-medium truncate">{deadline.noticeNumber}</div>
                            <div className="text-muted-foreground truncate">{deadline.title}</div>
                          </Link>
                        ))}
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
          {/* Legend */}
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
                    {selectedDateDeadlines.map((deadline) => (
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
                            <div className="font-medium text-sm">{deadline.noticeNumber}</div>
                            <div className="text-xs text-muted-foreground">{deadline.title}</div>
                            <div className="text-xs text-muted-foreground">{deadline.noticeType}</div>
                          </div>
                          <Badge variant="outline" className={cn('text-xs', priorityColors[deadline.priority])}>
                            {deadline.priority}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No deadlines on this date</p>
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
