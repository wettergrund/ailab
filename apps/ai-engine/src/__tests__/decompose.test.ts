import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeTask } from '../decompose/task_analyzer';
import { generateSubtasks } from '../decompose/subtask_generator';

describe('decompose', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('analyzes a task and returns complexity', () => {
    const task = {
      task_description: 'Build a REST API with authentication and database',
      max_subtasks: 5,
      target_hours_per_subtask: 4,
    };
    const analyzed = analyzeTask(task as any);
    expect(analyzed.estimated_complexity.complexity_score).toBeGreaterThan(0);
    expect(analyzed.keywords.length).toBeGreaterThan(0);
  });

  it('generates subtasks from analyzed task', () => {
    const task = {
      task_description: 'Build a REST API with authentication and database',
      max_subtasks: 5,
      target_hours_per_subtask: 4,
    };
    const analyzed = analyzeTask(task as any);
    const result = generateSubtasks(analyzed, 5, 4);
    expect(result.subtasks.length).toBeGreaterThan(0);
    expect(result.total_hours).toBeGreaterThan(0);
  });

  it('generates subtasks for a valid analyzed task', () => {
    const analyzed = {
      title: 'Build REST API',
      description: 'Build a REST API with authentication and database',
      domain: ['backend'],
      keywords: ['api', 'database', 'auth'],
      estimated_complexity: { complexity_score: 50, estimated_hours: 20 },
      suggested_subtask_count: 5,
    };
    const result = generateSubtasks(analyzed as any, 5, 4);
    expect(result.subtasks.length).toBeGreaterThan(0);
    expect(result.quality).toBe('high');
  });
});
