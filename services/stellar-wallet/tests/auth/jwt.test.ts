// Set environment variable for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only-32-chars-long'

import type { NextFunction, Request, Response } from 'express'
import { generateToken, jwtMiddleware, verifyToken } from '../../src/auth/jwt'

describe('JWT Authentication', () => {
	describe('generateToken', () => {
		it('should generate a valid JWT token with user_id and default role', () => {
			const user_id = 'test-user-123'
			const token = generateToken(user_id)

			expect(token).toBeDefined()
			expect(typeof token).toBe('string')
			expect(token.split('.')).toHaveLength(3) // JWT has 3 parts separated by dots
		})

		it('should generate a valid JWT token with custom role', () => {
			const user_id = 'test-user-123'
			const role = 'admin'
			const token = generateToken(user_id, role)

			expect(token).toBeDefined()
			expect(typeof token).toBe('string')
			expect(token.split('.')).toHaveLength(3)
		})

		it('should generate different tokens for different users', () => {
			const token1 = generateToken('user1')
			const token2 = generateToken('user2')

			expect(token1).not.toBe(token2)
		})
	})

	describe('verifyToken', () => {
		it('should verify a valid token and return decoded payload', () => {
			const user_id = 'test-user-123'
			const role = 'user'
			const token = generateToken(user_id, role)

			const decoded = verifyToken(token)

			expect(decoded.user_id).toBe(user_id)
			expect(decoded.role).toBe(role)
			expect(decoded.iat).toBeDefined()
			expect(decoded.exp).toBeDefined()
		})

		it('should throw error for invalid token', () => {
			const invalidToken = 'invalid.token.here'

			expect(() => verifyToken(invalidToken)).toThrow('Invalid or expired token')
		})

		it('should throw error for malformed token', () => {
			const malformedToken = 'not-a-jwt-token'

			expect(() => verifyToken(malformedToken)).toThrow('Invalid or expired token')
		})

		it('should throw error for empty token', () => {
			expect(() => verifyToken('')).toThrow('Invalid or expired token')
		})
	})

	describe('jwtMiddleware', () => {
		let mockReq: Partial<Request>
		let mockRes: Partial<Response>
		let mockNext: NextFunction

		beforeEach(() => {
			mockReq = {}
			mockRes = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn().mockReturnThis(),
			}
			mockNext = jest.fn()
		})

		it('should call next() for valid Bearer token', () => {
			const user_id = 'test-user-123'
			const token = generateToken(user_id)

			mockReq.headers = {
				authorization: `Bearer ${token}`,
			}

			jwtMiddleware(mockReq as Request, mockRes as Response, mockNext)

			expect(mockNext).toHaveBeenCalled()
			expect(mockReq.user).toBeDefined()
			expect(mockReq.user?.user_id).toBe(user_id)
		})

		it('should return 401 for missing authorization header', () => {
			mockReq.headers = {}

			jwtMiddleware(mockReq as Request, mockRes as Response, mockNext)

			expect(mockRes.status).toHaveBeenCalledWith(401)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authorization header required' })
			expect(mockNext).not.toHaveBeenCalled()
		})

		it('should return 401 for invalid Bearer token format', () => {
			mockReq.headers = {
				authorization: 'InvalidFormat',
			}

			jwtMiddleware(mockReq as Request, mockRes as Response, mockNext)

			expect(mockRes.status).toHaveBeenCalledWith(401)
			expect(mockRes.json).toHaveBeenCalledWith({
				error: expect.stringContaining('Invalid or expired token'),
			})
			expect(mockNext).not.toHaveBeenCalled()
		})

		it('should return 401 for invalid token', () => {
			mockReq.headers = {
				authorization: 'Bearer invalid.token.here',
			}

			jwtMiddleware(mockReq as Request, mockRes as Response, mockNext)

			expect(mockRes.status).toHaveBeenCalledWith(401)
			expect(mockRes.json).toHaveBeenCalledWith({
				error: expect.stringContaining('Invalid or expired token'),
			})
			expect(mockNext).not.toHaveBeenCalled()
		})

		it('should work with token without Bearer prefix', () => {
			const user_id = 'test-user-123'
			const token = generateToken(user_id)

			mockReq.headers = {
				authorization: token,
			}

			jwtMiddleware(mockReq as Request, mockRes as Response, mockNext)

			expect(mockNext).toHaveBeenCalled()
			expect(mockReq.user).toBeDefined()
			expect(mockReq.user?.user_id).toBe(user_id)
		})
	})
})
