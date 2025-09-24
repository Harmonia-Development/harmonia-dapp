import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

// TODO: maybe use a proper validation library later
interface JWTPayload {
	user_id: number
	iat?: number
	exp?: number
}

declare global {
	namespace Express {
		interface Request {
			user?: JWTPayload
		}
	}
}

export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Unauthorized' })
		return
	}

	const token = authHeader.split(' ')[1]
	// FIXME: this probably needs better validation
	if (!token) {
		res.status(401).json({ error: 'Unauthorized' })
		return
	}

	try {
		const jwtSecret = process.env.JWT_SECRET
		if (!jwtSecret) {
			res.status(500).json({ error: 'Internal server error' })
			return
		}
		const decoded = jwt.verify(token, jwtSecret) as JWTPayload

		// Quick validation - just check if user_id exists and is a number
		if (!decoded.user_id || typeof decoded.user_id !== 'number') {
			res.status(401).json({ error: 'Unauthorized' })
			return
		}

		req.user = decoded
		next()
	} catch (err) {
		console.log('JWT error:', err) // quick debug
		res.status(401).json({ error: 'Unauthorized' })
	}
}

// Check if user can access this user_id resource
export function requireMatchingUserId(req: Request, res: Response, next: NextFunction) {
	// Should already be authenticated at this point
	if (!req.user) {
		res.status(401).json({ error: 'Unauthorized' })
		return
	}

	const requestedUserId = req.body?.user_id
	if (requestedUserId !== req.user.user_id) {
		res.status(403).json({ error: 'Forbidden' })
		return
	}

	next()
}
