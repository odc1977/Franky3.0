/**
 * Franky 3.0 — Base Types
 * FASE 0: Skeleton definitions. Full types will be added in FASE 1+.
 *
 * @module franky/types
 */

// ─── Locale ────────────────────────────────────────────────────
/** Only ES and EN are allowed per FOUNDATION.md §2.1 */
export type FrankyLocale = "en" | "es"

// ─── Log Levels ────────────────────────────────────────────────
export type FrankyLogLevel = "debug" | "info" | "warn" | "error" | "fatal"

// ─── Agent Types ───────────────────────────────────────────────
export type FrankyAgentType = "frontend" | "backend" | "testing" | "docs" | "orchestrator" | "security"

export interface FrankyAgent {
	readonly id: string
	readonly name: string
	readonly type: FrankyAgentType
	readonly enabled: boolean
}

// ─── Config ────────────────────────────────────────────────────
export interface FrankyConfig {
	readonly version: string
	readonly locale: FrankyLocale
	readonly debug: boolean
}

// ─── Task Identifiers (Txx) ────────────────────────────────────
export type TaskId = `T${number}`

export interface TaskStatus {
	readonly id: TaskId
	readonly name: string
	readonly state: "planned" | "in-progress" | "implemented" | "tested"
}

// ─── Constants ─────────────────────────────────────────────────
export const FRANKY_VERSION = "3.0.0-alpha.0"
export const FRANKY_OUTPUT_CHANNEL = "Franky 3.0"
