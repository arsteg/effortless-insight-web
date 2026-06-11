'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Pause,
  Play,
  XCircle,
  Loader2,
  MoreVertical,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { WorkflowInstanceStatus } from '@/types/workflow';

interface WorkflowActionsProps {
  workflowStatus: WorkflowInstanceStatus;
  onPause: (reason: string) => Promise<void>;
  onResume: (notes?: string) => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
  onTransition?: () => void;
  onAssign?: () => void;
  isLoading?: boolean;
  variant?: 'buttons' | 'dropdown';
}

export function WorkflowActions({
  workflowStatus,
  onPause,
  onResume,
  onCancel,
  onTransition,
  onAssign,
  isLoading = false,
  variant = 'buttons',
}: WorkflowActionsProps) {
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const canPause = workflowStatus === 'active';
  const canResume = workflowStatus === 'paused';
  const canCancel = workflowStatus === 'active' || workflowStatus === 'paused';

  if (variant === 'dropdown') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isLoading}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onTransition && workflowStatus === 'active' && (
              <DropdownMenuItem onClick={onTransition}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Transition Stage
              </DropdownMenuItem>
            )}
            {onAssign && (
              <DropdownMenuItem onClick={onAssign}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign
              </DropdownMenuItem>
            )}
            {(onTransition || onAssign) && <DropdownMenuSeparator />}
            {canPause && (
              <DropdownMenuItem onClick={() => setPauseDialogOpen(true)}>
                <Pause className="mr-2 h-4 w-4" />
                Pause Workflow
              </DropdownMenuItem>
            )}
            {canResume && (
              <DropdownMenuItem onClick={() => setResumeDialogOpen(true)}>
                <Play className="mr-2 h-4 w-4" />
                Resume Workflow
              </DropdownMenuItem>
            )}
            {canCancel && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setCancelDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Workflow
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <PauseDialog
          open={pauseDialogOpen}
          onOpenChange={setPauseDialogOpen}
          onConfirm={onPause}
          isLoading={isLoading}
        />
        <ResumeDialog
          open={resumeDialogOpen}
          onOpenChange={setResumeDialogOpen}
          onConfirm={onResume}
          isLoading={isLoading}
        />
        <CancelConfirmDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          onConfirm={onCancel}
          isLoading={isLoading}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {canPause && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPauseDialogOpen(true)}
            disabled={isLoading}
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
        )}
        {canResume && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResumeDialogOpen(true)}
            disabled={isLoading}
          >
            <Play className="mr-2 h-4 w-4" />
            Resume
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCancelDialogOpen(true)}
            disabled={isLoading}
            className="text-destructive hover:text-destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>

      <PauseDialog
        open={pauseDialogOpen}
        onOpenChange={setPauseDialogOpen}
        onConfirm={onPause}
        isLoading={isLoading}
      />
      <ResumeDialog
        open={resumeDialogOpen}
        onOpenChange={setResumeDialogOpen}
        onConfirm={onResume}
        isLoading={isLoading}
      />
      <CancelConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={onCancel}
        isLoading={isLoading}
      />
    </>
  );
}

// Pause Dialog
const pauseFormSchema = z.object({
  reason: z.string().min(1, 'Please provide a reason for pausing'),
});

interface PauseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

function PauseDialog({ open, onOpenChange, onConfirm, isLoading }: PauseDialogProps) {
  const form = useForm({
    resolver: zodResolver(pauseFormSchema),
    defaultValues: { reason: '' },
  });

  const handleSubmit = async (values: { reason: string }) => {
    await onConfirm(values.reason);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pause className="h-5 w-5" />
            Pause Workflow
          </DialogTitle>
          <DialogDescription>
            Pausing will stop the SLA timer. You can resume at any time.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Why is this workflow being paused?"
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
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pause Workflow
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Resume Dialog
const resumeFormSchema = z.object({
  notes: z.string().optional(),
});

interface ResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (notes?: string) => Promise<void>;
  isLoading?: boolean;
}

function ResumeDialog({ open, onOpenChange, onConfirm, isLoading }: ResumeDialogProps) {
  const form = useForm({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: { notes: '' },
  });

  const handleSubmit = async (values: { notes?: string }) => {
    await onConfirm(values.notes || undefined);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Resume Workflow
          </DialogTitle>
          <DialogDescription>
            The SLA timer will restart from the current position.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any notes about resuming..."
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
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resume Workflow
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Cancel Confirm Dialog
const cancelFormSchema = z.object({
  reason: z.string().min(1, 'Please provide a reason for cancellation'),
});

interface CancelConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

function CancelConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: CancelConfirmDialogProps) {
  const form = useForm({
    resolver: zodResolver(cancelFormSchema),
    defaultValues: { reason: '' },
  });

  const handleSubmit = async (values: { reason: string }) => {
    await onConfirm(values.reason);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Cancel Workflow
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The workflow will be permanently closed.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Cancellation</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Why is this workflow being cancelled?"
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
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Keep Workflow
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Workflow
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
