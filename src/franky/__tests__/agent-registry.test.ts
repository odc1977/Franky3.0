/**
 * Franky 3.0 — AgentRegistry Tests
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { AgentRegistry } from "../agents/agent-registry"
import { BackendAgent } from "../agents/backend"
import { FrontendAgent } from "../agents/frontend"
import { SecurityAgent } from "../agents/security"

describe("AgentRegistry", () => {
	beforeEach(() => {
		AgentRegistry.resetInstance()
	})

	afterEach(() => {
		AgentRegistry.resetInstance()
	})

	it("should be a singleton", () => {
		const a = AgentRegistry.getInstance()
		const b = AgentRegistry.getInstance()
		expect(a).toBe(b)
	})

	it("should register and retrieve agents", () => {
		const registry = AgentRegistry.getInstance()
		const agent = new FrontendAgent()
		registry.register(agent)
		expect(registry.get("frontend")).toBe(agent)
		expect(registry.size).toBe(1)
	})

	it("should throw on duplicate registration", () => {
		const registry = AgentRegistry.getInstance()
		registry.register(new FrontendAgent())
		expect(() => registry.register(new FrontendAgent())).toThrow("already registered")
	})

	it("should unregister agents", () => {
		const registry = AgentRegistry.getInstance()
		registry.register(new FrontendAgent())
		expect(registry.unregister("frontend")).toBe(true)
		expect(registry.size).toBe(0)
	})

	it("should return undefined for unknown agents", () => {
		const registry = AgentRegistry.getInstance()
		expect(registry.get("frontend")).toBeUndefined()
	})

	it("should find agents by capability", () => {
		const registry = AgentRegistry.getInstance()
		registry.register(new FrontendAgent())
		registry.register(new BackendAgent())
		registry.register(new SecurityAgent())

		const coders = registry.findByCapability("code_generation")
		expect(coders.length).toBe(2) // frontend + backend

		const auditors = registry.findByCapability("security_audit")
		expect(auditors.length).toBe(1)
		expect(auditors[0].type).toBe("security")
	})

	it("should get all descriptors", () => {
		const registry = AgentRegistry.getInstance()
		registry.register(new FrontendAgent())
		registry.register(new BackendAgent())

		const descriptors = registry.getAllDescriptors()
		expect(descriptors.length).toBe(2)
		expect(descriptors[0].status).toBe("idle")
	})

	it("should initialize and dispose all agents", async () => {
		const registry = AgentRegistry.getInstance()
		registry.register(new FrontendAgent())
		registry.register(new BackendAgent())

		await registry.initializeAll()
		const all = registry.getAll()
		expect(all.every((a) => a.status === "idle")).toBe(true)

		await registry.disposeAll()
		expect(registry.size).toBe(0)
	})
})
