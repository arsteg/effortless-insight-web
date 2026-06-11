'use client';

import { cn } from '@/lib/utils';
import {
  Inbox,
  Search,
  FileEdit,
  Eye,
  CheckCircle,
  Send,
  Clock,
  Check,
  Circle,
  type LucideIcon,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StageBadgeProps {
  stageKey: string;
  stageName: string;
  color?: string;
  icon?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Map stage keys to icons
const STAGE_ICONS: Record<string, LucideIcon> = {
  inbox: Inbox,
  search: Search,
  edit: FileEdit,
  eye: Eye,
  'check-circle': CheckCircle,
  send: Send,
  clock: Clock,
  check: Check,
  circle: Circle,
};

// Default colors for stages if not provided
const DEFAULT_STAGE_COLORS: Record<string, string> = {
  intake: '#3B82F6',
  analysis: '#8B5CF6',
  drafting: '#F59E0B',
  review: '#EC4899',
  approval: '#10B981',
  submission: '#06B6D4',
  awaiting: '#6B7280',
  closed: '#22C55E',
};

export function StageBadge({
  stageKey,
  stageName,
  color,
  icon,
  showTooltip = false,
  size = 'md',
  className,
}: StageBadgeProps) {
  const stageColor = color || DEFAULT_STAGE_COLORS[stageKey] || '#6B7280';
  const IconComponent = icon ? STAGE_ICONS[icon] || Circle : Circle;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  const badge = (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${stageColor}15`,
        color: stageColor,
        border: `1px solid ${stageColor}30`,
      }}
    >
      <IconComponent className={iconSizes[size]} />
      <span>{stageName}</span>
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="top">
        <p>Current Stage: {stageName}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface StageIndicatorProps {
  stageKey: string;
  color?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StageIndicator({
  stageKey,
  color,
  isActive = false,
  isCompleted = false,
  size = 'md',
  className,
}: StageIndicatorProps) {
  const stageColor = color || DEFAULT_STAGE_COLORS[stageKey] || '#6B7280';

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  if (isCompleted) {
    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          sizeClasses[size],
          className
        )}
        style={{ backgroundColor: stageColor }}
      >
        <Check className="h-2 w-2 text-white" />
      </div>
    );
  }

  if (isActive) {
    return (
      <div
        className={cn('rounded-full animate-pulse', sizeClasses[size], className)}
        style={{ backgroundColor: stageColor }}
      />
    );
  }

  return (
    <div
      className={cn('rounded-full border-2', sizeClasses[size], className)}
      style={{ borderColor: `${stageColor}50`, backgroundColor: `${stageColor}10` }}
    />
  );
}
