'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { taskApi } from '@/lib/api';
import type { TaskResponse } from '@repo/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, PlayCircle } from 'lucide-react';

interface WorkerProfilePageProps {
  params: { id: string };
}

export default function WorkerProfilePage({ params }: WorkerProfilePageProps) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await taskApi.list(undefined, Number(params.id));
        setTasks(res.data);
      } catch {
        console.error('Failed to load worker tasks');
      }
    }
    loadData();
  }, [params.id]);

  const workerId = Number(params.id);
  const assignedTasks = tasks.filter((t) => t.assigneeId === workerId);
  const completedTasks = assignedTasks.filter((t) => t.status === 'completed');
  const totalHours = assignedTasks.reduce(
    (sum, t) => sum + (t.actualHours || 0) + (t.estimatedHours || 0),
    0
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
          W{workerId}
        </div>
        <div>
          <h1 className="text-3xl font-bold">Worker #{workerId}</h1>
          <p className="text-muted-foreground">Profile &amp; task history</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedTasks.length}</div>
            <p className="text-xs text-muted-foreground">Total tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">Done</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Estimated + actual</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Assignments</CardTitle>
          <CardDescription>All tasks assigned to this worker</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Project #{task.projectId}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{task.status}</Badge>
                    <Badge variant="secondary">{task.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
