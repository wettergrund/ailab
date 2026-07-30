import { ComplexityResult } from '../types/complexity.types';

export const complexityEstimator = {
  estimate(description: string, context: string = ''): ComplexityResult {
    const combined = `${description} ${context}`.toLowerCase();

    const breakdown = {
      scope: estimateScope(combined),
      technical_depth: estimateTechnicalDepth(combined),
      dependencies: estimateDependencies(combined),
      ambiguity: estimateAmbiguity(combined),
      effort: estimateEffort(combined),
    };

    const totalScore = Object.values(breakdown).reduce(
      (sum, val) => sum + val,
      0
    );
    const complexityScore = Math.min(100, Math.max(0, totalScore));

    const difficulty = getDifficulty(complexityScore);
    const estimatedHours = estimateHours(complexityScore, breakdown);
    const requiredSkillCount = estimateSkillCount(complexityScore, breakdown);
    const riskLevel = getRiskLevel(complexityScore, breakdown.ambiguity);

    return {
      complexity_score: complexityScore,
      difficulty,
      estimated_hours: estimatedHours,
      required_skill_count: requiredSkillCount,
      risk_level: riskLevel,
      breakdown,
    };
  },
};

function estimateScope(text: string): number {
  let score = 20;

  const scopeIndicators = {
    large: [
      'implement',
      'build',
      'create',
      'develop',
      'design',
      'architecture',
      'migrate',
      'rewrite',
    ],
    medium: ['add', 'update', 'modify', 'extend', 'integrate', 'refactor'],
    small: ['fix', 'patch', 'tweak', 'adjust', 'clean up'],
  };

  for (const word of scopeIndicators.large) {
    if (text.includes(word)) score += 15;
  }
  for (const word of scopeIndicators.medium) {
    if (text.includes(word)) score += 8;
  }
  for (const word of scopeIndicators.small) {
    if (text.includes(word)) score += 3;
  }

  const wordCount = text.split(/\s+/).length;
  if (wordCount > 200) score += 10;
  else if (wordCount > 50) score += 5;

  return Math.min(30, score);
}

function estimateTechnicalDepth(text: string): number {
  let score = 15;

  const depthIndicators = {
    advanced: [
      'algorithm',
      'optimization',
      'performance',
      'scalability',
      'distributed',
      'concurrency',
      'real-time',
      'streaming',
    ],
    intermediate: [
      'database',
      'api',
      'authentication',
      'authorization',
      'caching',
      'queue',
      'event',
    ],
    basic: ['form', 'button', 'style', 'layout', 'config'],
  };

  for (const word of depthIndicators.advanced) {
    if (text.includes(word)) score += 10;
  }
  for (const word of depthIndicators.intermediate) {
    if (text.includes(word)) score += 5;
  }
  for (const word of depthIndicators.basic) {
    if (text.includes(word)) score += 2;
  }

  return Math.min(25, score);
}

function estimateDependencies(text: string): number {
  let score = 10;

  const depIndicators = [
    'depends on',
    'requires',
    'needs',
    'after',
    'before',
    'blocked by',
    'integration with',
    'third-party',
    'external',
    'legacy',
  ];
  for (const indicator of depIndicators) {
    if (text.includes(indicator)) score += 4;
  }

  return Math.min(15, score);
}

function estimateAmbiguity(text: string): number {
  let score = 10;

  const ambiguityIndicators = [
    'as needed',
    'maybe',
    'could',
    'might',
    'sometime',
    'eventually',
    'TBD',
    'TBC',
    'to be determined',
    'flexible',
    'open-ended',
  ];
  for (const indicator of ambiguityIndicators) {
    if (text.includes(indicator)) score += 3;
  }

  return Math.min(15, score);
}

function estimateEffort(text: string): number {
  let score = 10;

  const effortIndicators = {
    high: [
      'all',
      'entire',
      'full',
      'complete',
      'comprehensive',
      'from scratch',
      'end-to-end',
      'whole system',
    ],
    medium: ['module', 'feature', 'section', 'part of', 'some'],
    low: ['small', 'minor', 'quick', 'simple', 'tiny'],
  };

  for (const word of effortIndicators.high) {
    if (text.includes(word)) score += 5;
  }
  for (const word of effortIndicators.medium) {
    if (text.includes(word)) score += 3;
  }
  for (const word of effortIndicators.low) {
    if (text.includes(word)) score -= 2;
  }

  return Math.min(15, Math.max(0, score));
}

function getDifficulty(score: number): ComplexityResult['difficulty'] {
  if (score < 20) return 'trivial';
  if (score < 40) return 'simple';
  if (score < 60) return 'moderate';
  if (score < 80) return 'complex';
  return 'extremely_complex';
}

function estimateHours(
  complexityScore: number,
  breakdown: Record<string, number>
): number {
  const baseHours = complexityScore * 0.15;
  const bonus = breakdown.dependencies * 0.5 + breakdown.ambiguity * 0.3;
  return Math.round((baseHours + bonus) * 10) / 10;
}

function estimateSkillCount(
  complexityScore: number,
  breakdown: Record<string, number>
): number {
  const base = Math.ceil(complexityScore / 20);
  const bonus = breakdown.technical_depth > 20 ? 1 : 0;
  return Math.max(1, base + bonus);
}

function getRiskLevel(
  complexityScore: number,
  ambiguity: number
): ComplexityResult['risk_level'] {
  if (complexityScore > 70 || ambiguity > 15) return 'high';
  if (complexityScore > 40 || ambiguity > 10) return 'medium';
  return 'low';
}
