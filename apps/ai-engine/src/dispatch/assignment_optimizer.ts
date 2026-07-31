import {
  WorkerProfile,
  WorkerAvailability,
  Assignment,
} from '../types/worker.types';

export interface OptimizationResult {
  assignments: Assignment[];
  unassigned_subtasks: string[];
  optimization_metrics: {
    average_match_score: number;
    total_hours_assigned: number;
    load_balance_score: number;
  };
}

export function optimizeAssignments(
  subtaskId: string,
  requiredSkills: string[],
  estimatedHours: number,
  priority: string,
  workers: WorkerProfile[],
  availabilities: WorkerAvailability[]
): OptimizationResult {
  const assignments: Assignment[] = [];
  const unassigned: string[] = [];

  const availableWorkers = workers.filter((w) => {
    const avail = availabilities.find((a) => a.worker_id === w.worker_id);
    return avail?.is_available ?? false;
  });

  if (availableWorkers.length === 0) {
    return {
      assignments: [],
      unassigned_subtasks: [subtaskId],
      optimization_metrics: {
        average_match_score: 0,
        total_hours_assigned: 0,
        load_balance_score: 0,
      },
    };
  }

  const scoredWorkers = availableWorkers.map((worker) => {
    const skillMatch = requiredSkills.filter((s) =>
      worker.skills.some((ws) => ws.toLowerCase() === s.toLowerCase())
    );
    const skillScore =
      requiredSkills.length > 0 ? skillMatch.length / requiredSkills.length : 0;
    const loadScore =
      1 - worker.current_hours_this_week / worker.max_hours_per_week;
    const experienceBonus =
      worker.experience_level === 'senior' || worker.experience_level === 'lead'
        ? 0.1
        : 0;
    const qualityBonus = worker.quality_score * 0.1;

    const totalScore = Math.min(
      1,
      skillScore * 0.5 + loadScore * 0.3 + experienceBonus + qualityBonus
    );

    return {
      worker,
      score: totalScore,
      skillScore,
      loadScore,
    };
  });

  scoredWorkers.sort((a, b) => b.score - a.score);

  const topWorker = scoredWorkers[0];
  const confidenceScore = topWorker.score;

  assignments.push({
    assignment_id: generateAssignmentId(),
    worker_id: topWorker.worker.worker_id,
    subtask_id: subtaskId,
    assigned_at: new Date().toISOString(),
    estimated_completion_at: new Date(
      Date.now() + estimatedHours * 3600000
    ).toISOString(),
    confidence_score: Math.round(confidenceScore * 100) / 100,
  });

  const avgMatchScore =
    scoredWorkers.reduce((sum, w) => sum + w.score, 0) / scoredWorkers.length;
  const totalHoursAssigned = assignments.reduce(
    (sum, _a) => sum + estimatedHours,
    0
  );
  const loadBalanceScore = calculateLoadBalance(workers);

  return {
    assignments,
    unassigned_subtasks: unassigned,
    optimization_metrics: {
      average_match_score: Math.round(avgMatchScore * 100) / 100,
      total_hours_assigned: totalHoursAssigned,
      load_balance_score: Math.round(loadBalanceScore * 100) / 100,
    },
  };
}

function calculateLoadBalance(workers: WorkerProfile[]): number {
  if (workers.length === 0) return 1;
  const loads = workers.map(
    (w) => w.current_hours_this_week / w.max_hours_per_week
  );
  const avgLoad = loads.reduce((sum, l) => sum + l, 0) / loads.length;
  const variance =
    loads.reduce((sum, l) => sum + Math.pow(l - avgLoad, 2), 0) / loads.length;
  return 1 - Math.min(1, variance * 10);
}

function generateAssignmentId(): string {
  return `assign_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
