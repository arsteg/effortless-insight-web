'use client';

import { cn } from '@/lib/utils';
import { Check, Clock, Circle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { WorkflowProgress, WorkflowStageInfo } from '@/types/workflow';

interface WorkflowProgressTimelineProps {
  progress: WorkflowProgress;
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showTime?: boolean;
  compact?: boolean;
  className?: string;
}

export function WorkflowProgressTimeline({
  progress,
  orientation = 'horizontal',
  showLabels = true,
  showTime = false,
  compact = false,
  className,
}: WorkflowProgressTimelineProps) {
  const { stages, currentStageKey, progressPercent } = progress;

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col', className)}>
        {stages.map((stage, index) => (
          <VerticalStageItem
            key={stage.stageKey}
            stage={stage}
            isLast={index === stages.length - 1}
            showTime={showTime}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar */}
      <div className="relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stage indicators */}
        <div className="relative flex justify-between">
          {stages.map((stage) => (
            <HorizontalStageItem
              key={stage.stageKey}
              stage={stage}
              showLabel={showLabels}
              compact={compact}
            />
          ))}
        </div>
      </div>

      {/* Progress text */}
      {!compact && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {progress.completedStages} of {progress.totalStages} stages completed ({progressPercent}%)
        </div>
      )}
    </div>
  );
}

interface HorizontalStageItemProps {
  stage: WorkflowStageInfo;
  showLabel?: boolean;
  compact?: boolean;
}

function HorizontalStageItem({ stage, showLabel = true, compact = false }: HorizontalStageItemProps) {
  const { stageKey, name, color, isCurrentStage, isCompleted } = stage;

  const indicator = (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'relative z-10 flex items-center justify-center rounded-full border-2 transition-all',
          compact ? 'h-6 w-6' : 'h-8 w-8',
          isCompleted
            ? 'border-transparent'
            : isCurrentStage
            ? 'border-current animate-pulse'
            : 'border-gray-300 bg-white'
        )}
        style={{
          backgroundColor: isCompleted ? color : isCurrentStage ? `${color}20` : undefined,
          color: isCurrentStage ? color : undefined,
        }}
      >
        {isCompleted ? (
          <Check className={cn('text-white', compact ? 'h-3 w-3' : 'h-4 w-4')} />
        ) : isCurrentStage ? (
          <Circle
            className={cn(compact ? 'h-2 w-2' : 'h-3 w-3')}
            fill="currentColor"
          />
        ) : (
          <Circle className={cn('text-gray-300', compact ? 'h-2 w-2' : 'h-3 w-3')} />
        )}
      </div>

      {showLabel && (
        <span
          className={cn(
            'mt-2 text-center max-w-[80px] truncate',
            compact ? 'text-xs' : 'text-sm',
            isCurrentStage ? 'font-medium text-foreground' : 'text-muted-foreground'
          )}
        >
          {name}
        </span>
      )}
    </div>
  );

  if (compact && !showLabel) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{indicator}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{name}</p>
          {isCurrentStage && <p className="text-xs text-muted-foreground">Current stage</p>}
          {isCompleted && <p className="text-xs text-muted-foreground">Completed</p>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return indicator;
}

interface VerticalStageItemProps {
  stage: WorkflowStageInfo;
  isLast?: boolean;
  showTime?: boolean;
}

function VerticalStageItem({ stage, isLast = false, showTime = false }: VerticalStageItemProps) {
  const { name, color, isCurrentStage, isCompleted, enteredAt, exitedAt, timeInStageMinutes } = stage;

  const formatTime = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours}h ${mins}m`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  return (
    <div className="flex gap-4">
      {/* Indicator and line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
            isCompleted
              ? 'border-transparent'
              : isCurrentStage
              ? 'border-current animate-pulse'
              : 'border-gray-300 bg-white'
          )}
          style={{
            backgroundColor: isCompleted ? color : isCurrentStage ? `${color}20` : undefined,
            color: isCurrentStage ? color : undefined,
          }}
        >
          {isCompleted ? (
            <Check className="h-4 w-4 text-white" />
          ) : isCurrentStage ? (
            <Clock className="h-4 w-4" />
          ) : (
            <Circle className="h-3 w-3 text-gray-300" />
          )}
        </div>

        {!isLast && (
          <div
            className={cn(
              'w-0.5 flex-1 min-h-[24px]',
              isCompleted ? 'bg-primary' : 'bg-gray-200'
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className={cn('pb-6', isLast && 'pb-0')}>
        <p
          className={cn(
            'font-medium',
            isCurrentStage ? 'text-foreground' : isCompleted ? 'text-muted-foreground' : 'text-gray-400'
          )}
        >
          {name}
          {isCurrentStage && (
            <span className="ml-2 text-xs font-normal text-primary">(Current)</span>
          )}
        </p>

        {showTime && (enteredAt || timeInStageMinutes !== null) && (
          <div className="mt-1 text-xs text-muted-foreground">
            {enteredAt && <p>Started: {formatTime(enteredAt)}</p>}
            {exitedAt && <p>Completed: {formatTime(exitedAt)}</p>}
            {timeInStageMinutes !== null && (
              <p>Duration: {formatDuration(timeInStageMinutes)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface WorkflowProgressBarProps {
  progress: WorkflowProgress;
  showLabel?: boolean;
  className?: string;
}

export function WorkflowProgressBar({
  progress,
  showLabel = true,
  className,
}: WorkflowProgressBarProps) {
  const { completedStages, totalStages, progressPercent, currentStageKey } = progress;
  const currentStage = progress.stages.find(s => s.stageKey === currentStageKey);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-muted-foreground">
            Stage {completedStages + 1} of {totalStages}
          </span>
          {currentStage && (
            <span className="font-medium" style={{ color: currentStage.color }}>
              {currentStage.name}
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: currentStage?.color || 'var(--primary)',
          }}
        />
      </div>
    </div>
  );
}
