import { z } from "zod";
import { TaskStatus, TaskPriority, UserRole, BidStatus } from "../enums";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password_hash: z.string().min(60),
  role: z.enum(UserRole),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({ id: true, created_at: true, updated_at: true }).extend({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserSchema.partial().omit({ id: true, password_hash: true, created_at: true });

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
