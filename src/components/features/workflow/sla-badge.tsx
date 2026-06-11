'use client';

import { cn } from '@/lib/utils';
import { Clock, AlertTriangle, AlertCircle, CheckCircle, Pause } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { SlaStatus } from '@/types/workflow';

interface SlaBadgeProps {
  status: SlaStatus;
  percentConsumed: number;
  deadline?: string | null;
  hoursRemaining?: number | null;
  minutesRemaining?: number | null;
  showDetails?: boolean;
  className?: string;
}

const SLA_CONFIG: Record<SlaStatus, {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: React.ElementType;
}> = {
  on_track: {
    label: 'On Track',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-200',
    icon: CheckCircle,
  },
  warning: {
    label: 'Warning',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
    borderClass: 'border-yellow-200',
    icon: Clock,
  },
  at_risk: {
    label: 'At Risk',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-200',
    icon: AlertTriangle,
  },
  breached: {
    label: 'Breached',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
    icon: AlertCircle,
  },
  paused: {
    label: 'Paused',
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-200',
    icon: Pause,
  },
};

export function SlaBadge({
  status,
  percentConsumed,
  deadline,
  hoursRemaining,
  minutesRemaining,
  showDetails = false,
  className,
}: SlaBadgeProps) {
  const config = SLA_CONFIG[status];
  const Icon = config.icon;

  const formatTimeRemaining = () => {
    if (hoursRemaining === null || hoursRemaining === undefined) return null;
    if (hoursRemaining < 0) return 'Overdue';
    if (hoursRemaining === 0) {
      return minutesRemaining ? `${minutesRemaining}m remaining` : 'Due now';
    }
    if (hoursRemaining < 24) {
      return `${hoursRemaining}h ${minutesRemaining || 0}m remaining`;
    }
    const days = Math.floor(hoursRemaining / 24);
    const hours = hoursRemaining % 24;
    return `${days}d ${hours}h remaining`;
  };

  const formatDeadline = () => {
    if (!deadline) return null;
    return new Date(deadline).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const badge = (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium',
        config.bgClass,
        config.textClass,
        config.borderClass,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
      {showDetails && percentConsumed > 0 && (
        <span className="opacity-75">({percentConsumed}%)</span>
      )}
    </div>
  );

  const timeRemaining = formatTimeRemaining();
  const deadlineText = formatDeadline();

  if (!timeRemaining && !deadlineText) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1 text-sm">
          {timeRemaining && <p className="font-medium">{timeRemaining}</p>}
          {deadlineText && (
            <p className="text-muted-foreground">Deadline: {deadlineText}</p>
          )}
          <p className="text-muted-foreground">SLA consumed: {percentConsumed}%</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface SlaProgressProps {
  percentConsumed: number;
  status: SlaStatus;
  className?: string;
}

export function SlaProgress({ percentConsumed, status, className }: SlaProgressProps) {
  const getProgressColor = () => {
    switch (status) {
      case 'on_track':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'at_risk':
        return 'bg-orange-500';
      case 'breached':
        return 'bg-red-500';
      case 'paused':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const width = Math.min(percentConsumed, 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>SLA Progress</span>
        <span>{percentConsumed}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', getProgressColor())}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
