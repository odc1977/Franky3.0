/**
 * Franky 3.0 — Validator Tests
 */

import { randomUUID } from "crypto"
import { describe, expect, it } from "vitest"
import { Validator } from "../orchestrator/validator"

describe("Validator", () => {
	const validator = new Validator()

	describe("validateMessage", () => {
		it("should accept a valid message", () => {
			const result = validator.validateMessage({
				id: randomUUID(),
				from: "user",
				to: "frontend",
				content: "Hello",
				timestamp: new Date().toISOString(),
			})
			expect(result.success).toBe(true)
		})

		it("should reject empty content", () => {
			const result = validator.validateMessage({
				id: randomUUID(),
				from: "user",
				to: "frontend",
				content: "",
				timestamp: new Date().toISOString(),
			})
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error).toContain("empty")
			}
		})

		it("should reject invalid UUID", () => {
			const result = validator.validateMessage({
				id: "not-a-uuid",
				from: "user",
				to: "frontend",
				content: "Hello",
				timestamp: new Date().toISOString(),
			})
			expect(result.success).toBe(false)
		})
	})

	describe("validateCreateTask", () => {
		it("should accept valid task input", () => {
			const result = validator.validateCreateTask({
				title: "My Task",
				description: "Do something",
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.priority).toBe("medium") // default
			}
		})

		it("should reject empty title", () => {
			const result = validator.validateCreateTask({
				title: "",
				description: "D",
			})
			expect(result.success).toBe(false)
		})

		it("should accept custom priority and agents", () => {
			const result = validator.validateCreateTask({
				title: "Fix",
				description: "Fix bug",
				priority: "critical",
				assignedAgents: ["frontend"],
			})
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.priority).toBe("critical")
				expect(result.data.assignedAgents).toEqual(["frontend"])
			}
		})
	})

	describe("validateResponse", () => {
		it("should accept a valid response", () => {
			const result = validator.validateResponse({
				messageId: randomUUID(),
				from: "frontend",
				status: "success",
				content: "Done",
				timestamp: new Date().toISOString(),
			})
			expect(result.success).toBe(true)
		})

		it("should reject invalid status", () => {
			const result = validator.validateResponse({
				messageId: randomUUID(),
				from: "frontend",
				status: "invalid_status",
				content: "Done",
				timestamp: new Date().toISOString(),
			})
			expect(result.success).toBe(false)
		})
	})
})
