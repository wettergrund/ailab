'use client';

import * as React from 'react';

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskResponse, UpdateTaskRequest } from '@repo/types';
import { taskApi } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  Clock,
  PlayCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface TaskBoardProps {
  tasks: TaskResponse[];
  onUpdate: () => void;
}

const statusColumns = [
  { key: 'open', label: 'Open', icon: PlayCircle },
  { key: 'assigned', label: 'Assigned', icon: ArrowRight },
  { key: 'in_progress', label: 'In Progress', icon: Clock },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

function SortableTaskCard({ task }: { task: TaskResponse }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(task.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-3 cursor-grab hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm">{task.title}</CardTitle>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription className="line-clamp-2">
            {task.description || 'No description'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{task.priority}</Badge>
            {task.estimatedHours && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimatedHours}h
              </span>
            )}
            {task.aiGenerated && (
              <Badge variant="secondary" className="text-xs">
                AI
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TaskBoard({ tasks, onUpdate }: TaskBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(_event: DragStartEvent) {
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const taskId = Number(active.id);
    const newStatus = over.id as string;

    const validStatuses = ['open', 'assigned', 'in_progress', 'completed'];
    if (!validStatuses.includes(newStatus)) return;

    try {
      await taskApi.update(taskId, {
        status: newStatus as UpdateTaskRequest['status'],
      });
      onUpdate();
    } catch {
      console.error('Failed to update task');
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statusColumns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.key);
          const Icon = column.icon;

          return (
            <div key={column.key} className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4" />
                <h3 className="font-semibold text-sm">{column.label}</h3>
                <Badge variant="secondary">{columnTasks.length}</Badge>
              </div>
              <SortableContext
                items={columnTasks.map((t) => String(t.id))}
                strategy={verticalListSortingStrategy}
              >
                <div className="min-h-[100px] space-y-2 rounded-lg border border-dashed p-2">
                  {columnTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tasks
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <SortableTaskCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}
