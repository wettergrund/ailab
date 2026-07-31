import { Subtask } from '../types/decompose.types';
import { AnalyzedTask } from './task_analyzer';

function generateId(): string {
  return `subtask_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export interface SubtaskGenerationResult {
  subtasks: Subtask[];
  total_hours: number;
  quality: 'low' | 'medium' | 'high';
}

export function generateSubtasks(
  analyzedTask: AnalyzedTask,
  maxSubtasks: number,
  targetHoursPerSubtask: number
): SubtaskGenerationResult {
  const subtasks = buildSubtasks(
    analyzedTask,
    maxSubtasks,
    targetHoursPerSubtask
  );
  const totalHours = subtasks.reduce((sum, st) => sum + st.estimated_hours, 0);
  const quality = assessQuality(subtasks, analyzedTask);

  return {
    subtasks,
    total_hours: totalHours,
    quality,
  };
}

function buildSubtasks(
  analyzedTask: AnalyzedTask,
  maxSubtasks: number,
  targetHoursPerSubtask: number
): Subtask[] {
  const subtasks: Subtask[] = [];
  const domainHints = getDomainHints(analyzedTask.domain);
  const keywordHints = analyzedTask.keywords;

  const baseTitle = analyzedTask.title;
  const description = analyzedTask.description;

  const numSubtasks = Math.min(
    maxSubtasks,
    Math.max(
      1,
      Math.ceil(
        analyzedTask.estimated_complexity.estimated_hours /
          targetHoursPerSubtask
      )
    )
  );

  for (let i = 0; i < numSubtasks; i++) {
    const phase = getPhase(i, numSubtasks);
    const skillHints = getSkillHintsForPhase(phase, domainHints, keywordHints);
    const hours = estimateHoursForPhase(
      phase,
      analyzedTask.estimated_complexity
    );

    subtasks.push({
      id: generateId(),
      title: `${phaseLabel(phase)}: ${baseTitle}`,
      description: generateSubtaskDescription(phase, description, skillHints),
      estimated_hours: hours,
      required_skills: skillHints,
      priority: getPriorityForPhase(phase),
      dependencies: i > 0 ? [subtasks[i - 1].id] : [],
      deliverables: generateDeliverables(phase, skillHints),
    });
  }

  return subtasks;
}

type Phase = 'planning' | 'setup' | 'implementation' | 'review' | 'delivery';

function getPhase(index: number, total: number): Phase {
  if (total <= 1) return 'implementation';
  const ratio = index / total;
  if (ratio < 0.15) return 'planning';
  if (ratio < 0.3) return 'setup';
  if (ratio < 0.85) return 'implementation';
  if (ratio < 0.95) return 'review';
  return 'delivery';
}

function phaseLabel(phase: Phase): string {
  const labels: Record<Phase, string> = {
    planning: 'Planning',
    setup: 'Setup',
    implementation: 'Implementation',
    review: 'Review',
    delivery: 'Delivery',
  };
  return labels[phase];
}

function getDomainHints(domain: string[]): string[] {
  const hints: Record<string, string[]> = {
    frontend: [
      'React',
      'TypeScript',
      'CSS',
      'HTML',
      'responsive design',
      'component architecture',
    ],
    backend: [
      'Node.js',
      'TypeScript',
      'API design',
      'database queries',
      'authentication',
      'middleware',
    ],
    devops: [
      'Docker',
      'CI/CD',
      'infrastructure as code',
      'monitoring',
      'deployment',
      'networking',
    ],
    database: [
      'schema design',
      'migrations',
      'query optimization',
      'data modeling',
      'indexing',
    ],
    testing: [
      'unit testing',
      'integration testing',
      'test coverage',
      'test automation',
      'CI testing',
    ],
    security: [
      'authentication',
      'authorization',
      'encryption',
      'input validation',
      'secure coding',
    ],
    performance: [
      'caching',
      'lazy loading',
      'bundle optimization',
      'CDN',
      'query optimization',
    ],
  };

  const result: string[] = [];
  for (const d of domain) {
    if (hints[d]) {
      result.push(...hints[d]);
    }
  }
  return result;
}

function getSkillHintsForPhase(
  phase: Phase,
  domainHints: string[],
  keywords: string[]
): string[] {
  const phaseSkills: Record<Phase, string[]> = {
    planning: [
      'requirements analysis',
      'task breakdown',
      'estimation',
      'technical writing',
    ],
    setup: ['environment setup', 'configuration', ' scaffolding', 'tooling'],
    implementation: [
      'coding',
      'implementation',
      'problem solving',
      'debugging',
    ],
    review: ['code review', 'testing', 'quality assurance', 'documentation'],
    delivery: ['deployment', 'delivery', 'verification', 'handoff'],
  };

  const skills = new Set<string>(phaseSkills[phase]);
  for (const hint of domainHints) {
    skills.add(hint);
  }
  for (const kw of keywords) {
    skills.add(kw);
  }

  return Array.from(skills).slice(0, 6);
}

function estimateHoursForPhase(
  phase: Phase,
  complexity: { complexity_score: number; estimated_hours: number }
): number {
  const distribution: Record<Phase, number> = {
    planning: 0.05,
    setup: 0.1,
    implementation: 0.6,
    review: 0.15,
    delivery: 0.1,
  };

  const base = complexity.estimated_hours * distribution[phase];
  const variance = base * (complexity.complexity_score / 100) * 0.5;
  const hours = Math.round((base + variance) * 10) / 10;

  return Math.max(0.5, Math.min(8, hours));
}

function generateSubtaskDescription(
  phase: Phase,
  taskDescription: string,
  _skills: string[]
): string {
  const descriptions: Record<Phase, string> = {
    planning: `Analyze and plan the implementation approach for: ${taskDescription}. Break down requirements and identify dependencies.`,
    setup: `Set up the development environment, tooling, and configuration needed for: ${taskDescription}.`,
    implementation: `Implement the core functionality for: ${taskDescription}. Write clean, tested code following project conventions.`,
    review: `Review the implementation for: ${taskDescription}. Run tests, fix issues, and ensure quality standards are met.`,
    delivery: `Finalize and deliver: ${taskDescription}. Update documentation and verify all deliverables are complete.`,
  };
  return descriptions[phase];
}

function generateDeliverables(phase: Phase, _skills: string[]): string[] {
  const deliverables: Record<Phase, string[]> = {
    planning: ['Requirements document', 'Task breakdown', 'Estimation report'],
    setup: ['Config files', 'Environment setup', 'Scaffolded project'],
    implementation: ['Source code', 'Unit tests', 'Type definitions'],
    review: ['Test results', 'Code review notes', 'Updated docs'],
    delivery: ['Deployed artifact', 'Runbook', 'Handoff notes'],
  };
  return deliverables[phase];
}

function getPriorityForPhase(
  phase: Phase
): 'low' | 'medium' | 'high' | 'critical' {
  const priorities: Record<Phase, 'low' | 'medium' | 'high' | 'critical'> = {
    planning: 'low',
    setup: 'medium',
    implementation: 'high',
    review: 'medium',
    delivery: 'high',
  };
  return priorities[phase];
}

function assessQuality(
  subtasks: Subtask[],
  _analyzedTask: AnalyzedTask
): 'low' | 'medium' | 'high' {
  if (subtasks.length === 0) return 'low';

  const avgHours =
    subtasks.reduce((sum, st) => sum + st.estimated_hours, 0) / subtasks.length;
  const hasDependencies = subtasks.some(
    (st) => st.dependencies && st.dependencies.length > 0
  );
  const hasDeliverables = subtasks.some(
    (st) => st.deliverables && st.deliverables.length > 0
  );

  let score = 0;
  if (avgHours >= 1 && avgHours <= 8) score += 1;
  if (hasDependencies) score += 1;
  if (hasDeliverables) score += 1;
  if (subtasks.length >= 2) score += 1;
  if (subtasks.every((st) => st.required_skills.length > 0)) score += 1;

  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}
