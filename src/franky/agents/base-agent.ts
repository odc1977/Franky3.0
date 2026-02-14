/**
 * Franky 3.0 — BaseAgent
 * Abstract base class that all specialized agents must extend.
 */

import type { FrankyAgentType } from "../types"
import type { AgentCapability, AgentDescriptor, AgentMessage, AgentResponse, AgentStatus } from "./agent-types"

export abstract class BaseAgent {
	readonly type: FrankyAgentType
	readonly name: string
	readonly description: string
	readonly capabilities: readonly AgentCapability[]
	private _status: AgentStatus = "idle"

	constructor(descriptor: Omit<AgentDescriptor, "status">) {
		this.type = descriptor.type
		this.name = descriptor.name
		this.description = descriptor.description
		this.capabilities = descriptor.capabilities
	}

	// ─── Public API ──────────────────────────────────────

	get status(): AgentStatus {
		return this._status
	}

	set status(value: AgentStatus) {
		this._status = value
	}

	/** Returns the full descriptor for this agent */
	getDescriptor(): AgentDescriptor {
		return {
			type: this.type,
			name: this.name,
			description: this.description,
			capabilities: this.capabilities,
			status: this._status,
		}
	}

	/** Check if this agent can handle a given capability */
	canHandle(capability: AgentCapability): boolean {
		return this.capabilities.includes(capability)
	}

	/** Process an incoming message — must be implemented by subclasses */
	abstract handleMessage(message: AgentMessage): Promise<AgentResponse>

	/** Initialize the agent (optional override) */
	async initialize(): Promise<void> {
		this._status = "idle"
	}

	/** Dispose the agent (optional override) */
	async dispose(): Promise<void> {
		this._status = "disabled"
	}

	// ─── Helpers ──────────────────────────────────────────

	protected createResponse(
		messageId: string,
		status: AgentResponse["status"],
		content: string,
		metadata?: Record<string, unknown>,
	): AgentResponse {
		return {
			messageId,
			from: this.type,
			status,
			content,
			metadata,
			timestamp: new Date().toISOString(),
		}
	}
}
