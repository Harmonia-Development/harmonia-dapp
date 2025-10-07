import fs from 'node:fs'
import path from 'node:path'
import type { NextFunction, Request, Response } from 'express'
import winston from 'winston'

const logsDir = path.join(process.cwd(), 'services', 'stellar-wallet', 'logs')
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true })
}

const level = process.env.LOG_LEVEL ?? 'info'

export const logger = winston.createLogger({
	level,
	format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: path.join(logsDir, 'app.log') }),
	],
})

/** Extract user id if present on request (from auth middleware or header). */
function getRequestUserId(req: Request): string | undefined {
	const anyReq = req as unknown as { user?: { id?: string | number } }
	if (anyReq.user?.id) return String(anyReq.user.id)
	const headerUserId = req.header('x-user-id')
	return headerUserId ?? undefined
}

/** Express middleware to log requests and responses with duration. */
export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
	const start = process.hrtime.bigint()

	logger.info({
		message: 'incoming_request',
		method: req.method,
		url: req.originalUrl ?? req.url,
		user_id: getRequestUserId(req),
		host: req.hostname,
	})

	res.on('finish', () => {
		const end = process.hrtime.bigint()
		const durationMs = Number(end - start) / 1_000_000
		logger.info({
			message: 'request_completed',
			method: req.method,
			url: req.originalUrl ?? req.url,
			status: res.statusCode,
			duration_ms: Number(durationMs.toFixed(2)),
			user_id: getRequestUserId(req),
		})
	})

	res.on('close', () => {
		// In case the connection is aborted
		logger.warn?.({
			message: 'request_aborted',
			method: req.method,
			url: req.originalUrl ?? req.url,
			user_id: getRequestUserId(req),
		})
	})

	next()
}

export function logError(error: unknown, context?: Record<string, unknown>): void {
	const message = error instanceof Error ? error.message : 'unknown_error'
	logger.error({ message, stack: error instanceof Error ? error.stack : undefined, ...context })
}
