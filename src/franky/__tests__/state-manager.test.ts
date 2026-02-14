/**
 * Franky 3.0 — StateManager Tests
 */

import { beforeEach, describe, expect, it, vi } from "vitest"
import { StateManager } from "../orchestrator/state-manager"

describe("StateManager", () => {
	let sm: StateManager

	beforeEach(() => {
		sm = new StateManager()
	})

	it("should start in idle phase", () => {
		expect(sm.getPhase()).toBe("idle")
		expect(sm.isIdle()).toBe(true)
	})

	it("should update phase", () => {
		sm.setPhase("executing")
		expect(sm.getPhase()).toBe("executing")
		expect(sm.isIdle()).toBe(false)
	})

	it("should track active task", () => {
		expect(sm.getActiveTaskId()).toBeNull()
		sm.setActiveTask("task-123")
		expect(sm.getActiveTaskId()).toBe("task-123")
	})

	it("should set agent status", () => {
		sm.setAgentStatus("frontend", "busy")
		const state = sm.getState()
		expect(state.agentStatuses.get("frontend")).toBe("busy")
	})

	it("should handle errors", () => {
		sm.setError("Something went wrong")
		expect(sm.getPhase()).toBe("error")
		expect(sm.getState().error).toBe("Something went wrong")
	})

	it("should clear error when setting non-error phase", () => {
		sm.setError("Error!")
		sm.setPhase("idle")
		expect(sm.getState().error).toBeNull()
	})

	it("should reset all state", () => {
		sm.setPhase("executing")
		sm.setActiveTask("task-1")
		sm.setAgentStatus("backend", "busy")
		sm.reset()

		expect(sm.getPhase()).toBe("idle")
		expect(sm.getActiveTaskId()).toBeNull()
		expect(sm.getState().agentStatuses.size).toBe(0)
	})

	it("should notify listeners on state change", () => {
		const listener = vi.fn()
		sm.onStateChange(listener)
		sm.setPhase("planning")
		expect(listener).toHaveBeenCalledOnce()
		expect(listener).toHaveBeenCalledWith(expect.objectContaining({ phase: "planning" }))
	})

	it("should allow unsubscribing listeners", () => {
		const listener = vi.fn()
		const unsub = sm.onStateChange(listener)
		unsub()
		sm.setPhase("executing")
		expect(listener).not.toHaveBeenCalled()
	})

	it("should update lastUpdated timestamp on changes", async () => {
		const before = sm.getState().lastUpdated
		await new Promise((r) => setTimeout(r, 5))
		sm.setPhase("executing")
		expect(sm.getState().lastUpdated).not.toBe(before)
	})
})
