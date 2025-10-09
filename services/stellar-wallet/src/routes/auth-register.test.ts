import { verifyRegistrationResponse } from '@simplewebauthn/server'
import express from 'express'
import request from 'supertest'

// 🧩 Mock the database module BEFORE importing the router
jest.mock('../../src/db/kyc', () => ({
	connectDB: jest.fn(),
	closeDB: jest.fn(),
	initializeKycTable: jest.fn(),
	initializeCredentialsTable: jest.fn(),
	run: jest.fn(),
	all: jest.fn(),
	findKycById: jest.fn(),
}))

// 🧩 Mock @simplewebauthn/server
jest.mock('@simplewebauthn/server', () => ({
	verifyRegistrationResponse: jest.fn(),
}))

// 🧩 Import mocked functions
import {
	all,
	connectDB,
	findKycById,
	initializeCredentialsTable,
	initializeKycTable,
	run,
} from '../../src/db/kyc'

// 🧩 Import router AFTER mocking dependencies
import { authRegisterRouter } from '../../src/routes/auth-register'

// 🧩 Create Express app for testing
const app = express()
app.use(express.json())
app.use(authRegisterRouter)

// 🧩 Type helpers for better type safety
type DB = Awaited<ReturnType<typeof connectDB>>
const mockDb = {} as DB

// Cast all mocks to Jest mock types for autocomplete + type safety
const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>
const mockInitializeKycTable = initializeKycTable as jest.MockedFunction<typeof initializeKycTable>
const mockRun = run as jest.MockedFunction<typeof run>
const mockAll = all as jest.MockedFunction<typeof all>
const mockFindKycById = findKycById as jest.MockedFunction<typeof findKycById>
const mockVerifyRegistrationResponse = verifyRegistrationResponse as jest.MockedFunction<
	typeof verifyRegistrationResponse
>

