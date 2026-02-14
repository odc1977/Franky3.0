/**
 * Franky 3.0 — Documentation Agent
 * Specializes in docs, SPECs, ADRs, READMEs, and inline comments.
 */

import type { AgentMessage, AgentResponse } from "../agent-types"
import { BaseAgent } from "../base-agent"

export class DocsAgent extends BaseAgent {
	constructor() {
		super({
			type: "docs",
			name: "Documentation Agent",
			description: "Specializes in documentation generation, SPECs, ADRs, READMEs, and TSDoc comments",
			capabilities: ["documentation"],
		})
	}

	async handleMessage(message: AgentMessage): Promise<AgentResponse> {
		this.status = "busy"
		try {
			return this.createResponse(message.id, "success", `[DocsAgent] Received: ${message.content}`)
		} finally {
			this.status = "idle"
		}
	}
}
