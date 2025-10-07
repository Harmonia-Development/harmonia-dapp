import express from 'express'
import request from 'supertest'

jest.mock('winston', () => {
	const info = jest.fn()
	const error = jest.fn()
	const debug = jest.fn()
	return {
		format: { combine: jest.fn(), timestamp: jest.fn(), json: jest.fn() },
		transports: { Console: jest.fn(), File: jest.fn() },
		createLogger: jest.fn(() => ({ info, error, debug })),
		__mocks: { info, error, debug },
	}
})

import { logError, loggerMiddleware } from '../../src/middlewares/logger'

describe('logger middleware', () => {
	let app: express.Application

	beforeEach(() => {
		jest.clearAllMocks()
		app = express()
		app.use(express.json())
		app.use(loggerMiddleware)
		app.get('/ok', (_req, res) => res.status(200).json({ ok: true }))
		app.get('/user', (req, res) => {
			// biome-ignore lint/suspicious/noExplicitAny: Test mock setup requires any
			;(req as any).user = { id: 42, user_id: '42', role: 'test' }
			return res.status(200).json({ ok: true })
		})
		app.get('/error', () => {
			throw new Error('boom')
		})
		// error handler to capture thrown errors
		app.use(
			(err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
				logError(err, { route: '/error' })
				res.status(500).json({ error: 'internal' })
			},
		)
	})

	it('logs method and url on request', async () => {
		const winston = require('winston')
		await request(app).get('/ok').expect(200)
		expect(winston.__mocks.info).toHaveBeenCalled()
		const calls = (winston.__mocks.info as jest.Mock).mock.calls
		const hasIncoming = calls.some(
			// biome-ignore lint/suspicious/noExplicitAny: Test log inspection requires any
			(args: any[]) =>
				args[0]?.message === 'incoming_request' &&
				args[0]?.url === '/ok' &&
				args[0]?.method === 'GET',
		)
		const hasCompleted = calls.some(
			// biome-ignore lint/suspicious/noExplicitAny: Test log inspection requires any
			(args: any[]) => args[0]?.message === 'request_completed' && args[0]?.url === '/ok',
		)
		expect(hasIncoming).toBe(true)
		expect(hasCompleted).toBe(true)
	})

	it('includes user_id when available', async () => {
		const winston = require('winston')
		await request(app).get('/user').expect(200)
		const calls = (winston.__mocks.info as jest.Mock).mock.calls
		// biome-ignore lint/suspicious/noExplicitAny: Test log inspection requires any
		const hasUser = calls.some((args: any[]) => args[0]?.user_id === '42')
		expect(hasUser).toBe(true)
	})

	it('logs errors via logError helper', async () => {
		const winston = require('winston')
		await request(app).get('/error').expect(500)
		expect(winston.__mocks.error).toHaveBeenCalled()
		const calls = (winston.__mocks.error as jest.Mock).mock.calls
		// biome-ignore lint/suspicious/noExplicitAny: Test log inspection requires any
		const hasBoom = calls.some((args: any[]) => String(args[0]?.message).includes('boom'))
		expect(hasBoom).toBe(true)
	})
})
