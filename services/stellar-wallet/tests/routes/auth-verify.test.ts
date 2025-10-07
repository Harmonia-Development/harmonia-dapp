import express from 'express'
import request from 'supertest'
import { authVerifyRouter } from '../../src/routes/auth-verify'

jest.mock('../../src/db/kyc')
jest.mock('../../src/auth/webauthn')

const mockConnectDB = jest.fn()
const mockFindKycById = jest.fn()
const mockFindCredentialsByKycId = jest.fn()
const mockInitializeCredentialsTable = jest.fn()
const mockVerifyAuthResponse = jest.fn()

require('../../src/db/kyc').connectDB = mockConnectDB
require('../../src/db/kyc').findKycById = mockFindKycById
require('../../src/db/kyc').findCredentialsByKycId = mockFindCredentialsByKycId
require('../../src/db/kyc').initializeCredentialsTable = mockInitializeCredentialsTable
require('../../src/auth/webauthn').verifyAuthResponse = mockVerifyAuthResponse

describe('POST /auth/verify', () => {
	let app: express.Express

	beforeEach(() => {
		app = express()
		app.use(express.json())
		app.use('/auth/verify', authVerifyRouter)
		jest.clearAllMocks()
		mockConnectDB.mockResolvedValue({})
		mockInitializeCredentialsTable.mockResolvedValue(undefined)
	})

	const validRequestBody = {
		user_id: '1',
		response: {
			id: 'test-credential-id',
			rawId: 'dGVzdC1jcmVkZW50aWFsLWlk',
			response: {
				authenticatorData: 'SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MFAAAAAA',
				clientDataJSON:
					'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiZXhhbXBsZS1jaGFsbGVuZ2UifQ',
				signature:
					'MEUCIQDTGVxqGU8N7eEj8Z_kFQOJQJcRQJQJQJQJQJQJQJQJQIgYQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ',
			},
			type: 'public-key' as const,
		},
		challenge: 'example-challenge',
	}

	const mockUser = {
		id: 1,
		name: 'John Doe',
		document: 'ID123456',
		status: 'approved',
	}

	const mockCredential = {
		id: 1,
		kyc_id: 1,
		credential_id: 'test-credential-id',
		public_key: 'mock-public-key',
		counter: 0,
		created_at: '2024-01-01T00:00:00Z',
	}

	describe('successful verification', () => {
		it('should return 200 with verified: true for valid credentials', async () => {
			mockFindKycById.mockResolvedValue(mockUser)
			mockFindCredentialsByKycId.mockResolvedValue([mockCredential])
			mockVerifyAuthResponse.mockResolvedValue({
				verified: true,
				credentialID: 'test-credential-id',
			})

			const response = await request(app).post('/auth/verify').send(validRequestBody).expect(200)

			expect(response.body).toEqual({
				user_id: '1',
				verified: true,
				message: 'Authentication successful',
			})
		})
	})

	describe('validation errors', () => {
		it('should return 400 for missing user_id', async () => {
			const invalidBody = {
				response: validRequestBody.response,
				challenge: validRequestBody.challenge,
			}

			const response = await request(app).post('/auth/verify').send(invalidBody).expect(400)

			expect(response.body.error).toBe('Invalid request data')
		})

		it('should return 400 for invalid user_id format', async () => {
			const invalidBody = { ...validRequestBody, user_id: 'invalid' }

			const response = await request(app).post('/auth/verify').send(invalidBody).expect(400)

			expect(response.body.error).toBe('Invalid user ID format')
		})
	})

	describe('authentication errors', () => {
		it('should return 400 for non-existent user', async () => {
			mockFindKycById.mockResolvedValue(null)

			const response = await request(app).post('/auth/verify').send(validRequestBody).expect(400)

			expect(response.body.error).toBe('Invalid user ID')
		})

		it('should return 401 for user with no credentials', async () => {
			mockFindKycById.mockResolvedValue(mockUser)
			mockFindCredentialsByKycId.mockResolvedValue([])

			const response = await request(app).post('/auth/verify').send(validRequestBody).expect(401)

			expect(response.body.error).toBe('No credentials found for user')
		})

		it('should return 401 for failed WebAuthn verification', async () => {
			mockFindKycById.mockResolvedValue(mockUser)
			mockFindCredentialsByKycId.mockResolvedValue([mockCredential])
			mockVerifyAuthResponse.mockResolvedValue({ verified: false })

			const response = await request(app).post('/auth/verify').send(validRequestBody).expect(401)

			expect(response.body.error).toBe('Authentication failed')
		})
	})

	describe('server errors', () => {
		it('should return 500 for database connection errors', async () => {
			mockConnectDB.mockRejectedValue(new Error('Database connection failed'))

			const _response = await request(app).post('/auth/verify').send(validRequestBody).expect(500)
		})
	})
})
