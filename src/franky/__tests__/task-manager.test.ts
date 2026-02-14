/**
 * Franky 3.0 — TaskManager Tests
 */

import { beforeEach, describe, expect, it } from "vitest"
import { TaskManager } from "../orchestrator/task-manager"

describe("TaskManager", () => {
	let tm: TaskManager

	beforeEach(() => {
		tm = new TaskManager()
	})

	it("should create a task with defaults", () => {
		const task = tm.createTask({ title: "Test Task", description: "A test" })
		expect(task.title).toBe("Test Task")
		expect(task.status).toBe("pending")
		expect(task.priority).toBe("medium")
		expect(task.assignedAgents).toEqual([])
		expect(task.id).toBeDefined()
	})

	it("should create a task with custom fields", () => {
		const task = tm.createTask({
			title: "Critical Fix",
			description: "Fix the bug",
			priority: "critical",
			assignedAgents: ["frontend", "testing"],
		})
		expect(task.priority).toBe("critical")
		expect(task.assignedAgents).toEqual(["frontend", "testing"])
	})

	it("should retrieve a task by ID", () => {
		const created = tm.createTask({ title: "Find Me", description: "Test" })
		const found = tm.getTask(created.id)
		expect(found).toBeDefined()
		expect(found?.title).toBe("Find Me")
	})

	it("should return undefined for unknown task", () => {
		expect(tm.getTask("nonexistent-id")).toBeUndefined()
	})

	it("should update task status", () => {
		const task = tm.createTask({ title: "T", description: "D" })
		expect(tm.updateStatus(task.id, "executing")).toBe(true)
		expect(tm.getTask(task.id)?.status).toBe("executing")
	})

	it("should set completedAt on terminal statuses", () => {
		const task = tm.createTask({ title: "T", description: "D" })
		tm.completeTask(task.id)
		expect(tm.getTask(task.id)?.completedAt).toBeDefined()
	})

	it("should fail task with error", () => {
		const task = tm.createTask({ title: "T", description: "D" })
		tm.failTask(task.id, "Boom!")
		const t = tm.getTask(task.id)
		expect(t?.status).toBe("failed")
		expect(t?.error).toBe("Boom!")
	})

	it("should count active tasks", () => {
		tm.createTask({ title: "A", description: "D" })
		tm.createTask({ title: "B", description: "D" })
		const c = tm.createTask({ title: "C", description: "D" })
		tm.completeTask(c.id)
		expect(tm.activeCount).toBe(2)
	})

	it("should filter tasks by status", () => {
		const a = tm.createTask({ title: "A", description: "D" })
		tm.createTask({ title: "B", description: "D" })
		tm.updateStatus(a.id, "executing")
		expect(tm.getTasksByStatus("executing").length).toBe(1)
		expect(tm.getTasksByStatus("pending").length).toBe(1)
	})

	it("should delete tasks", () => {
		const task = tm.createTask({ title: "T", description: "D" })
		expect(tm.deleteTask(task.id)).toBe(true)
		expect(tm.size).toBe(0)
	})

	it("should clear all tasks", () => {
		tm.createTask({ title: "A", description: "D" })
		tm.createTask({ title: "B", description: "D" })
		tm.clear()
		expect(tm.size).toBe(0)
	})
})
