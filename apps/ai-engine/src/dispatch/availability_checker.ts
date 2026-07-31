import { WorkerAvailability, WorkerProfile } from '../types/worker.types';

export interface AvailabilityCheckResult {
  worker_id: string;
  is_available: boolean;
  available_hours: number;
  reason: string;
}

export function checkAvailability(
  worker: WorkerProfile,
  requiredHours: number,
  maxConcurrentTasks: number = 3
): AvailabilityCheckResult {
  const currentLoad =
    (worker.current_hours_this_week / worker.max_hours_per_week) * 100;
  const remainingHours =
    worker.max_hours_per_week - worker.current_hours_this_week;
  const isBelowMaxConcurrent = worker.completed_tasks < maxConcurrentTasks;

  let isAvailable = false;
  let reason = '';

  if (remainingHours < requiredHours) {
    isAvailable = false;
    reason = `Insufficient remaining hours (${remainingHours.toFixed(1)}h left, ${requiredHours}h needed)`;
  } else if (!isBelowMaxConcurrent) {
    isAvailable = false;
    reason = `At max concurrent task limit (${maxConcurrentTasks})`;
  } else if (currentLoad > 90) {
    isAvailable = false;
    reason = `Worker is at ${currentLoad.toFixed(0)}% capacity`;
  } else {
    isAvailable = true;
    reason = 'Worker is available';
  }

  return {
    worker_id: worker.worker_id,
    is_available: isAvailable,
    available_hours: Math.max(0, remainingHours),
    reason,
  };
}

export function filterAvailableWorkers(
  workers: WorkerProfile[],
  requiredHours: number,
  maxConcurrentTasks: number = 3
): WorkerAvailability[] {
  return workers.map((worker) => {
    const check = checkAvailability(worker, requiredHours, maxConcurrentTasks);
    return {
      worker_id: worker.worker_id,
      is_available: check.is_available,
      available_hours: check.available_hours,
      next_available_at: undefined,
      current_task_count: worker.completed_tasks,
      max_concurrent_tasks: maxConcurrentTasks,
    };
  });
}
