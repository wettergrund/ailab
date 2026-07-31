import express, { Request, Response, Express } from 'express';
import { OpenAIService } from './services/openai.service';
import { QueueService } from './services/queue.service';
import { TaskQueue } from './services/task_queue';
import { analyzeTask } from './decompose/task_analyzer';
import { generateSubtasks } from './decompose/subtask_generator';
import { rankWorkers } from './dispatch/skill_matcher';
import { filterAvailableWorkers } from './dispatch/availability_checker';
import { DecomposeRequest, DecomposeResponse } from './types/decompose.types';
import {
  MatchWorkerRequest,
  MatchWorkerResponse,
} from './types/dispatch.types';
import { AIStatus } from './types/status.types';
import { WorkerProfile } from './types/worker.types';

const app: Express = express();
app.use(express.json());

const openai = new OpenAIService({
  apiKey: process.env.OPENAI_API_KEY ?? '',
  model: process.env.OPENAI_MODEL ?? 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4096,
});

const queue = new QueueService({
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  prefix: 'ai_engine',
  defaultMaxAttempts: 3,
  visibilityTimeout: 30,
});

const taskQueue = new TaskQueue(queue, openai);

const startTime = Date.now();
let totalDecompositions = 0;
let totalWorkerMatches = 0;

app.get('/api/ai/status', (_req: Request, res: Response) => {
  const status: AIStatus = {
    service: 'ai-engine',
    version: '0.1.0',
    status: 'healthy',
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    openai_configured: openai.isConfigured(),
    redis_configured: true,
    models: [process.env.OPENAI_MODEL ?? 'gpt-4o'],
    total_decompositions: totalDecompositions,
    total_worker_matches: totalWorkerMatches,
  };
  res.json(status);
});

app.post('/api/ai/decompose', async (req: Request, res: Response) => {
  try {
    const request = req.body as DecomposeRequest;

    const validation = validateDecomposeRequest(request);
    if (!validation.success) {
      res
        .status(400)
        .json({ error: 'Invalid request', details: validation.error });
      return;
    }

    const analyzedTask = analyzeTask(request);
    const generationResult = generateSubtasks(
      analyzedTask,
      request.max_subtasks,
      request.target_hours_per_subtask
    );

    const response: DecomposeResponse = {
      task_id: `task_${Date.now()}`,
      original_task: request.task_description,
      subtasks: generationResult.subtasks,
      total_estimated_hours: generationResult.total_hours,
      required_skills: extractRequiredSkills(generationResult.subtasks),
      decomposition_quality: generationResult.quality,
      notes: `Analyzed task with complexity score ${analyzedTask.estimated_complexity.complexity_score}`,
    };

    totalDecompositions++;
    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Decomposition failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post('/api/ai/match-worker', async (req: Request, res: Response) => {
  try {
    const request = req.body as MatchWorkerRequest;

    const validation = validateMatchWorkerRequest(request);
    if (!validation.success) {
      res
        .status(400)
        .json({ error: 'Invalid request', details: validation.error });
      return;
    }

    const workers = getMockWorkers();
    const skillMatches = rankWorkers(
      request.required_skills,
      workers,
      request.max_results
    );
    const availabilities = filterAvailableWorkers(
      workers,
      request.estimated_hours
    );

    const suggestions: MatchWorkerResponse['suggestions'] = skillMatches.map(
      (match) => {
        const worker = workers.find((w) => w.worker_id === match.worker_id);
        const availability = availabilities.find(
          (a) => a.worker_id === match.worker_id
        );
        return {
          worker_id: match.worker_id,
          name: worker?.name ?? 'Unknown',
          skills: worker?.skills ?? [],
          match_score: match.match_score,
          estimated_hours: request.estimated_hours,
          availability_status: availability?.is_available
            ? 'available'
            : availability && availability.available_hours > 0
              ? 'busy'
              : 'unavailable',
          current_load: worker
            ? (worker.current_hours_this_week / worker.max_hours_per_week) * 100
            : 0,
          reason:
            match.missing_skills.length > 0
              ? `Missing skills: ${match.missing_skills.join(', ')}`
              : 'Good skill match',
        };
      }
    );

    const response: MatchWorkerResponse = {
      subtask_id: request.subtask_id,
      suggestions,
      total_candidates: workers.length,
      match_strategy: 'skill-weighted with availability and load balancing',
    };

    totalWorkerMatches++;
    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Worker matching failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

function validateDecomposeRequest(request: unknown): {
  success: boolean;
  error?: string;
} {
  if (!request || typeof request !== 'object')
    return { success: false, error: 'Request body must be an object' };
  const req = request as Record<string, unknown>;
  if (
    typeof req.task_description !== 'string' ||
    req.task_description.length < 10
  ) {
    return {
      success: false,
      error: 'task_description must be at least 10 characters',
    };
  }
  return { success: true };
}

function validateMatchWorkerRequest(request: unknown): {
  success: boolean;
  error?: string;
} {
  if (!request || typeof request !== 'object')
    return { success: false, error: 'Request body must be an object' };
  const req = request as Record<string, unknown>;
  if (
    !Array.isArray(req.required_skills) ||
    (req.required_skills as unknown[]).length === 0
  ) {
    return {
      success: false,
      error: 'required_skills must be a non-empty array',
    };
  }
  if (typeof req.estimated_hours !== 'number' || req.estimated_hours <= 0) {
    return {
      success: false,
      error: 'estimated_hours must be a positive number',
    };
  }
  return { success: true };
}

function extractRequiredSkills(
  subtasks: { required_skills: string[] }[]
): string[] {
  const skills = new Set<string>();
  for (const st of subtasks) {
    for (const skill of st.required_skills) {
      skills.add(skill);
    }
  }
  return Array.from(skills);
}

function getMockWorkers(): WorkerProfile[] {
  return [
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
    {
      worker_id: 'worker-003',
      name: 'Carol Kim',
      skills: ['TypeScript', 'React', 'GraphQL', 'AWS', 'Terraform'],
      experience_level: 'lead',
      hourly_rate: 110,
      max_hours_per_week: 40,
      current_hours_this_week: 15,
      completed_tasks: 56,
      avg_completion_time_hours: 3.0,
      quality_score: 0.97,
    },
    {
      worker_id: 'worker-004',
      name: 'David Singh',
      skills: ['JavaScript', 'Node.js', 'MongoDB', 'Redis', 'Docker'],
      experience_level: 'mid',
      hourly_rate: 70,
      max_hours_per_week: 40,
      current_hours_this_week: 35,
      completed_tasks: 35,
      avg_completion_time_hours: 4.5,
      quality_score: 0.85,
    },
    {
      worker_id: 'worker-005',
      name: 'Eva Novak',
      skills: ['TypeScript', 'Next.js', 'PostgreSQL', 'Prisma', 'Docker'],
      experience_level: 'junior',
      hourly_rate: 55,
      max_hours_per_week: 40,
      current_hours_this_week: 10,
      completed_tasks: 18,
      avg_completion_time_hours: 5.0,
      quality_score: 0.82,
    },
  ];
}

const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.listen(PORT, () => {
  console.log(`AI Engine service running on port ${PORT}`);
});

export { app, openai };
