'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  UserPlus,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { SlaBadge, SlaProgress } from './sla-badge';
import { StageBadge } from './stage-badge';
import { WorkflowProgressTimeline, WorkflowProgressBar } from './workflow-progress';
import { WorkflowHistoryTimeline, CompactHistoryList } from './workflow-history';
import { TransitionDialog } from './transition-dialog';
import { AssignmentDialog } from './assignment-dialog';
import { WorkflowActions } from './workflow-actions';
import type {
  WorkflowInstance,
  WorkflowProgress,
  WorkflowHistory,
  WorkflowStage,
  SlaStatusDto,
} from '@/types/workflow';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface WorkflowPanelProps {
  noticeId: string;
  workflowInstance: WorkflowInstance | null;
  workflowProgress: WorkflowProgress | null;
  workflowHistory: WorkflowHistory[];
  slaStatus: SlaStatusDto | null;
  availableTransitions: WorkflowStage[];
  teamMembers: TeamMember[];
  onTransition: (targetStageKey: string, reason?: string) => Promise<void>;
  onAssign: (userId?: string, role?: string, reason?: string) => Promise<void>;
  onPause: (reason: string) => Promise<void>;
  onResume: (notes?: string) => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
  onStartWorkflow?: () => Promise<void>;
  isLoading?: boolean;
  isTransitioning?: boolean;
  className?: string;
}

export function WorkflowPanel({
  noticeId,
  workflowInstance,
  workflowProgress,
  workflowHistory,
  slaStatus,
  availableTransitions,
  teamMembers,
  onTransition,
  onAssign,
  onPause,
  onResume,
  onCancel,
  onStartWorkflow,
  isLoading = false,
  isTransitioning = false,
  className,
}: WorkflowPanelProps) {
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  if (isLoading) {
    return <WorkflowPanelSkeleton className={className} />;
  }

  // No workflow instance - show start workflow button
  if (!workflowInstance) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="h-5 w-5" />
            Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              No workflow has been started for this notice.
            </p>
            {onStartWorkflow && (
              <Button onClick={onStartWorkflow} disabled={isTransitioning}>
                Start Workflow
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCompleted = workflowInstance.status === 'completed';
  const isCancelled = workflowInstance.status === 'cancelled';
  const isPaused = workflowInstance.status === 'paused';
  const isActive = workflowInstance.status === 'active';

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="h-5 w-5" />
            Workflow
          </CardTitle>
          {isActive && (
            <WorkflowActions
              workflowStatus={workflowInstance.status}
              onPause={onPause}
              onResume={onResume}
              onCancel={onCancel}
              onTransition={() => setTransitionDialogOpen(true)}
              onAssign={() => setAssignmentDialogOpen(true)}
              isLoading={isTransitioning}
              variant="dropdown"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Stage & Status */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Stage</p>
            <StageBadge
              stageKey={workflowInstance.currentStageKey}
              stageName={workflowInstance.currentStageName}
            />
          </div>
          {slaStatus && !isCompleted && !isCancelled && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">SLA Status</p>
              <SlaBadge
                status={slaStatus.status}
                percentConsumed={slaStatus.percentConsumed}
                deadline={slaStatus.deadline}
                hoursRemaining={slaStatus.hoursRemaining}
                minutesRemaining={slaStatus.minutesRemaining}
                showDetails
              />
            </div>
          )}
        </div>

        {/* SLA Progress (for active workflows) */}
        {slaStatus && isActive && (
          <SlaProgress
            percentConsumed={slaStatus.percentConsumed}
            status={slaStatus.status}
          />
        )}

        {/* Workflow Progress Timeline */}
        {workflowProgress && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-3">Progress</p>
              <WorkflowProgressTimeline
                progress={workflowProgress}
                orientation="horizontal"
                compact
                showLabels={false}
              />
              <p className="text-xs text-muted-foreground text-center mt-2">
                {workflowProgress.completedStages} of {workflowProgress.totalStages} stages
                ({workflowProgress.progressPercent}%)
              </p>
            </div>
          </>
        )}

        {/* Assignment Info */}
        {(workflowInstance.assignedToName || workflowInstance.assignedRole) && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Assigned To</p>
                <p className="font-medium">
                  {workflowInstance.assignedToName || workflowInstance.assignedRole}
                </p>
              </div>
              {isActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAssignmentDialogOpen(true)}
                  disabled={isTransitioning}
                  aria-label="Reassign workflow"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </>
        )}

        {/* Quick Actions (for active workflows) */}
        {isActive && availableTransitions.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-3">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {availableTransitions.slice(0, 3).map((stage) => (
                  <Button
                    key={stage.stageKey}
                    variant="outline"
                    size="sm"
                    onClick={() => onTransition(stage.stageKey)}
                    disabled={isTransitioning}
                    className="gap-2"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {stage.name}
                  </Button>
                ))}
                {availableTransitions.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTransitionDialogOpen(true)}
                    disabled={isTransitioning}
                  >
                    More...
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Paused State Message */}
        {isPaused && (
          <>
            <Separator />
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Workflow Paused</p>
                <p className="text-sm text-yellow-600">
                  SLA timer is paused. Resume to continue processing.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResume()}
                disabled={isTransitioning}
                className="ml-auto"
              >
                Resume
              </Button>
            </div>
          </>
        )}

        {/* History */}
        {workflowHistory.length > 0 && (
          <>
            <Separator />
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto"
                onClick={() => setHistoryExpanded(!historyExpanded)}
                aria-expanded={historyExpanded}
                aria-label={historyExpanded ? 'Collapse recent activity' : 'Expand recent activity'}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <History className="h-4 w-4" aria-hidden="true" />
                  Recent Activity
                </span>
                {historyExpanded ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>

              {!historyExpanded && (
                <div className="mt-3">
                  <CompactHistoryList history={workflowHistory} limit={3} />
                </div>
              )}

              {historyExpanded && (
                <div className="mt-3">
                  <WorkflowHistoryTimeline
                    history={workflowHistory}
                    maxHeight="300px"
                    showActor
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Completed/Cancelled Status */}
        {(isCompleted || isCancelled) && (
          <>
            <Separator />
            <div
              className={cn(
                'p-3 rounded-lg text-center',
                isCompleted ? 'bg-green-50' : 'bg-gray-50'
              )}
            >
              <p
                className={cn(
                  'font-medium',
                  isCompleted ? 'text-green-800' : 'text-gray-800'
                )}
              >
                Workflow {isCompleted ? 'Completed' : 'Cancelled'}
              </p>
              {workflowInstance.completedAt && (
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(workflowInstance.completedAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Dialogs */}
      <TransitionDialog
        open={transitionDialogOpen}
        onOpenChange={setTransitionDialogOpen}
        workflowInstance={workflowInstance}
        availableTransitions={availableTransitions}
        onTransition={onTransition}
        isLoading={isTransitioning}
      />

      <AssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        currentAssigneeName={workflowInstance.assignedToName}
        currentAssignedRole={workflowInstance.assignedRole}
        teamMembers={teamMembers}
        onAssign={onAssign}
        isLoading={isTransitioning}
      />
    </Card>
  );
}

function WorkflowPanelSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="text-right">
            <Skeleton className="h-4 w-20 mb-2 ml-auto" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Skeleton className="h-2 w-full" />
        <Separator />
        <div className="flex justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
        <Separator />
        <div>
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { WorkflowPanelSkeleton };
