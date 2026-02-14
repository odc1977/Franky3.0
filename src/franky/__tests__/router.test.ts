/**
 * Franky 3.0 — Router Tests
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { AgentRegistry } from "../agents/agent-registry"
import { BackendAgent } from "../agents/backend"
import { FrontendAgent } from "../agents/frontend"
import { SecurityAgent } from "../agents/security"
import { Router } from "../orchestrator/router"
import { StateManager } from "../orchestrator/state-manager"

describe("Router", () => {
	let registry: AgentRegistry
	let stateManager: StateManager
	let router: Router

	beforeEach(() => {
		AgentRegistry.resetInstance()
		registry = AgentRegistry.getInstance()
		stateManager = new StateManager()
		router = new Router(registry, stateManager)

		registry.register(new FrontendAgent())
		registry.register(new BackendAgent())
		registry.register(new SecurityAgent())
	})

	afterEach(() => {
		AgentRegistry.resetInstance()
	})

	it("should route to a specific agent", async () => {
		const response = await router.routeToAgent("frontend", "Build a form")
		expect(response.status).toBe("success")
		expect(response.from).toBe("frontend")
		expect(response.content).toContain("FrontendAgent")
	})

	it("should throw for unknown agent", async () => {
		await expect(router.routeToAgent("docs" as any, "Write docs")).rejects.toThrow("not found")
	})

	it("should route by capability", async () => {
		const response = await router.routeByCapability("security_audit", "Scan deps")
		expect(response.from).toBe("security")
	})

	it("should throw when no agent has capability", async () => {
		await expect(router.routeByCapability("documentation", "Write")).rejects.toThrow("No agent found")
	})

	it("should broadcast to all agents", async () => {
		const responses = await router.broadcast("Hello all")
		expect(responses.length).toBe(3) // frontend, backend, security
	})

	it("should update state manager on routing", async () => {
		await router.routeToAgent("frontend", "Test")
		// After routing, agent should be back to idle
		const state = stateManager.getState()
		expect(state.agentStatuses.get("frontend")).toBe("idle")
	})

	it("should list available routes", () => {
		const routes = router.getAvailableRoutes()
		expect(routes.length).toBe(3)
		expect(routes.map((r) => r.agent)).toContain("frontend")
	})
})
