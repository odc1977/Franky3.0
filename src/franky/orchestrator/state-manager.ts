/**
 * Franky 3.0 — StateManager
 * Manages global orchestrator state: active agents, current task, and system status.
 */

import type { AgentStatus } from "../agents/agent-types"
import type { FrankyAgentType } from "../types"

// ─── State Shape ─────────────────────────────────────────

export type OrchestratorPhase = "idle" | "planning" | "executing" | "reviewing" | "completed" | "error"

export interface OrchestratorState {
	/** Current orchestrator phase */
	phase: OrchestratorPhase
	/** Currently active task ID, if any */
	activeTaskId: string | null
	/** Map of agent type → status */
	agentStatuses: Map<FrankyAgentType, AgentStatus>
	/** Last state update timestamp */
	lastUpdated: string
	/** Error message if phase=error */
	error: string | null
}

// ─── State Change Listener ──────────────────────────────

export type StateChangeListener = (state: Readonly<OrchestratorState>) => void

// ─── StateManager ────────────────────────────────────────

export class StateManager {
	private readonly state: OrchestratorState
	private readonly listeners: Set<StateChangeListener> = new Set()

	constructor() {
		this.state = {
			phase: "idle",
			activeTaskId: null,
			agentStatuses: new Map(),
			lastUpdated: new Date().toISOString(),
			error: null,
		}
	}

	// ─── Getters ──────────────────────────────────────────

	getState(): Readonly<OrchestratorState> {
		return this.state
	}

	getPhase(): OrchestratorPhase {
		return this.state.phase
	}

	getActiveTaskId(): string | null {
		return this.state.activeTaskId
	}

	isIdle(): boolean {
		return this.state.phase === "idle"
	}

	// ─── Setters ──────────────────────────────────────────

	setPhase(phase: OrchestratorPhase): void {
		this.state.phase = phase
		if (phase !== "error") {
			this.state.error = null
		}
		this.touch()
	}

	setActiveTask(taskId: string | null): void {
		this.state.activeTaskId = taskId
		this.touch()
	}

	setAgentStatus(agent: FrankyAgentType, status: AgentStatus): void {
		this.state.agentStatuses.set(agent, status)
		this.touch()
	}

	setError(error: string): void {
		this.state.phase = "error"
		this.state.error = error
		this.touch()
	}

	reset(): void {
		this.state.phase = "idle"
		this.state.activeTaskId = null
		this.state.error = null
		this.state.agentStatuses.clear()
		this.touch()
	}

	// ─── Listeners ────────────────────────────────────────

	onStateChange(listener: StateChangeListener): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	// ─── Internal ─────────────────────────────────────────

	private touch(): void {
		this.state.lastUpdated = new Date().toISOString()
		for (const listener of this.listeners) {
			try {
				listener(this.state)
			} catch {
				// Listener errors should not break state updates
			}
		}
	}
}
