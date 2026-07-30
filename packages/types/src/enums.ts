export const TaskStatus = ["open", "claimed", "in_progress", "in_review", "completed", "failed"] as const;
export type TaskStatus = (typeof TaskStatus)[number];

export const TaskPriority = ["low", "medium", "high", "critical"] as const;
export type TaskPriority = (typeof TaskPriority)[number];

export const UserRole = ["client", "worker", "admin"] as const;
export type UserRole = (typeof UserRole)[number];

export const ProjectStatus = ["draft", "active", "paused", "completed", "cancelled"] as const;
export type ProjectStatus = (typeof ProjectStatus)[number];

export const BillingStatus = ["pending", "processing", "succeeded", "failed", "refunded"] as const;
export type BillingStatus = (typeof BillingStatus)[number];

export const BidStatus = ["pending", "accepted", "rejected", "withdrawn"] as const;
export type BidStatus = (typeof BidStatus)[number];

export const PaymentMethod = ["card", "bank_transfer", "escrow", "crypto"] as const;
export type PaymentMethod = (typeof PaymentMethod)[number];
