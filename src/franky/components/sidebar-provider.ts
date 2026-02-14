/**
 * Franky 3.0 — FrankySidebarProvider
 * Dynamic TreeDataProvider that shows orchestrator status and registered agents in the sidebar.
 */

import * as vscode from "vscode"
import type { AgentDescriptor, AgentStatus } from "../agents/agent-types"
import type { OrchestratorService } from "../orchestrator/orchestrator-service"

// ─── TreeItem for sidebar ────────────────────────────────

class FrankyTreeItem extends vscode.TreeItem {
	constructor(
		public override readonly label: string,
		public override readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly itemType: "header" | "status" | "agent",
		public readonly agentDescriptor?: AgentDescriptor,
	) {
		super(label, collapsibleState)
		this.contextValue = itemType

		if (itemType === "header") {
			this.iconPath = new vscode.ThemeIcon("robot")
		} else if (itemType === "status") {
			this.iconPath = new vscode.ThemeIcon("info")
		} else if (itemType === "agent" && agentDescriptor) {
			this.iconPath = new vscode.ThemeIcon(FrankyTreeItem.getAgentIcon(agentDescriptor.status))
			this.description = agentDescriptor.description
			this.tooltip = `${agentDescriptor.name}\nStatus: ${agentDescriptor.status}\nCapabilities: ${agentDescriptor.capabilities.join(", ")}`
		}
	}

	private static getAgentIcon(status: AgentStatus): string {
		switch (status) {
			case "idle":
				return "check"
			case "busy":
				return "sync~spin"
			case "error":
				return "error"
			case "disabled":
				return "circle-slash"
		}
	}
}

// ─── Provider ────────────────────────────────────────────

export class FrankySidebarProvider implements vscode.TreeDataProvider<FrankyTreeItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<FrankyTreeItem | undefined | null>()
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event

	private orchestrator: OrchestratorService | null = null

	/** Connect to the orchestrator (called after init) */
	setOrchestrator(orchestrator: OrchestratorService): void {
		this.orchestrator = orchestrator

		// Listen for state changes to refresh the tree
		orchestrator.stateManager.onStateChange(() => this.refresh())
	}

	/** Force refresh of the sidebar */
	refresh(): void {
		this._onDidChangeTreeData.fire(undefined)
	}

	getTreeItem(element: FrankyTreeItem): vscode.TreeItem {
		return element
	}

	getChildren(element?: FrankyTreeItem): FrankyTreeItem[] {
		if (!element) {
			// Root level
			return this.getRootItems()
		}

		// Children of "Agents" header
		if (element.itemType === "header" && element.label.includes("Agents")) {
			return this.getAgentItems()
		}

		return []
	}

	// ─── Internal ─────────────────────────────────────────

	private getRootItems(): FrankyTreeItem[] {
		const items: FrankyTreeItem[] = []

		if (!this.orchestrator?.isReady()) {
			items.push(
				new FrankyTreeItem("⏳ Orchestrator: Initializing...", vscode.TreeItemCollapsibleState.None, "status"),
			)
			return items
		}

		const state = this.orchestrator.stateManager.getState()
		const agentCount = this.orchestrator.registry.size
		const taskCount = this.orchestrator.taskManager.activeCount

		items.push(
			new FrankyTreeItem(
				`📊 Status: ${this.phaseLabel(state.phase)}`,
				vscode.TreeItemCollapsibleState.None,
				"status",
			),
		)
		items.push(new FrankyTreeItem(`📋 Active Tasks: ${taskCount}`, vscode.TreeItemCollapsibleState.None, "status"))
		items.push(new FrankyTreeItem(`🤖 Agents (${agentCount})`, vscode.TreeItemCollapsibleState.Expanded, "header"))

		return items
	}

	private getAgentItems(): FrankyTreeItem[] {
		if (!this.orchestrator?.isReady()) return []

		return this.orchestrator.registry
			.getAllDescriptors()
			.map(
				(desc) =>
					new FrankyTreeItem(
						`${this.statusEmoji(desc.status)} ${desc.name}`,
						vscode.TreeItemCollapsibleState.None,
						"agent",
						desc,
					),
			)
	}

	private phaseLabel(phase: string): string {
		switch (phase) {
			case "idle":
				return "Ready"
			case "planning":
				return "Planning..."
			case "executing":
				return "Executing..."
			case "reviewing":
				return "Reviewing..."
			case "completed":
				return "Done ✅"
			case "error":
				return "Error ❌"
			default:
				return phase
		}
	}

	private statusEmoji(status: AgentStatus): string {
		switch (status) {
			case "idle":
				return "✅"
			case "busy":
				return "🔄"
			case "error":
				return "❌"
			case "disabled":
				return "⭕"
		}
	}

	dispose(): void {
		this._onDidChangeTreeData.dispose()
	}
}
