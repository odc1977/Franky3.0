/**
 * Franky 3.0 — Router
 * Routes messages from the orchestrator to the correct agent based on capability or explicit target.
 */

import { randomUUID } from "crypto"
import type { AgentRegistry } from "../agents/agent-registry"
import type { AgentCapability, AgentMessage, AgentResponse } from "../agents/agent-types"
import type { FrankyAgentType } from "../types"
import type { StateManager } from "./state-manager"

export class Router {
	private readonly registry: AgentRegistry
	private readonly stateManager: StateManager

	constructor(registry: AgentRegistry, stateManager: StateManager) {
		this.registry = registry
		this.stateManager = stateManager
	}

	/** Route a message to a specific agent by type */
	async routeToAgent(
		agentType: FrankyAgentType,
		content: string,
		metadata?: Record<string, unknown>,
	): Promise<AgentResponse> {
		const agent = this.registry.get(agentType)
		if (!agent) {
			throw new Error(`Agent "${agentType}" not found in registry`)
		}

		const message: AgentMessage = {
			id: randomUUID(),
			from: "user",
			to: agentType,
			content,
			metadata,
			timestamp: new Date().toISOString(),
		}

		this.stateManager.setPhase("executing")
		this.stateManager.setAgentStatus(agentType, "busy")

		try {
			const response = await agent.handleMessage(message)
			this.stateManager.setAgentStatus(agentType, "idle")
			return response
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : String(err)
			this.stateManager.setAgentStatus(agentType, "error")
			this.stateManager.setError(`Agent "${agentType}" failed: ${errorMsg}`)
			throw err
		}
	}

	/** Route a message to the first agent that can handle the given capability */
	async routeByCapability(
		capability: AgentCapability,
		content: string,
		metadata?: Record<string, unknown>,
	): Promise<AgentResponse> {
		const agents = this.registry.findByCapability(capability)
		if (agents.length === 0) {
			throw new Error(`No agent found with capability "${capability}"`)
		}

		// Pick the first idle agent, or fall back to the first available
		const targetAgent = agents.find((a) => a.status === "idle") ?? agents[0]
		return this.routeToAgent(targetAgent.type, content, metadata)
	}

	/** Broadcast a message to all agents (fan-out) */
	async broadcast(content: string, metadata?: Record<string, unknown>): Promise<AgentResponse[]> {
		const agents = this.registry.getAll()
		const results = await Promise.allSettled(
			agents.map((agent) => this.routeToAgent(agent.type, content, metadata)),
		)

		return results
			.filter((r): r is PromiseFulfilledResult<AgentResponse> => r.status === "fulfilled")
			.map((r) => r.value)
	}

	/** Get a summary of available routes */
	getAvailableRoutes(): Array<{
		agent: FrankyAgentType
		capabilities: readonly AgentCapability[]
	}> {
		return this.registry.getAll().map((a) => ({
			agent: a.type,
			capabilities: a.capabilities,
		}))
	}
}
