export interface DecomposeRequest {
  task_description: string;
  max_subtasks?: number;
  target_hours_per_subtask?: number;
}

export interface MatchWorkerRequest {
  subtask_id: string;
  required_skills: string[];
  estimated_hours: number;
  max_results?: number;
}
