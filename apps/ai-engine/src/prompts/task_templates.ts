export const TASK_TEMPLATES = {
  feature_development: `You are an AI task decomposition engine. Break down the following development task into implementable subtasks of 1-8 hours each.

Task: {task_description}

Context: {context}

Requirements:
- Each subtask must be implementable within 1-8 hours
- Subtasks should be ordered by dependency
- Include required skills for each subtask
- Estimate hours for each subtask
- Identify deliverables for each subtask

Return a structured decomposition with:
1. Subtask title and description
2. Estimated hours (1-8)
3. Required skills
4. Priority level
5. Dependencies on other subtasks
6. Expected deliverables`,

  bug_fix: `You are an AI task decomposition engine. Break down the following bug fix task into implementable subtasks of 1-8 hours each.

Bug Description: {task_description}

Context: {context}

Requirements:
- Each subtask must be implementable within 1-8 hours
- Include reproduction steps as a subtask if needed
- Prioritize root cause analysis
- Include testing and verification subtasks

Return a structured decomposition with subtasks, estimated hours, required skills, and priorities.`,

  refactoring: `You are an AI task decomposition engine. Break down the following refactoring task into implementable subtasks of 1-8 hours each.

Refactoring Task: {task_description}

Context: {context}

Requirements:
- Each subtask must be implementable within 1-8 hours
- Prioritize safety and backward compatibility
- Include testing subtasks to verify behavior is preserved
- Break down by module or component boundaries

Return a structured decomposition with subtasks, estimated hours, required skills, and priorities.`,

  infrastructure: `You are an AI task decomposition engine. Break down the following infrastructure task into implementable subtasks of 1-8 hours each.

Infrastructure Task: {task_description}

Context: {context}

Requirements:
- Each subtask must be implementable within 1-8 hours
- Include setup and configuration subtasks
- Prioritize idempotent and repeatable steps
- Include validation and verification subtasks

Return a structured decomposition with subtasks, estimated hours, required skills, and priorities.`,
};

export function getTaskTemplate(taskType: string): string {
  return TASK_TEMPLATES[taskType as keyof typeof TASK_TEMPLATES] ?? TASK_TEMPLATES.feature_development;
}
