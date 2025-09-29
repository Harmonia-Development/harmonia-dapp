import { generateToken } from '../../src/auth/jwt'

/**
 * Mock authentication helper for tests
 * Provides utilities to generate valid JWT tokens for testing protected routes
 */

export interface MockUser {
	user_id: string
	role?: string
}

/**
 * Generates a valid JWT token for testing
 * @param user - User information for the token
 * @returns JWT token string
 */
export const createMockToken = (user: MockUser = { user_id: 'test-user' }): string => {
	return generateToken(user.user_id, user.role || 'user')
}

/**
 * Creates authorization header with Bearer token
 * @param user - User information for the token
 * @returns Authorization header object
 */
export const createAuthHeader = (user: MockUser = { user_id: 'test-user' }) => {
	const token = createMockToken(user)
	return {
		Authorization: `Bearer ${token}`,
	}
}

/**
 * Creates a request with authentication headers
 * @param user - User information for the token
 * @returns Headers object with Authorization
 */
export const withAuth = (user: MockUser = { user_id: 'test-user' }) => {
	return createAuthHeader(user)
}

/**
 * Default test user for consistent testing
 */
export const DEFAULT_TEST_USER: MockUser = {
	user_id: 'test-user-123',
	role: 'user',
}

/**
 * Admin test user for role-based testing
 */
export const ADMIN_TEST_USER: MockUser = {
	user_id: 'admin-user-456',
	role: 'admin',
}
