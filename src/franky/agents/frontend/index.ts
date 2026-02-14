/**
 * Franky 3.0 — Frontend Agent
 * Specializes in UI/UX, webview components, and styling.
 */

import type { AgentMessage, AgentResponse } from "../agent-types"
import { BaseAgent } from "../base-agent"

export class FrontendAgent extends BaseAgent {
	constructor() {
		super({
			type: "frontend",
			name: "Frontend Agent",
			description: "Specializes in UI/UX design, webview components, CSS, and frontend architecture",
			capabilities: ["ui_design", "code_generation", "refactoring"],
		})
	}

	async handleMessage(message: AgentMessage): Promise<AgentResponse> {
		this.status = "busy"
		try {
			// FASE 1: placeholder — will be implemented in FASE 2+
			return this.createResponse(message.id, "success", `[FrontendAgent] Received: ${message.content}`)
		} finally {
			this.status = "idle"
		}
	}
}
