'use client';

import { cn, formatRelativeTime } from '@/lib/utils';
import {
  PlayCircle,
  ArrowRight,
  UserPlus,
  UserCheck,
  AlertTriangle,
  AlertCircle,
  Bell,
  MessageSquare,
  Paperclip,
  CalendarPlus,
  Pause,
  Play,
  CheckCircle2,
  XCircle,
  Zap,
  Bot,
  Mail,
  type LucideIcon,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { WorkflowHistory, WorkflowEventType } from '@/types/workflow';

interface WorkflowHistoryTimelineProps {
  history: WorkflowHistory[];
  maxHeight?: string;
  showActor?: boolean;
  className?: string;
}

const EVENT_CONFIG: Record<WorkflowEventType, {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
}> = {
  workflow_started: {
    icon: PlayCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Workflow Started',
  },
  stage_transition: {
    icon: ArrowRight,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Stage Transition',
  },
  assignment: {
    icon: UserPlus,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Assigned',
  },
  reassignment: {
    icon: UserCheck,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    label: 'Reassigned',
  },
  sla_warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'SLA Warning',
  },
  sla_breach: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'SLA Breached',
  },
  escalation: {
    icon: Bell,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Escalation',
  },
  comment_added: {
    icon: MessageSquare,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'Comment Added',
  },
  attachment_added: {
    icon: Paperclip,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'Attachment Added',
  },
  deadline_extended: {
    icon: CalendarPlus,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    label: 'Deadline Extended',
  },
  workflow_paused: {
    icon: Pause,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Workflow Paused',
  },
  workflow_resumed: {
    icon: Play,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Workflow Resumed',
  },
  workflow_completed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Workflow Completed',
  },
  workflow_cancelled: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Workflow Cancelled',
  },
  action_executed: {
    icon: Zap,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    label: 'Action Executed',
  },
  ai_analysis: {
    icon: Bot,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    label: 'AI Analysis',
  },
  notification_sent: {
    icon: Mail,
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
    label: 'Notification Sent',
  },
};

export function WorkflowHistoryTimeline({
  history,
  maxHeight = '400px',
  showActor = true,
  className,
}: WorkflowHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        No workflow history yet
      </div>
    );
  }

  return (
    <ScrollArea className={className} style={{ maxHeight }}>
      <div className="space-y-4 pr-4">
        {history.map((item, index) => (
          <HistoryItem
            key={item.id}
            item={item}
            isFirst={index === 0}
            isLast={index === history.length - 1}
            showActor={showActor}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

interface HistoryItemProps {
  item: WorkflowHistory;
  isFirst?: boolean;
  isLast?: boolean;
  showActor?: boolean;
}

function HistoryItem({ item, isFirst, isLast, showActor }: HistoryItemProps) {
  const config = EVENT_CONFIG[item.eventType] || {
    icon: Zap,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: item.eventType,
  };

  const Icon = config.icon;
  const actorName = item.performedByName || item.performedBySystem || 'System';
  const actorInitials = actorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return null;
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours}h ${mins}m`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  return (
    <div className="flex gap-3">
      {/* Icon */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            config.bgColor
          )}
        >
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">
              {item.description || config.label}
            </p>

            {/* Stage transition details */}
            {item.eventType === 'stage_transition' && item.fromStageKey && item.toStageKey && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {item.fromStageKey} → {item.toStageKey}
              </p>
            )}

            {/* Reason if provided */}
            {item.reason && (
              <p className="text-sm text-muted-foreground mt-1 italic">
                &ldquo;{item.reason}&rdquo;
              </p>
            )}

            {/* Time in stage */}
            {item.timeInStageMinutes !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                Time in stage: {formatDuration(item.timeInStageMinutes)}
              </p>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>

        {/* Actor */}
        {showActor && (
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px] bg-gray-100">
                {actorInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{actorName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface CompactHistoryListProps {
  history: WorkflowHistory[];
  limit?: number;
  className?: string;
}

export function CompactHistoryList({
  history,
  limit = 5,
  className,
}: CompactHistoryListProps) {
  const displayHistory = limit ? history.slice(0, limit) : history;

  if (displayHistory.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {displayHistory.map((item) => {
        const config = EVENT_CONFIG[item.eventType] || {
          icon: Zap,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: item.eventType,
        };
        const Icon = config.icon;

        return (
          <div key={item.id} className="flex items-center gap-2 text-sm">
            <Icon className={cn('h-3.5 w-3.5 flex-shrink-0', config.color)} />
            <span className="flex-1 truncate text-muted-foreground">
              {item.description || config.label}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
