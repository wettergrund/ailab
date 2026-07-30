'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { taskApi } from '@/lib/api';
import type { TaskResponse } from '@repo/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { TaskBoard } from '@/components/task-board';
import { TaskForm } from '@/components/task-form';

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await taskApi.list();
      setTasks(res.data);
    } catch {
      console.error('Failed to load tasks');
    }
  }

  const availableTasks = tasks.filter((t) => t.status === 'open');
  const myTasks = tasks.filter(
    (t) => t.status === 'assigned' || t.status === 'in_progress'
  );
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Worker Dashboard</h1>
          <p className="text-muted-foreground">
            Available tasks and your assignments
          </p>
        </div>
        <Button onClick={() => setShowTaskForm(true)}>Submit Task</Button>
      </div>

      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => {
            setShowTaskForm(false);
            loadData();
          }}
        />
      )}

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableTasks.length}</div>
            <p className="text-xs text-muted-foreground">Tasks to claim</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              In progress or assigned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">Done this period</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Tasks</TabsTrigger>
          <TabsTrigger value="my-tasks">My Assignments</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="available">
          <TaskBoard tasks={availableTasks} onUpdate={loadData} />
        </TabsContent>
        <TabsContent value="my-tasks">
          <TaskBoard tasks={myTasks} onUpdate={loadData} />
        </TabsContent>
        <TabsContent value="completed">
          <TaskBoard tasks={completedTasks} onUpdate={loadData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
