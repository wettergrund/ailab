import { DecomposeRequest } from "../types/decompose.types";
import { ComplexityResult } from "../types/complexity.types";
import { complexityEstimator } from "./complexity_estimator";

export interface AnalyzedTask {
  title: string;
  description: string;
  domain: string[];
  keywords: string[];
  estimated_complexity: ComplexityResult;
  suggested_subtask_count: number;
}

export function analyzeTask(request: DecomposeRequest): AnalyzedTask {
  const description = request.task_description;
  const context = request.context ?? "";

  const domain = extractDomain(description, context);
  const keywords = extractKeywords(description);
  const estimated_complexity = complexityEstimator.estimate(description, context);
  const suggested_subtask_count = calculateSubtaskCount(estimated_complexity, request.target_hours_per_subtask);

  return {
    title: extractTitle(description),
    description,
    domain,
    keywords,
    estimated_complexity,
    suggested_subtask_count,
  };
}

function extractTitle(description: string): string {
  const firstSentence = description.split(/[.!?]/)[0].trim();
  const words = firstSentence.split(/\s+/);
  if (words.length <= 10) {
    return firstSentence;
  }
  return words.slice(0, 10).join(" ") + "...";
}

function extractDomain(description: string, context: string): string[] {
  const combined = `${description} ${context}`.toLowerCase();
  const domains: string[] = [];

  const domainKeywords: Record<string, string[]> = {
    frontend: ["ui", "interface", "component", "react", "css", "html", "client", "browser", "responsive", "design"],
    backend: ["api", "server", "database", "endpoint", "route", "middleware", "auth", "service", "crud", "sql"],
    devops: ["deploy", "docker", "ci", "cd", "infrastructure", "terraform", "kubernetes", "nginx", "pipeline"],
    database: ["schema", "migration", "query", "table", "index", "postgres", "redis", "orm", "prisma", "drizzle"],
    testing: ["test", "unit", "integration", "e2e", "coverage", "jest", "vitest", "cypress", "playwright"],
    security: ["auth", "permission", "role", "encrypt", "hash", "token", "cors", "rate limit", "vulnerability"],
    performance: ["optimize", "cache", "lazy", "bundle", "compress", "cdn", "latency", "throughput"],
  };

  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some((kw) => combined.includes(kw))) {
      domains.push(domain);
    }
  }

  if (domains.length === 0) {
    domains.push("general");
  }

  return domains;
}

function extractKeywords(description: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may", "might", "shall", "can",
    "need", "dare", "ought", "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above", "below", "between", "under",
    "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all",
    "each", "every", "both", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
    "only", "own", "same", "so", "than", "too", "very", "just", "because", "but", "and", "or",
    "if", "while", "about", "up", "out", "off", "over", "under", "again", "further", "also",
  ]);

  const words = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

function calculateSubtaskCount(complexity: ComplexityResult, targetHours: number): number {
  const rawCount = complexity.estimated_hours / targetHours;
  return Math.max(1, Math.round(rawCount));
}
