/**
 * Franky 3.0 — AgentRegistry
 * Singleton registry that manages agent discovery and lifecycle.
 */

import type { FrankyAgentType } from "../types"
import type { AgentCapability, AgentDescriptor } from "./agent-types"
import type { BaseAgent } from "./base-agent"

export class AgentRegistry {
	private static instance: AgentRegistry | null = null
	private readonly agents = new Map<FrankyAgentType, BaseAgent>()

	private constructor() {}

	static getInstance(): AgentRegistry {
		if (!AgentRegistry.instance) {
			AgentRegistry.instance = new AgentRegistry()
		}
		return AgentRegistry.instance
	}

	/** Register an agent in the registry */
	register(agent: BaseAgent): void {
		if (this.agents.has(agent.type)) {
			throw new Error(`Agent "${agent.type}" is already registered`)
		}
		this.agents.set(agent.type, agent)
	}

	/** Unregister an agent */
	unregister(type: FrankyAgentType): boolean {
		return this.agents.delete(type)
	}

	/** Get a specific agent by type */
	get(type: FrankyAgentType): BaseAgent | undefined {
		return this.agents.get(type)
	}

	/** Get all registered agents */
	getAll(): BaseAgent[] {
		return Array.from(this.agents.values())
	}

	/** Get descriptors for all agents (used by sidebar/UI) */
	getAllDescriptors(): AgentDescriptor[] {
		return this.getAll().map((a) => a.getDescriptor())
	}

	/** Find agents that can handle a specific capability */
	findByCapability(capability: AgentCapability): BaseAgent[] {
		return this.getAll().filter((a) => a.canHandle(capability))
	}

	/** Get count of registered agents */
	get size(): number {
		return this.agents.size
	}

	/** Initialize all registered agents */
	async initializeAll(): Promise<void> {
		const tasks = this.getAll().map((a) => a.initialize())
		await Promise.all(tasks)
	}

	/** Dispose all registered agents */
	async disposeAll(): Promise<void> {
		const tasks = this.getAll().map((a) => a.dispose())
		await Promise.all(tasks)
		this.agents.clear()
	}

	/** Reset the singleton (for testing) */
	static resetInstance(): void {
		if (AgentRegistry.instance) {
			AgentRegistry.instance.agents.clear()
			AgentRegistry.instance = null
		}
	}
}
