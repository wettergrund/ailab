import { DecomposeRequest, MatchWorkerRequest } from '@repo/types';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:3001';

export async function decomposeTask(data: DecomposeRequest): Promise<unknown> {
  const response = await fetch(`${AI_ENGINE_URL}/api/ai/decompose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'AI decompose failed');
  }
  return response.json();
}

export async function matchWorker(data: MatchWorkerRequest): Promise<unknown> {
  const response = await fetch(`${AI_ENGINE_URL}/api/ai/match-worker`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'AI match-worker failed');
  }
  return response.json();
}
