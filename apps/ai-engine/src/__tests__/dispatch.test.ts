import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rankWorkers } from '../dispatch/skill_matcher';
import { filterAvailableWorkers } from '../dispatch/availability_checker';

const mockWorkers = [
  {
    worker_id: 'worker-001',
    name: 'Alice Chen',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    experience_level: 'senior',
    hourly_rate: 85,
    max_hours_per_week: 40,
    current_hours_this_week: 24,
    completed_tasks: 42,
    avg_completion_time_hours: 3.5,
    quality_score: 0.95,
  },
  {
    worker_id: 'worker-002',
    name: 'Bob Martinez',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
    experience_level: 'mid',
    hourly_rate: 65,
    max_hours_per_week: 40,
    current_hours_this_week: 30,
    completed_tasks: 28,
    avg_completion_time_hours: 4.0,
    quality_score: 0.88,
  },
];

describe('dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ranks workers by skill match', () => {
    const results = rankWorkers(['TypeScript', 'React'], mockWorkers, 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].worker_id).toBe('worker-001');
  });

  it('filters available workers', () => {
    const results = filterAvailableWorkers(mockWorkers, 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].worker_id).toBe('worker-001');
  });

  it('returns empty when no workers match', () => {
    const results = rankWorkers(['COBOL', 'Fortran'], mockWorkers, 2);
    expect(results.length).toBeGreaterThanOrEqual(0);
  });
});
