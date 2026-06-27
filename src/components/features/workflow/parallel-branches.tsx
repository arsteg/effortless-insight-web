'use client';

import { cn } from '@/lib/utils';
import { GitBranch, GitMerge, Clock, Check, X, Pause, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import type {
  ParallelBranchStatus,
  BranchStatus,
  SynchronizationPoint,
  StageInstance,
  SlaStatus,
} from '@/types/workflow';
import { SLA_STATUS_COLORS, SLA_STATUS_LABELS } from '@/types/workflow';
import { formatDistanceToNow } from 'date-fns';

interface ParallelBranchesProps {
  status: ParallelBranchStatus;
  onCompleteBranch?: (branchId: string) => void;
  className?: string;
}

export function ParallelBranches({
  status,
  onCompleteBranch,
  className,
}: ParallelBranchesProps) {
  const {
    activeBranchCount,
    completedBranchCount,
    totalBranchCount,
    branches,
    nextSyncPoint,
  } = status;

  const progressPercent = totalBranchCount > 0
    ? Math.round((completedBranchCount / totalBranchCount) * 100)
    : 0;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Parallel Branches
          </CardTitle>
          <Badge variant="outline">
            {activeBranchCount} active / {totalBranchCount} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Branch Progress</span>
            <span className="font-medium">{completedBranchCount} of {totalBranchCount} completed</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Branch cards */}
        <div className="space-y-3">
          {branches.map((branch) => (
            <BranchCard
              key={branch.branchId}
              branch={branch}
              onComplete={onCompleteBranch}
            />
          ))}
        </div>

        {/* Sync point indicator */}
        {nextSyncPoint && (
          <SyncPointIndicator syncPoint={nextSyncPoint} />
        )}
      </CardContent>
    </Card>
  );
}

interface BranchCardProps {
  branch: BranchStatus;
  onComplete?: (branchId: string) => void;
}

function BranchCard({ branch, onComplete }: BranchCardProps) {
  const {
    branchId,
    currentStageKey,
    currentStageName,
    status,
    assignedToName,
    slaDeadline,
    slaStatus,
  } = branch;

  const StatusIcon = getStatusIcon(status);
  const statusColor = getStatusColor(status);

  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-lg border',
      status === 'active' ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full',
          statusColor
        )}>
          <StatusIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-sm">{currentStageName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {assignedToName && (
              <span className="text-xs text-muted-foreground">
                {assignedToName}
              </span>
            )}
            {slaDeadline && (
              <SlaStatusBadge status={slaStatus} deadline={slaDeadline} />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
        {status === 'active' && onComplete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onComplete(branchId)}
          >
            Complete
          </Button>
        )}
      </div>
    </div>
  );
}

interface SyncPointIndicatorProps {
  syncPoint: SynchronizationPoint;
}

function SyncPointIndicator({ syncPoint }: SyncPointIndicatorProps) {
  const {
    stageName,
    joinType,
    completedBranches,
    requiredBranches,
    isReady,
  } = syncPoint;

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border-2 border-dashed',
      isReady ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
    )}>
      <div className={cn(
        'flex items-center justify-center w-10 h-10 rounded-full',
        isReady ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
      )}>
        <GitMerge className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{stageName}</p>
          <Badge variant="secondary" className="text-xs">
            {joinType === 'all' ? 'Wait for all' : 'First to complete'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {completedBranches} of {requiredBranches} branches required
          {isReady && ' - Ready to proceed'}
        </p>
      </div>
      {isReady && (
        <Check className="h-5 w-5 text-green-600" />
      )}
    </div>
  );
}

interface SlaStatusBadgeProps {
  status: SlaStatus;
  deadline: string;
}

function SlaStatusBadge({ status, deadline }: SlaStatusBadgeProps) {
  const deadlineDate = new Date(deadline);
  const timeRemaining = formatDistanceToNow(deadlineDate, { addSuffix: true });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn('text-xs', SLA_STATUS_COLORS[status])}
        >
          <Clock className="h-3 w-3 mr-1" />
          {SLA_STATUS_LABELS[status]}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Deadline: {deadlineDate.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{timeRemaining}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'active':
      return Clock;
    case 'completed':
      return Check;
    case 'cancelled':
      return X;
    case 'paused':
      return Pause;
    case 'waiting_at_join':
      return AlertCircle;
    default:
      return Clock;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-600';
    case 'completed':
      return 'bg-green-100 text-green-600';
    case 'cancelled':
      return 'bg-red-100 text-red-600';
    case 'paused':
      return 'bg-yellow-100 text-yellow-600';
    case 'waiting_at_join':
      return 'bg-purple-100 text-purple-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

// Stage instance list for detailed view
interface StageInstanceListProps {
  instances: StageInstance[];
  onComplete?: (instanceId: string) => void;
  className?: string;
}

export function StageInstanceList({
  instances,
  onComplete,
  className,
}: StageInstanceListProps) {
  if (instances.length === 0) {
    return (
      <div className={cn('text-center py-4 text-muted-foreground', className)}>
        No active stage instances
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {instances.map((instance) => (
        <StageInstanceCard
          key={instance.id}
          instance={instance}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}

interface StageInstanceCardProps {
  instance: StageInstance;
  onComplete?: (instanceId: string) => void;
}

function StageInstanceCard({ instance, onComplete }: StageInstanceCardProps) {
  const {
    id,
    stageName,
    branchId,
    status,
    enteredAt,
    slaDeadline,
    slaStatus,
    slaPercentConsumed,
    assignedToName,
    allowedTransitions,
  } = instance;

  const StatusIcon = getStatusIcon(status);
  const statusColor = getStatusColor(status);
  const enteredDate = new Date(enteredAt);

  return (
    <Card className="p-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full',
            statusColor
          )}>
            <StatusIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{stageName}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {branchId && (
                <Badge variant="outline" className="text-xs">
                  <GitBranch className="h-3 w-3 mr-1" />
                  Branch
                </Badge>
              )}
              <span>Started {formatDistanceToNow(enteredDate, { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {slaDeadline && (
            <div className="text-right">
              <SlaStatusBadge status={slaStatus} deadline={slaDeadline} />
              <Progress value={slaPercentConsumed} className="h-1 w-20 mt-1" />
            </div>
          )}
          {status === 'active' && onComplete && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onComplete(id)}
            >
              Complete
            </Button>
          )}
        </div>
      </div>

      {assignedToName && (
        <p className="text-xs text-muted-foreground mt-2 ml-11">
          Assigned to: {assignedToName}
        </p>
      )}

      {allowedTransitions.length > 0 && (
        <div className="mt-2 ml-11">
          <p className="text-xs text-muted-foreground mb-1">Can transition to:</p>
          <div className="flex flex-wrap gap-1">
            {allowedTransitions.map((transition) => (
              <Badge key={transition} variant="secondary" className="text-xs">
                {transition}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
