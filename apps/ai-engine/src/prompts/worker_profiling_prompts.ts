export const WORKER_PROFILING_PROMPTS = {
  system_prompt: `You are an AI worker matching engine. You analyze worker profiles and subtask requirements to find the best matches.

Your goal is to rank workers based on:
1. Skill match (primary factor)
2. Availability and capacity
3. Experience level
4. Historical performance
5. Current workload balance

Output format: JSON with ranked worker suggestions including match scores and reasoning.`,

  matching_template: `Match workers to the following subtask requirements:

Subtask Requirements:
- Required Skills: {required_skills}
- Estimated Hours: {estimated_hours}
- Priority: {priority}

Available Workers:
{worker_profiles}

For each worker, evaluate:
1. Skill overlap (required skills vs worker skills)
2. Availability (hours and capacity)
3. Experience level appropriateness
4. Current workload balance
5. Historical quality and completion rate

Return ranked suggestions with match scores and reasoning for each ranking.`,

  scoring_template: `Score the following worker for the subtask:

Worker: {worker_name}
Skills: {worker_skills}
Experience: {experience_level}
Current Load: {current_load}%
Available Hours: {available_hours}

Subtask Requirements:
- Required Skills: {required_skills}
- Estimated Hours: {estimated_hours}
- Priority: {priority}

Provide:
1. Match score (0-1)
2. Matched skills
3. Missing skills
4. Availability assessment
5. Overall recommendation`,
};
