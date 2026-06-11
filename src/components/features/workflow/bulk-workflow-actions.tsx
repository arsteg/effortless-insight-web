'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { WorkflowStage, BulkTransitionResult } from '@/types/workflow';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface BulkWorkflowActionsProps {
  selectedNoticeIds: string[];
  availableStages: WorkflowStage[];
  teamMembers: TeamMember[];
  onBulkTransition: (
    noticeIds: string[],
    targetStageKey: string,
    reason?: string
  ) => Promise<BulkTransitionResult>;
  onBulkAssign: (
    noticeIds: string[],
    userId?: string,
    role?: string,
    reason?: string
  ) => Promise<BulkTransitionResult>;
  isLoading?: boolean;
  maxBulkSize?: number;
}

const MAX_BULK_SIZE = 50;

export function BulkWorkflowActions({
  selectedNoticeIds,
  availableStages,
  teamMembers,
  onBulkTransition,
  onBulkAssign,
  isLoading = false,
  maxBulkSize = MAX_BULK_SIZE,
}: BulkWorkflowActionsProps) {
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const selectionCount = selectedNoticeIds.length;
  const isOverLimit = selectionCount > maxBulkSize;
  const hasSelection = selectionCount > 0;

  if (!hasSelection) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectionCount} selected
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setTransitionDialogOpen(true)}
        disabled={isLoading || isOverLimit}
      >
        <ArrowRight className="mr-2 h-4 w-4" />
        Bulk Transition
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setAssignDialogOpen(true)}
        disabled={isLoading || isOverLimit}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Bulk Assign
      </Button>

      {isOverLimit && (
        <span className="text-xs text-destructive">
          Max {maxBulkSize} notices
        </span>
      )}

      <BulkTransitionDialog
        open={transitionDialogOpen}
        onOpenChange={setTransitionDialogOpen}
        selectedCount={selectionCount}
        availableStages={availableStages}
        onConfirm={async (targetStageKey, reason) => {
          const result = await onBulkTransition(
            selectedNoticeIds,
            targetStageKey,
            reason
          );
          return result;
        }}
        isLoading={isLoading}
      />

      <BulkAssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        selectedCount={selectionCount}
        teamMembers={teamMembers}
        onConfirm={async (userId, role, reason) => {
          const result = await onBulkAssign(
            selectedNoticeIds,
            userId,
            role,
            reason
          );
          return result;
        }}
        isLoading={isLoading}
      />
    </div>
  );
}

// Bulk Transition Dialog
const bulkTransitionSchema = z.object({
  targetStageKey: z.string().min(1, 'Please select a target stage'),
  reason: z.string().max(500).optional(),
});

interface BulkTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  availableStages: WorkflowStage[];
  onConfirm: (targetStageKey: string, reason?: string) => Promise<BulkTransitionResult>;
  isLoading?: boolean;
}

function BulkTransitionDialog({
  open,
  onOpenChange,
  selectedCount,
  availableStages,
  onConfirm,
  isLoading,
}: BulkTransitionDialogProps) {
  const [result, setResult] = useState<BulkTransitionResult | null>(null);

  const form = useForm({
    resolver: zodResolver(bulkTransitionSchema),
    defaultValues: {
      targetStageKey: '',
      reason: '',
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setResult(null);
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (values: { targetStageKey: string; reason?: string }) => {
    const transitionResult = await onConfirm(values.targetStageKey, values.reason);
    setResult(transitionResult);

    if (transitionResult.failureCount === 0) {
      setTimeout(() => handleOpenChange(false), 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Stage Transition</DialogTitle>
          <DialogDescription>
            Transition {selectedCount} notices to a new workflow stage
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <BulkResultDisplay result={result} onClose={() => handleOpenChange(false)} />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="targetStageKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Stage</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableStages.map((stage) => (
                          <SelectItem key={stage.stageKey} value={stage.stageKey}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: stage.color }}
                              />
                              <span>{stage.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      All {selectedCount} notices will be transitioned to this stage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add notes for this bulk transition..."
                        rows={3}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Transition {selectedCount} Notices
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Bulk Assign Dialog
const bulkAssignSchema = z.object({
  assignmentType: z.enum(['user', 'role']),
  userId: z.string().optional(),
  role: z.string().optional(),
  reason: z.string().max(500).optional(),
});

interface BulkAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  teamMembers: TeamMember[];
  onConfirm: (
    userId?: string,
    role?: string,
    reason?: string
  ) => Promise<BulkTransitionResult>;
  isLoading?: boolean;
}

function BulkAssignDialog({
  open,
  onOpenChange,
  selectedCount,
  teamMembers,
  onConfirm,
  isLoading,
}: BulkAssignDialogProps) {
  const [result, setResult] = useState<BulkTransitionResult | null>(null);

  const form = useForm<z.infer<typeof bulkAssignSchema>>({
    resolver: zodResolver(bulkAssignSchema),
    defaultValues: {
      assignmentType: 'user',
      userId: '',
      role: '',
      reason: '',
    },
  });

  const assignmentType = form.watch('assignmentType');

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setResult(null);
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (values: {
    assignmentType: 'user' | 'role';
    userId?: string;
    role?: string;
    reason?: string;
  }) => {
    const userId = values.assignmentType === 'user' ? values.userId : undefined;
    const role = values.assignmentType === 'role' ? values.role : undefined;
    const assignResult = await onConfirm(userId, role, values.reason);
    setResult(assignResult);

    if (assignResult.failureCount === 0) {
      setTimeout(() => handleOpenChange(false), 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Assignment</DialogTitle>
          <DialogDescription>
            Assign {selectedCount} notices to a team member or role
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <BulkResultDisplay result={result} onClose={() => handleOpenChange(false)} />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="assignmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Specific User</SelectItem>
                        <SelectItem value="role">Role</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {assignmentType === 'user' && (
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Member</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {assignmentType === 'role' && (
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="ca">CA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add notes for this bulk assignment..."
                        rows={3}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Assign {selectedCount} Notices
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Bulk Result Display
interface BulkResultDisplayProps {
  result: BulkTransitionResult;
  onClose: () => void;
}

function BulkResultDisplay({ result, onClose }: BulkResultDisplayProps) {
  const hasFailures = result.failureCount > 0;

  return (
    <div className="space-y-4">
      <Alert variant={hasFailures ? 'destructive' : 'default'}>
        <AlertDescription>
          {hasFailures ? (
            <>
              <strong>{result.successCount}</strong> of {result.totalRequested} completed
              successfully. <strong>{result.failureCount}</strong> failed.
            </>
          ) : (
            <>
              All <strong>{result.successCount}</strong> operations completed successfully!
            </>
          )}
        </AlertDescription>
      </Alert>

      {hasFailures && result.results.filter((r) => !r.success).length > 0 && (
        <div className="max-h-32 overflow-y-auto text-sm">
          <p className="font-medium mb-2">Failed items:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {result.results
              .filter((r) => !r.success)
              .slice(0, 5)
              .map((r) => (
                <li key={r.noticeId}>{r.error || 'Unknown error'}</li>
              ))}
            {result.results.filter((r) => !r.success).length > 5 && (
              <li>...and {result.results.filter((r) => !r.success).length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </div>
  );
}