describe('POST /auth/register', () => {
	beforeAll(async () => {
		mockConnectDB.mockResolvedValue(mockDb)
	})

	afterAll(async () => {
		jest.clearAllMocks()
	})

	beforeEach(() => {
		jest.clearAllMocks()
		mockConnectDB.mockResolvedValue(mockDb)
		mockInitializeKycTable.mockResolvedValue(undefined)
		const mockInitializeCredentialsTable = initializeCredentialsTable as jest.MockedFunction<
			typeof initializeCredentialsTable
		>
		mockInitializeCredentialsTable.mockResolvedValue(undefined)
		mockRun.mockResolvedValue(undefined)
		mockAll.mockResolvedValue([])
	})

	describe('POST /auth/register/options', () => {
		it('should return 400 if user_id is missing', async () => {
			const response = await request(app).post('/auth/register/options').send({})
			expect(response.status).toBe(400)
			expect(response.body.error).toBe('Missing required field: user_id')
		})

		it('should return 400 if user_id is not a string', async () => {
			const response = await request(app).post('/auth/register/options').send({ user_id: 123 })
			expect(response.status).toBe(400)
			expect(response.body.error).toBe('user_id must be a string')
		})

		it('should return 400 if user_id does not exist in kyc table', async () => {
			mockFindKycById.mockResolvedValue(null)
			const response = await request(app).post('/auth/register/options').send({ user_id: '999' })

			expect(response.status).toBe(400)
			expect(response.body.error).toBe('Invalid user ID')
			expect(mockFindKycById).toHaveBeenCalledWith(mockDb, 999)
		})

		it('should return 200 with registration options for valid user_id', async () => {
			mockFindKycById.mockResolvedValue({
				id: 1,
				name: 'John Doe',
				document: '123456',
				status: 'approved',
			})

			const response = await request(app).post('/auth/register/options').send({ user_id: '1' })

			expect(response.status).toBe(200)
			expect(response.body.user.id).toBe('1')
			expect(response.body.user.name).toBe('John Doe')
			expect(mockFindKycById).toHaveBeenCalledWith(mockDb, 1)
		})
	})

	describe('POST /auth/register/verify', () => {
		const mockRegistrationResponse = {
			id: 'mock-credential-id',
			rawId: 'mock-raw-id',
			response: {
				clientDataJSON: 'mock-client-data',
				attestationObject: 'mock-attestation',
			},
			type: 'public-key',
		}

		beforeEach(() => {
			jest.clearAllMocks()
		})

		it('should return 400 if user_id is missing', async () => {
			const response = await request(app)
				.post('/auth/register/verify')
				.send({ response: mockRegistrationResponse })
			expect(response.status).toBe(400)
			expect(response.body.error).toBe('Missing required fields: user_id and response')
		})

		it('should return 400 if response is missing', async () => {
			const response = await request(app).post('/auth/register/verify').send({ user_id: '1' })
			expect(response.status).toBe(400)
			expect(response.body.error).toBe('Missing required fields: user_id and response')
		})

		it('should return 400 if no challenge found for user', async () => {
			const response = await request(app).post('/auth/register/verify').send({
				user_id: '1',
				response: mockRegistrationResponse,
			})
			expect(response.status).toBe(400)
			expect(response.body.error).toBe('No registration challenge found for this user')
		})

		it('should return 400 if user_id does not exist in kyc table', async () => {
			mockFindKycById.mockResolvedValue({
				id: 999,
				name: 'Test User',
				document: '999999',
				status: 'approved',
			})

			await request(app).post('/auth/register/options').send({ user_id: '999' })
			mockFindKycById.mockResolvedValue(null)

			const response = await request(app).post('/auth/register/verify').send({
				user_id: '999',
				response: mockRegistrationResponse,
			})

			expect(response.status).toBe(400)
			expect(response.body.error).toBe('Invalid user ID')
		})

		it('should return 400 if WebAuthn verification fails', async () => {
			mockFindKycById.mockResolvedValue({
				id: 1,
				name: 'John Doe',
				document: '123456',
				status: 'approved',
			})

			await request(app).post('/auth/register/options').send({ user_id: '1' })
			mockVerifyRegistrationResponse.mockRejectedValue(new Error('Invalid signature'))

			const response = await request(app).post('/auth/register/verify').send({
				user_id: '1',
				response: mockRegistrationResponse,
			})

			expect(response.status).toBe(400)
			expect(response.body.error).toBe('Failed to verify WebAuthn response')
		})

		it('should return 400 if verification.verified is false', async () => {
			mockFindKycById.mockResolvedValue({
				id: 1,
				name: 'John Doe',
				document: '123456',
				status: 'approved',
			})

			await request(app).post('/auth/register/options').send({ user_id: '1' })
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			mockVerifyRegistrationResponse.mockResolvedValue({ verified: false } as any)

			const response = await request(app).post('/auth/register/verify').send({
				user_id: '1',
				response: mockRegistrationResponse,
			})

			expect(response.status).toBe(400)
			expect(response.body.error).toBe('Failed to register credentials')
		})

		it('should return 201 and store credentials on successful registration', async () => {
			mockFindKycById.mockResolvedValue({
				id: 1,
				name: 'John Doe',
				document: '123456',
				status: 'approved',
			})

			await request(app).post('/auth/register/options').send({ user_id: '1' })

			const mockCredentialID = new Uint8Array([1, 2, 3, 4, 5])
			const mockPublicKey = new Uint8Array([6, 7, 8, 9, 10])

			mockVerifyRegistrationResponse.mockResolvedValue({
				verified: true,
				registrationInfo: {
					credentialID: mockCredentialID,
					credentialPublicKey: mockPublicKey,
					counter: 0,
				},
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} as any)

			const response = await request(app).post('/auth/register/verify').send({
				user_id: '1',
				response: mockRegistrationResponse,
			})

			expect(response.status).toBe(201)
			expect(response.body.user_id).toBe('1')

			expect(mockRun).toHaveBeenCalledWith(
				mockDb,
				'INSERT INTO credentials (user_id, credential_id, public_key) VALUES (?, ?, ?)',
				[
					'1',
					Buffer.from(mockCredentialID).toString('base64'),
					Buffer.from(mockPublicKey).toString('base64'),
				],
			)
			expect(
				initializeCredentialsTable as jest.MockedFunction<typeof initializeCredentialsTable>,
			).toHaveBeenCalledWith(mockDb)
		})

		it('should return 400 if credential already exists (duplicate)', async () => {
			mockFindKycById.mockResolvedValue({
				id: 1,
				name: 'John Doe',
				document: '123456',
				status: 'approved',
			})

			await request(app).post('/auth/register/options').send({ user_id: '1' })

			const mockCredentialID = new Uint8Array([1, 2, 3, 4, 5])
			const mockPublicKey = new Uint8Array([6, 7, 8, 9, 10])

			mockVerifyRegistrationResponse.mockResolvedValue({
				verified: true,
				registrationInfo: {
					credentialID: mockCredentialID,
					credentialPublicKey: mockPublicKey,
					counter: 0,
				},
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} as any)

			mockRun.mockRejectedValue(new Error('UNIQUE constraint failed: credentials.credential_id'))

			const response = await request(app).post('/auth/register/verify').send({
				user_id: '1',
				response: mockRegistrationResponse,
			})

			expect(response.status).toBe(400)
			expect(response.body.error).toBe('Credential already registered')
		})
	})
})
