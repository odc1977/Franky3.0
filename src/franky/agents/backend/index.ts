/**
 * Franky 3.0 — Backend Agent
 * Specializes in backend logic, APIs, infrastructure, and data.
 */

import type { AgentMessage, AgentResponse } from "../agent-types"
import { BaseAgent } from "../base-agent"

export class BackendAgent extends BaseAgent {
	constructor() {
		super({
			type: "backend",
			name: "Backend Agent",
			description: "Specializes in backend architecture, APIs, database design, and server-side logic",
			capabilities: ["code_generation", "architecture", "refactoring"],
		})
	}

	async handleMessage(message: AgentMessage): Promise<AgentResponse> {
		this.status = "busy"
		try {
			return this.createResponse(message.id, "success", `[BackendAgent] Received: ${message.content}`)
		} finally {
			this.status = "idle"
		}
	}
}
