import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import envs from '../config/envs'

export interface JwtPayload {
	user_id: string
	role: string
	iat?: number
	exp?: number
}

/**
 * Generates a JWT token with user_id and role claims
 * @param user_id - The user identifier
 * @param role - The user role (defaults to 'user')
 * @returns JWT token string
 */
export const generateToken = (user_id: string, role = 'user'): string => {
	const payload: JwtPayload = {
		user_id,
		role,
	}

	return jwt.sign(payload, envs.JWT_SECRET, {
		expiresIn: '24h',
		algorithm: 'HS256',
	})
}

/**
 * Verifies and decodes a JWT token
 * @param token - The JWT token to verify
 * @returns Decoded JWT payload
 * @throws Error if token is invalid or expired
 */
export const verifyToken = (token: string): JwtPayload => {
	try {
		const decoded = jwt.verify(token, envs.JWT_SECRET) as JwtPayload
		return decoded
	} catch (error) {
		throw new Error(`Invalid or expired token: ${error}`)
	}
}

/**
 * Express middleware to validate JWT tokens in Authorization header
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const jwtMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	const authHeader = req.headers.authorization

	if (!authHeader) {
		res.status(401).json({ error: 'Authorization header required' })
		return
	}

	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

	if (!token) {
		res.status(401).json({ error: 'Bearer token required' })
		return
	}

	try {
		const decoded = verifyToken(token)
		req.user = decoded
		next()
	} catch (error) {
		res.status(401).json({ error: `Invalid or expired token: ${error}` })
	}
}

// Extend Express Request interface to include user
declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload
		}
	}
}
