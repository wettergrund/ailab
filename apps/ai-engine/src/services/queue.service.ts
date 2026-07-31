import Redis from "ioredis";

export interface QueueMessage {
  id: string;
  type: string;
  payload: unknown;
  priority: number;
  created_at: string;
  attempts: number;
  max_attempts: number;
}

export interface QueueConfig {
  redisUrl: string;
  prefix: string;
  defaultMaxAttempts: number;
  visibilityTimeout: number;
}

export class QueueService {
  private redis: Redis;
  private config: QueueConfig;

  constructor(config: QueueConfig) {
    this.config = config;
    this.redis = new Redis(config.redisUrl);
  }

  async enqueue(message: Omit<QueueMessage, "id" | "created_at" | "attempts">): Promise<string> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const fullMessage: QueueMessage = {
      id,
      ...message,
      created_at: new Date().toISOString(),
      attempts: 0,
    };

    const key = `${this.config.prefix}:queue`;
    const score = message.priority;
    await this.redis.zadd(key, score, JSON.stringify(fullMessage));

    return id;
  }

  async dequeue(queueName: string): Promise<QueueMessage | null> {
    const key = `${this.config.prefix}:${queueName}`;
    const now = Date.now();
    const minScore = 0;
    const maxScore = now + this.config.visibilityTimeout * 1000;

    const items = await this.redis.zrangebyscore(key, minScore, maxScore, "WITHSCORES", "LIMIT", 0, 1);

    if (items.length === 0) return null;

    const messageJson = items[0];
    const message = JSON.parse(messageJson) as QueueMessage;

    await this.redis.zrem(key, messageJson);

    const processingKey = `${this.config.prefix}:processing:${message.id}`;
    await this.redis.setex(processingKey, this.config.visibilityTimeout, messageJson);

    return message;
  }

  async acknowledge(messageId: string): Promise<void> {
    const processingKey = `${this.config.prefix}:processing:${messageId}`;
    await this.redis.del(processingKey);
  }

  async nack(messageId: string, requeue: boolean = true): Promise<void> {
    const processingKey = `${this.config.prefix}:processing:${messageId}`;
    const raw = await this.redis.get(processingKey);

    if (raw) {
      const message = JSON.parse(raw) as QueueMessage;
      await this.redis.del(processingKey);

      if (requeue && message.attempts < message.max_attempts) {
        message.attempts += 1;
        const key = `${this.config.prefix}:queue`;
        await this.redis.zadd(key, message.priority + message.attempts, JSON.stringify(message));
      }
    }
  }

  async getQueueLength(queueName: string): Promise<number> {
    const key = `${this.config.prefix}:${queueName}`;
    return this.redis.zcard(key);
  }

  async getProcessingCount(): Promise<number> {
    const pattern = `${this.config.prefix}:processing:*`;
    const keys = await this.redis.keys(pattern);
    return keys.length;
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}