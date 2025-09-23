import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import request from 'supertest'

// I am creating a custom REQUEST interface to suit my test

interface CustomRequest extends Request {
	rateLimitCount: number
}

jest.mock('express-rate-limit', () => {
	return jest.fn(() => {
		return (req: CustomRequest, res: Response, next: NextFunction) => {
			if (!req.rateLimitCount) {
				req.rateLimitCount = 1
			} else {
				req.rateLimitCount++
			}

			res.set('RateLimit-Limit', '10')
			res.set('RateLimit-Remaining', String(10 - req.rateLimitCount))
			res.set('RateLimit-Reset', String(Math.floor(Date.now() / 1000) + 60))

			if (req.rateLimitCount > 10) {
				return res.status(429).send('Too many requests, please try again later.')
			}

			next()
		}
	})
})

process.env.RATE_LIMIT_WINDOW_MS = '60000'
process.env.RATE_LIMIT_MAX = '10'

import { authLimiter, kycLimiter, walletLimiter } from '../../src/middlewares/rate-limit'

describe('Rate Limiting Middleware', () => {
	let app: express.Application

	beforeEach(() => {
		app = express()
		app.use(express.json())
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('kycLimiter', () => {
		it('should be a function', () => {
			expect(typeof kycLimiter).toBe('function')
		})

		it('should allow requests within the rate limit', async () => {
			app.get('/kyc-test', kycLimiter, (req, res) => {
				res.status(200).json({ success: true })
			})

			const response = await request(app).get('/kyc-test').expect(200)

			expect(response.body).toEqual({ success: true })
		})
	})

	describe('authLimiter', () => {
		it('should be a function', () => {
			expect(typeof authLimiter).toBe('function')
		})

		it('should allow requests within the rate limit', async () => {
			app.post('/auth-test', authLimiter, (req, res) => {
				res.status(200).json({ success: true })
			})

			const response = await request(app).post('/auth-test').expect(200)

			expect(response.body).toEqual({ success: true })
		})
	})

	describe('walletLimiter', () => {
		it('should be a function', () => {
			expect(typeof walletLimiter).toBe('function')
		})

		it('should allow requests within the rate limit', async () => {
			app.get('/wallet-test', walletLimiter, (req, res) => {
				res.status(200).json({ success: true })
			})

			const response = await request(app).get('/wallet-test').expect(200)

			expect(response.body).toEqual({ success: true })
		})
	})
})
