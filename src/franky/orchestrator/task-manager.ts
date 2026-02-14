/**
 * Franky 3.0 — TaskManager
 * Creates, tracks, and finalizes orchestrator tasks following the Txx lifecycle.
 */

import { randomUUID } from "crypto"

// ─── Task Types ──────────────────────────────────────────

export type TaskStatus = "pending" | "planning" | "executing" | "testing" | "completed" | "failed" | "cancelled"
export type TaskPriority = "low" | "medium" | "high" | "critical"

export interface OrchestratorTask {
	/** Unique task ID */
	readonly id: string
	/** Human-readable title */
	readonly title: string
	/** Description of what this task accomplishes */
	readonly description: string
	/** Current status */
	status: TaskStatus
	/** Priority level */
	readonly priority: TaskPriority
	/** Assigned agent types */
	readonly assignedAgents: readonly string[]
	/** Created timestamp */
	readonly createdAt: string
	/** Completed/failed timestamp */
	completedAt: string | null
	/** Error message if failed */
	error: string | null
}

export interface CreateTaskInput {
	title: string
	description: string
	priority?: TaskPriority
	assignedAgents?: string[]
}

// ─── TaskManager ─────────────────────────────────────────

export class TaskManager {
	private readonly tasks = new Map<string, OrchestratorTask>()

	/** Create a new task */
	createTask(input: CreateTaskInput): OrchestratorTask {
		const task: OrchestratorTask = {
			id: randomUUID(),
			title: input.title,
			description: input.description,
			status: "pending",
			priority: input.priority ?? "medium",
			assignedAgents: input.assignedAgents ?? [],
			createdAt: new Date().toISOString(),
			completedAt: null,
			error: null,
		}
		this.tasks.set(task.id, task)
		return task
	}

	/** Get a task by ID */
	getTask(id: string): OrchestratorTask | undefined {
		return this.tasks.get(id)
	}

	/** Get all tasks */
	getAllTasks(): OrchestratorTask[] {
		return Array.from(this.tasks.values())
	}

	/** Get tasks by status */
	getTasksByStatus(status: TaskStatus): OrchestratorTask[] {
		return this.getAllTasks().filter((t) => t.status === status)
	}

	/** Update task status */
	updateStatus(id: string, status: TaskStatus): boolean {
		const task = this.tasks.get(id)
		if (!task) return false
		task.status = status
		if (status === "completed" || status === "failed" || status === "cancelled") {
			task.completedAt = new Date().toISOString()
		}
		return true
	}

	/** Mark task as failed with error */
	failTask(id: string, error: string): boolean {
		const task = this.tasks.get(id)
		if (!task) return false
		task.status = "failed"
		task.error = error
		task.completedAt = new Date().toISOString()
		return true
	}

	/** Complete a task */
	completeTask(id: string): boolean {
		return this.updateStatus(id, "completed")
	}

	/** Delete a task */
	deleteTask(id: string): boolean {
		return this.tasks.delete(id)
	}

	/** Get count of active (non-completed) tasks */
	get activeCount(): number {
		return this.getAllTasks().filter(
			(t) => t.status !== "completed" && t.status !== "failed" && t.status !== "cancelled",
		).length
	}

	/** Get total task count */
	get size(): number {
		return this.tasks.size
	}

	/** Clear all tasks */
	clear(): void {
		this.tasks.clear()
	}
}
