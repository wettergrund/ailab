import OpenAI from "openai";
import { DecomposeRequest, DecomposeResponse } from "../types/decompose.types";
import { Subtask } from "../types/decompose.types";
import { DECOMPOSITION_PROMPTS } from "../prompts/decomposition_prompts";
import { hashString } from "../utils";

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export class OpenAIService {
  private client: OpenAI;
  private config: OpenAIConfig;
  private requestCount: number = 0;

  constructor(config: OpenAIConfig) {
    this.config = config;
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async decomposeTask(request: DecomposeRequest): Promise<DecomposeResponse> {
    this.requestCount++;

    const prompt = this.buildDecompositionPrompt(request);

    const completion = await this.client.chat.completions.create({
      model: this.config.model,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      messages: [
        { role: "system", content: DECOMPOSITION_PROMPTS.system_prompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);

    return {
      task_id: hashString(request.task_description),
      original_task: request.task_description,
      subtasks: this.normalizeSubtasks(parsed.subtasks ?? []),
      total_estimated_hours: parsed.total_estimated_hours ?? 0,
      required_skills: parsed.required_skills ?? [],
      decomposition_quality: parsed.decomposition_quality ?? "medium",
      notes: parsed.notes,
    };
  }

  private buildDecompositionPrompt(request: DecomposeRequest): string {
    const existingSubtasks = request.existing_subtasks
      .map((st) => `- ${st.title} (${st.estimated_hours}h, skills: ${st.required_skills.join(", ")})`)
      .join("\n");

    return DECOMPOSITION_PROMPTS.decomposition_template
      .replace("{task_description}", request.task_description)
      .replace("{context}", request.context ?? "")
      .replace("{max_subtasks}", String(request.max_subtasks))
      .replace("{target_hours_per_subtask}", String(request.target_hours_per_subtask))
      .replace("{existing_subtasks}", existingSubtasks || "None");
  }

  private normalizeSubtasks(rawSubtasks: unknown[]): Subtask[] {
    if (!Array.isArray(rawSubtasks)) return [];

    return rawSubtasks.map((st: unknown, index: number) => {
      const obj = st as Record<string, unknown>;
      return {
        id: (obj.id as string) ?? `subtask_${index}_${Date.now()}`,
        title: (obj.title as string) ?? `Subtask ${index + 1}`,
        description: (obj.description as string) ?? "",
        estimated_hours: typeof obj.estimated_hours === "number" ? obj.estimated_hours : 1,
        required_skills: Array.isArray(obj.required_skills) ? (obj.required_skills as string[]) : [],
        priority: (obj.priority as Subtask["priority"]) ?? "medium",
        dependencies: Array.isArray(obj.dependencies) ? (obj.dependencies as string[]) : [],
        deliverables: Array.isArray(obj.deliverables) ? (obj.deliverables as string[]) : [],
      };
    });
  }

  getRequestCount(): number {
    return this.requestCount;
  }

  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }
}