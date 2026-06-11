'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { StageBadge } from './stage-badge';
import type { WorkflowStage, WorkflowInstance } from '@/types/workflow';

const transitionFormSchema = z.object({
  targetStageKey: z.string().min(1, 'Please select a target stage'),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
});

type TransitionFormValues = z.infer<typeof transitionFormSchema>;

interface TransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowInstance: WorkflowInstance | null;
  availableTransitions: WorkflowStage[];
  onTransition: (targetStageKey: string, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export function TransitionDialog({
  open,
  onOpenChange,
  workflowInstance,
  availableTransitions,
  onTransition,
  isLoading = false,
}: TransitionDialogProps) {
  const [selectedStage, setSelectedStage] = useState<WorkflowStage | null>(null);

  const form = useForm<TransitionFormValues>({
    resolver: zodResolver(transitionFormSchema),
    defaultValues: {
      targetStageKey: '',
      reason: '',
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSelectedStage(null);
    }
    onOpenChange(newOpen);
  };

  const handleStageSelect = (stageKey: string) => {
    const stage = availableTransitions.find(s => s.stageKey === stageKey);
    setSelectedStage(stage || null);
    form.setValue('targetStageKey', stageKey);
  };

  const onSubmit = async (values: TransitionFormValues) => {
    await onTransition(values.targetStageKey, values.reason || undefined);
    handleOpenChange(false);
  };

  if (!workflowInstance) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transition to Next Stage</DialogTitle>
          <DialogDescription>
            Move this notice to a different workflow stage
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Stage Display */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Current Stage</p>
                <StageBadge
                  stageKey={workflowInstance.currentStageKey}
                  stageName={workflowInstance.currentStageName}
                />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Target Stage</p>
                {selectedStage ? (
                  <StageBadge
                    stageKey={selectedStage.stageKey}
                    stageName={selectedStage.name}
                    color={selectedStage.color}
                    icon={selectedStage.icon}
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">Select below</span>
                )}
              </div>
            </div>

            {/* Target Stage Selection */}
            <FormField
              control={form.control}
              name="targetStageKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Stage</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleStageSelect}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the next stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTransitions.map((stage) => (
                        <SelectItem key={stage.stageKey} value={stage.stageKey}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: stage.color }}
                            />
                            <span>{stage.name}</span>
                            {stage.slaHours && (
                              <span className="text-xs text-muted-foreground">
                                ({stage.slaHours}h SLA)
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Stage Description */}
            {selectedStage?.description && (
              <div className="p-3 bg-muted/30 rounded-md">
                <p className="text-sm text-muted-foreground">
                  {selectedStage.description}
                </p>
              </div>
            )}

            {/* Reason/Notes */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any notes about this transition..."
                      rows={3}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    These notes will be recorded in the workflow history
                  </FormDescription>
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
              <Button type="submit" disabled={isLoading || !form.formState.isValid}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Transition
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface QuickTransitionButtonsProps {
  availableTransitions: WorkflowStage[];
  onTransition: (targetStageKey: string) => void;
  isLoading?: boolean;
  size?: 'sm' | 'default';
}

export function QuickTransitionButtons({
  availableTransitions,
  onTransition,
  isLoading = false,
  size = 'default',
}: QuickTransitionButtonsProps) {
  if (availableTransitions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableTransitions.map((stage) => (
        <Button
          key={stage.stageKey}
          variant="outline"
          size={size}
          onClick={() => onTransition(stage.stageKey)}
          disabled={isLoading}
          className="gap-2"
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          {stage.name}
        </Button>
      ))}
    </div>
  );
}
