/**
 * Franky 3.0 — Agent Types
 * Shared types for the multi-agent framework.
 */

import type { FrankyAgentType } from "../types"

// ─── Agent Capabilities ─────────────────────────────────

export type AgentCapability =
	| "code_generation"
	| "code_review"
	| "testing"
	| "documentation"
	| "security_audit"
	| "architecture"
	| "debugging"
	| "refactoring"
	| "orchestration"
	| "ui_design"

export type AgentStatus = "idle" | "busy" | "error" | "disabled"

// ─── Messages ────────────────────────────────────────────

export interface AgentMessage {
	/** Unique message ID */
	readonly id: string
	/** Source agent or "user" */
	readonly from: FrankyAgentType | "user"
	/** Target agent */
	readonly to: FrankyAgentType
	/** Message payload */
	readonly content: string
	/** Optional structured data */
	readonly metadata?: Record<string, unknown>
	/** Timestamp ISO 8601 */
	readonly timestamp: string
}

export interface AgentResponse {
	/** Original message ID this responds to */
	readonly messageId: string
	/** Responding agent */
	readonly from: FrankyAgentType
	/** Response status */
	readonly status: "success" | "error" | "declined"
	/** Response content */
	readonly content: string
	/** Optional structured data */
	readonly metadata?: Record<string, unknown>
	/** Timestamp ISO 8601 */
	readonly timestamp: string
}

// ─── Agent Descriptor ────────────────────────────────────

export interface AgentDescriptor {
	/** Agent type identifier */
	readonly type: FrankyAgentType
	/** Human-readable name */
	readonly name: string
	/** Short description */
	readonly description: string
	/** Capabilities this agent provides */
	readonly capabilities: readonly AgentCapability[]
	/** Current status */
	status: AgentStatus
}
