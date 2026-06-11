'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const assignmentFormSchema = z.object({
  assignmentType: z.enum(['user', 'role']),
  assignToUserId: z.string().optional(),
  assignToRole: z.string().optional(),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
}).refine(
  (data) => {
    if (data.assignmentType === 'user') {
      return !!data.assignToUserId;
    }
    if (data.assignmentType === 'role') {
      return !!data.assignToRole;
    }
    return false;
  },
  {
    message: 'Please select a user or role',
    path: ['assignToUserId'],
  }
);

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAssigneeName?: string | null;
  currentAssignedRole?: string | null;
  teamMembers: TeamMember[];
  availableRoles?: string[];
  onAssign: (userId?: string, role?: string, reason?: string) => Promise<void>;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

const DEFAULT_ROLES = ['admin', 'manager', 'member', 'ca', 'viewer'];

export function AssignmentDialog({
  open,
  onOpenChange,
  currentAssigneeName,
  currentAssignedRole,
  teamMembers,
  availableRoles = DEFAULT_ROLES,
  onAssign,
  isLoading = false,
  title = 'Assign Workflow',
  description = 'Assign this workflow to a team member or role',
}: AssignmentDialogProps) {
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      assignmentType: 'user',
      assignToUserId: '',
      assignToRole: '',
      reason: '',
    },
  });

  const assignmentType = form.watch('assignmentType');

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (values: AssignmentFormValues) => {
    const userId = values.assignmentType === 'user' ? values.assignToUserId : undefined;
    const role = values.assignmentType === 'role' ? values.assignToRole : undefined;
    await onAssign(userId, role, values.reason || undefined);
    handleOpenChange(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Current Assignment Display */}
        {(currentAssigneeName || currentAssignedRole) && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Currently Assigned To</p>
            <p className="font-medium">
              {currentAssigneeName || `Role: ${currentAssignedRole}`}
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs
              value={assignmentType}
              onValueChange={(value) =>
                form.setValue('assignmentType', value as 'user' | 'role')
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">Assign to User</TabsTrigger>
                <TabsTrigger value="role">Assign to Role</TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="mt-4">
                <FormField
                  control={form.control}
                  name="assignToUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Team Member</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a team member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(member.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span>{member.name}</span>
                                  <span className="text-muted-foreground text-xs ml-2">
                                    ({member.role})
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="role" className="mt-4">
                <FormField
                  control={form.control}
                  name="assignToRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              <span className="capitalize">{role}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Assignment will go to any member with this role
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

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
                      placeholder="Add any notes about this assignment..."
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
                Assign
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
