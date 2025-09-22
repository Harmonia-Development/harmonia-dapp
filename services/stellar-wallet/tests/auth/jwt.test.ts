import jwt from 'jsonwebtoken'
import request from 'supertest'
import express from 'express'
import { jwtMiddleware, requireMatchingUserId } from '../../src/auth/jwt'

// Set JWT secret for tests
process.env.JWT_SECRET = 'test-jwt-secret-key'

const app = express()
app.use(express.json())

// Test endpoint with just JWT middleware
app.get('/protected', jwtMiddleware, (req, res) => {
	res.json({ user: req.user })
})

// Test endpoint with JWT + user ID matching
app.post('/protected-user', jwtMiddleware, requireMatchingUserId, (req, res) => {
	res.json({ success: true, user: req.user })
})

describe('JWT Middleware', () => {
	const validPayload = { user_id: 123 }
	const validToken = jwt.sign(validPayload, process.env.JWT_SECRET!, { expiresIn: '1h' })

	describe('jwtMiddleware', () => {
		it('should allow access with valid JWT', async () => {
			const res = await request(app).get('/protected').set('Authorization', `Bearer ${validToken}`)

			expect(res.status).toBe(200)
			expect(res.body.user).toEqual(expect.objectContaining({ user_id: 123 }))
		})

		it('should reject request without Authorization header', async () => {
			const res = await request(app).get('/protected')

			expect(res.status).toBe(401)
			expect(res.body).toEqual({ error: 'Unauthorized' })
		})

		it('should reject request with malformed Authorization header', async () => {
			const res = await request(app).get('/protected').set('Authorization', 'NotBearer token')

			expect(res.status).toBe(401)
			expect(res.body).toEqual({ error: 'Unauthorized' })
		})

		it('should reject request with invalid JWT', async () => {
			const res = await request(app).get('/protected').set('Authorization', 'Bearer invalid-token')

			expect(res.status).toBe(401)
			expect(res.body).toEqual({ error: 'Unauthorized' })
		})

		it('should reject request with expired JWT', async () => {
			const expiredToken = jwt.sign(validPayload, process.env.JWT_SECRET!, { expiresIn: '-1h' })

			const res = await request(app)
				.get('/protected')
				.set('Authorization', `Bearer ${expiredToken}`)

			expect(res.status).toBe(401)
			expect(res.body).toEqual({ error: 'Unauthorized' })
		})
	})

	describe('requireMatchingUserId', () => {
		it('should allow access when JWT user_id matches request user_id', async () => {
			const res = await request(app)
				.post('/protected-user')
				.set('Authorization', `Bearer ${validToken}`)
				.send({ user_id: 123 })

			expect(res.status).toBe(200)
			expect(res.body.success).toBe(true)
		})

		it('should reject when JWT user_id does not match request user_id', async () => {
			const res = await request(app)
				.post('/protected-user')
				.set('Authorization', `Bearer ${validToken}`)
				.send({ user_id: 456 })

			expect(res.status).toBe(403)
			expect(res.body).toEqual({ error: 'Forbidden' })
		})

		it('should reject when user_id is missing from request body', async () => {
			const res = await request(app)
				.post('/protected-user')
				.set('Authorization', `Bearer ${validToken}`)
				.send({})

			expect(res.status).toBe(403)
			expect(res.body).toEqual({ error: 'Forbidden' })
		})
	})
})
