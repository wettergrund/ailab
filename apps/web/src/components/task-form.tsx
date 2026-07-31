'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { taskApi } from '@/lib/api';
import { aiApi } from '@/lib/api';
import { useState } from 'react';

const taskFormSchema = z.object({
  projectId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  estimatedHours: z.number().positive().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function TaskForm({ onClose, onSuccess }: TaskFormProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  async function handleAiAssist() {
    const description = watch('description');
    if (!description || description.length < 10) return;

    setAiLoading(true);
    try {
      const res = await aiApi.decompose(description, 3);
      if (res.data && res.data.subtasks) {
        const subtasks = res.data.subtasks
          .map((st: { title: string }) => st.title)
          .join('\n');
        setAiSuggestion(subtasks);
      }
    } catch (err) {
      console.error('AI assist failed:', err);
    } finally {
      setAiLoading(false);
    }
  }

  async function onSubmit(data: TaskFormValues) {
    try {
      await taskApi.create(data);
      onSuccess();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  }

  return (
    <Card className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm m-0">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader>
          <CardTitle>Submit New Task</CardTitle>
          <CardDescription>
            Create a new task with AI-assisted breakdown
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                type="number"
                {...register('projectId', { valueAsNumber: true })}
                required
              />
              {errors.projectId && (
                <p className="text-sm text-destructive">
                  {errors.projectId.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} required />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  onValueChange={(v) =>
                    setValue('priority', v as 'low' | 'medium' | 'high')
                  }
                  defaultValue="medium"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="estimatedHours">Est. Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.5"
                  min="0"
                  {...register('estimatedHours', { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>AI Assist</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAiAssist}
                  disabled={aiLoading || !watch('description')}
                >
                  {aiLoading ? 'Analyzing...' : 'Generate Breakdown'}
                </Button>
              </div>
              {aiSuggestion && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="font-medium mb-1">AI Suggested Subtasks:</p>
                  <pre className="whitespace-pre-wrap text-muted-foreground">
                    {aiSuggestion}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Card>
  );
}
