import { WorkerProfile } from "../types/worker.types";

export interface SkillMatchResult {
  worker_id: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  extra_skills: string[];
}

export function matchSkills(requiredSkills: string[], workers: WorkerProfile[]): SkillMatchResult[] {
  const required = requiredSkills.map((s) => s.toLowerCase());

  return workers
    .map((worker) => {
      const workerSkills = new Set(worker.skills.map((s) => s.toLowerCase()));
      const matched = required.filter((s) => workerSkills.has(s));
      const missing = required.filter((s) => !workerSkills.has(s));
      const extra = Array.from(workerSkills).filter((s) => !required.includes(s));

      const matchScore = required.length > 0 ? matched.length / required.length : 0;

      return {
        worker_id: worker.worker_id,
        match_score: Math.round(matchScore * 100) / 100,
        matched_skills: matched,
        missing_skills: missing,
        extra_skills: extra,
      };
    })
    .sort((a, b) => b.match_score - a.match_score);
}

export function rankWorkers(
  requiredSkills: string[],
  workers: WorkerProfile[],
  maxResults: number = 5
): SkillMatchResult[] {
  const matches = matchSkills(requiredSkills, workers);
  return matches.slice(0, maxResults);
}
