/**
 * Franky 3.0 — OrchestratorService
 * Main entry point that wires together agents, router, state, and task management.
 * Used by extension.ts to boot the entire multi-agent system.
 */

import { AgentRegistry } from "../agents/agent-registry"
import { BackendAgent } from "../agents/backend"
import { DocsAgent } from "../agents/docs"
import { FrontendAgent } from "../agents/frontend"
import { OrchestratorAgent } from "../agents/orchestrator"
import { SecurityAgent } from "../agents/security"
import { TestingAgent } from "../agents/testing"
import { getFrankyLogger } from "../utils/logger"
import { Router } from "./router"
import { StateManager } from "./state-manager"
import { TaskManager } from "./task-manager"
import { Validator } from "./validator"

export class OrchestratorService {
	readonly registry: AgentRegistry
	readonly router: Router
	readonly taskManager: TaskManager
	readonly stateManager: StateManager
	readonly validator: Validator

	private initialized = false

	constructor() {
		this.registry = AgentRegistry.getInstance()
		this.stateManager = new StateManager()
		this.taskManager = new TaskManager()
		this.validator = new Validator()
		this.router = new Router(this.registry, this.stateManager)
	}

	/** Boot the orchestrator: register all agents and initialize them */
	async initialize(): Promise<void> {
		if (this.initialized) return

		const logger = getFrankyLogger()
		logger.info("OrchestratorService: initializing...")

		// Register all 6 specialized agents
		this.registry.register(new FrontendAgent())
		this.registry.register(new BackendAgent())
		this.registry.register(new TestingAgent())
		this.registry.register(new DocsAgent())
		this.registry.register(new OrchestratorAgent())
		this.registry.register(new SecurityAgent())

		// Initialize all agents
		await this.registry.initializeAll()

		this.stateManager.setPhase("idle")
		this.initialized = true

		logger.info(`OrchestratorService: ${this.registry.size} agents registered and initialized`)
		logger.info(`OrchestratorService: ready (phase=${this.stateManager.getPhase()})`)
	}

	/** Shutdown the orchestrator cleanly */
	async dispose(): Promise<void> {
		if (!this.initialized) return

		const logger = getFrankyLogger()
		logger.info("OrchestratorService: shutting down...")

		await this.registry.disposeAll()
		this.taskManager.clear()
		this.stateManager.reset()
		AgentRegistry.resetInstance()

		this.initialized = false
		logger.info("OrchestratorService: shutdown complete")
	}

	/** Check if the orchestrator is ready */
	isReady(): boolean {
		return this.initialized
	}
}
