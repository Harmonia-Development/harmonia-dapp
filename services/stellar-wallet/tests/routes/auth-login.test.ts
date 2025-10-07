import type { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import { app } from '../../src/index'

// Mock the WebAuthn module
jest.mock('../../src/auth/webauthn', () => ({
	verifyWebAuthnAuthentication: jest.fn(),
	getUserCredentials: jest.fn(),
}))

// Mock the JWT module
jest.mock('../../src/auth/jwt', () => ({
	generateToken: jest.fn(),
	jwtMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
}))

import { generateToken } from '../../src/auth/jwt'
import { getUserCredentials, verifyWebAuthnAuthentication } from '../../src/auth/webauthn'

const mockVerifyWebAuthnAuthentication = verifyWebAuthnAuthentication as jest.MockedFunction<
	typeof verifyWebAuthnAuthentication
>
const mockGetUserCredentials = getUserCredentials as jest.MockedFunction<typeof getUserCredentials>
const mockGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>

describe('POST /auth/login', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should successfully authenticate user and return JWT token', async () => {
		const mockToken = 'mock-jwt-token-123'
		const mockCredentials = [
			{
				id: 'credential-1',
				publicKey: 'mock-public-key',
				user_id: 'test-user',
				counter: 1,
			},
		]

		mockGetUserCredentials.mockResolvedValue(mockCredentials)
		mockVerifyWebAuthnAuthentication.mockResolvedValue(true)
		mockGenerateToken.mockReturnValue(mockToken)

		const requestBody = {
			user_id: 'test-user',
			auth_response: {
				id: 'credential-1',
				rawId: 'raw-credential-id',
				response: {
					authenticatorData: 'auth-data',
					clientDataJSON: 'client-data',
					signature: 'signature-data',
				},
				type: 'public-key' as const,
			},
		}

		const response = await request(app).post('/auth/login').send(requestBody).expect(200)

		expect(response.body).toHaveProperty('token', mockToken)
		expect(response.body).toHaveProperty('user_id', 'test-user')
		expect(response.body).toHaveProperty('role', 'user')

		expect(mockGetUserCredentials).toHaveBeenCalledWith('test-user')
		expect(mockVerifyWebAuthnAuthentication).toHaveBeenCalledWith(
			'test-user',
			requestBody.auth_response,
			mockCredentials,
		)
		expect(mockGenerateToken).toHaveBeenCalledWith('test-user', 'user')
	})

	it('should return 400 for missing user_id', async () => {
		const requestBody = {
			auth_response: {
				id: 'credential-1',
				response: { signature: 'signature' },
			},
		}

		const response = await request(app).post('/auth/login').send(requestBody).expect(400)

		expect(response.body).toHaveProperty('error', 'user_id is required and must be a string')
	})

	it('should return 400 for missing auth_response', async () => {
		const requestBody = {
			user_id: 'test-user',
		}

		const response = await request(app).post('/auth/login').send(requestBody).expect(400)

		expect(response.body).toHaveProperty('error', 'auth_response is required and must be an object')
	})

	it('should return 400 for invalid auth_response format', async () => {
		const requestBody = {
			user_id: 'test-user',
			auth_response: {
				id: 'credential-1',
				// missing response.signature
			},
		}

		const response = await request(app).post('/auth/login').send(requestBody).expect(400)

		expect(response.body).toHaveProperty('error', 'Invalid WebAuthn authentication response format')
	})

	it('should return 401 when no credentials found for user', async () => {
		mockGetUserCredentials.mockResolvedValue([])

		const requestBody = {
			user_id: 'test-user',
			auth_response: {
				id: 'credential-1',
				response: { signature: 'signature' },
			},
		}

		const response = await request(app).post('/auth/login').send(requestBody).expect(401)

		expect(response.body).toHaveProperty('error', 'No credentials found for user')
	})

	it('should return 401 when WebAuthn verification fails', async () => {
		const mockCredentials = [
			{
				id: 'credential-1',
				publicKey: 'mock-public-key',
				user_id: 'test-user',
				counter: 1,
			},
		]

		mockGetUserCredentials.mockResolvedValue(mockCredentials)
		mockVerifyWebAuthnAuthentication.mockResolvedValue(false)

		const requestBody = {
			user_id: 'test-user',
			auth_response: {
				id: 'credential-1',
				response: { signature: 'signature' },
			},
		}

		const response = await request(app).post('/auth/login').send(requestBody).expect(401)

		expect(response.body).toHaveProperty('error', 'WebAuthn authentication failed')
	})

	it('should return 500 when an unexpected error occurs', async () => {
		mockGetUserCredentials.mockRejectedValue(new Error('Database error'))

		const requestBody = {
			user_id: 'test-user',
			auth_response: {
				id: 'credential-1',
				response: { signature: 'signature' },
			},
		}

		const response = await request(app).post('/auth/login').send(requestBody).expect(500)

		expect(response.body).toHaveProperty('error', 'Authentication failed')
	})
})
