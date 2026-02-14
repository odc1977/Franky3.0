/**
 * Franky 3.0 — Agents Module Barrel Export
 */

export { AgentRegistry } from "./agent-registry"
export type { AgentCapability, AgentDescriptor, AgentMessage, AgentResponse, AgentStatus } from "./agent-types"
export { BackendAgent } from "./backend"
// Core
export { BaseAgent } from "./base-agent"
export { DocsAgent } from "./docs"
// Specialized agents
export { FrontendAgent } from "./frontend"
export { OrchestratorAgent } from "./orchestrator"
export { SecurityAgent } from "./security"
export { TestingAgent } from "./testing"
