/**
 * Franky 3.0 — Logger
 * Dedicated OutputChannel logger for Franky subsystem.
 *
 * Uses VSCode OutputChannel (same pattern as CoStrict's ChannelLogger)
 * but writes to a separate "Franky 3.0" channel to keep logs isolated.
 *
 * @module franky/utils/logger
 */

import * as vscode from "vscode"
import type { FrankyLogLevel } from "../types"
import { FRANKY_OUTPUT_CHANNEL } from "../types"

// ─── Log Level Priority ────────────────────────────────────────
const LOG_LEVEL_PRIORITY: Record<FrankyLogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
	fatal: 4,
}

// ─── Logger Interface ──────────────────────────────────────────
export interface IFrankyLogger {
	debug(message: string, ...args: unknown[]): void
	info(message: string, ...args: unknown[]): void
	warn(message: string, ...args: unknown[]): void
	error(message: string, ...args: unknown[]): void
	fatal(message: string, ...args: unknown[]): void
	dispose(): void
	readonly channel: vscode.OutputChannel
}

// ─── Franky Logger Implementation ──────────────────────────────
class FrankyLogger implements IFrankyLogger {
	readonly channel: vscode.OutputChannel
	private readonly minLevel: FrankyLogLevel
	private disposed = false

	constructor(channelName: string = FRANKY_OUTPUT_CHANNEL, minLevel: FrankyLogLevel = "debug") {
		this.channel = vscode.window.createOutputChannel(channelName)
		this.minLevel = minLevel
	}

	debug(message: string, ...args: unknown[]): void {
		this.log("debug", message, ...args)
	}

	info(message: string, ...args: unknown[]): void {
		this.log("info", message, ...args)
	}

	warn(message: string, ...args: unknown[]): void {
		this.log("warn", message, ...args)
	}

	error(message: string, ...args: unknown[]): void {
		this.log("error", message, ...args)
	}

	fatal(message: string, ...args: unknown[]): void {
		this.log("fatal", message, ...args)
	}

	dispose(): void {
		if (!this.disposed) {
			this.channel.dispose()
			this.disposed = true
		}
	}

	// ─── Internal ──────────────────────────────────────────────
	private log(level: FrankyLogLevel, message: string, ...args: unknown[]): void {
		if (this.disposed) return
		if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.minLevel]) return

		const timestamp = new Date().toISOString()
		const tag = level.toUpperCase().padEnd(5)
		const extra = args.length > 0 ? " " + args.map(safeStringify).join(" ") : ""
		const line = `[${timestamp}] [${tag}] ${message}${extra}`

		this.channel.appendLine(line)
	}
}

// ─── Singleton ─────────────────────────────────────────────────
let _instance: FrankyLogger | undefined

/**
 * Get or create the singleton Franky logger.
 * Call this from extension.ts activate() to initialize.
 */
export function getFrankyLogger(minLevel?: FrankyLogLevel): IFrankyLogger {
	if (!_instance) {
		_instance = new FrankyLogger(FRANKY_OUTPUT_CHANNEL, minLevel ?? "debug")
	}
	return _instance
}

/**
 * Dispose the singleton logger.
 * Call this from extension.ts deactivate().
 */
export function disposeFrankyLogger(): void {
	if (_instance) {
		_instance.dispose()
		_instance = undefined
	}
}

// ─── Helpers ───────────────────────────────────────────────────
function safeStringify(value: unknown): string {
	if (typeof value === "string") return value
	try {
		return JSON.stringify(value, null, 0)
	} catch {
		return String(value)
	}
}
