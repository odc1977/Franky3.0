/**
 * Franky 3.0 — Validator
 * Validates inputs and outputs between agents using Zod schemas.
 */

import { z } from "zod"

// ─── Schemas ─────────────────────────────────────────────

export const AgentMessageSchema = z.object({
	id: z.string().uuid(),
	from: z.string(),
	to: z.string(),
	content: z.string().min(1, "Message content cannot be empty"),
	metadata: z.record(z.unknown()).optional(),
	timestamp: z.string().datetime(),
})

export const AgentResponseSchema = z.object({
	messageId: z.string().uuid(),
	from: z.string(),
	status: z.enum(["success", "error", "declined"]),
	content: z.string(),
	metadata: z.record(z.unknown()).optional(),
	timestamp: z.string().datetime(),
})

export const CreateTaskSchema = z.object({
	title: z.string().min(1, "Task title cannot be empty").max(200, "Task title too long"),
	description: z.string().min(1, "Task description cannot be empty"),
	priority: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
	assignedAgents: z.array(z.string()).optional().default([]),
})

// ─── Inferred types ──────────────────────────────────────

export type ValidatedMessage = z.infer<typeof AgentMessageSchema>
export type ValidatedResponse = z.infer<typeof AgentResponseSchema>
export type ValidatedCreateTask = z.infer<typeof CreateTaskSchema>

// ─── Validator Service ───────────────────────────────────

export class Validator {
	/** Validate an agent message */
	validateMessage(data: unknown): { success: true; data: ValidatedMessage } | { success: false; error: string } {
		const result = AgentMessageSchema.safeParse(data)
		if (result.success) {
			return { success: true, data: result.data }
		}
		return {
			success: false,
			error: result.error.issues.map((i) => i.message).join("; "),
		}
	}

	/** Validate an agent response */
	validateResponse(data: unknown): { success: true; data: ValidatedResponse } | { success: false; error: string } {
		const result = AgentResponseSchema.safeParse(data)
		if (result.success) {
			return { success: true, data: result.data }
		}
		return {
			success: false,
			error: result.error.issues.map((i) => i.message).join("; "),
		}
	}

	/** Validate task creation input */
	validateCreateTask(
		data: unknown,
	): { success: true; data: ValidatedCreateTask } | { success: false; error: string } {
		const result = CreateTaskSchema.safeParse(data)
		if (result.success) {
			return { success: true, data: result.data }
		}
		return {
			success: false,
			error: result.error.issues.map((i) => i.message).join("; "),
		}
	}
}
