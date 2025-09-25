import rateLimit from 'express-rate-limit'

const rateLimitWindowMs = process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000
const rateLimitMax = process.env.RATE_LIMIT_MAX || 100

function createLimiter(windowMs?: number, max?: number, message?: string) {
	return rateLimit({
		windowMs: windowMs ? windowMs : Number.parseInt(String(rateLimitWindowMs)),
		max: max ? max : Number.parseInt(String(rateLimitMax)),
		standardHeaders: true,
		legacyHeaders: false,
		message: message || 'Too many requests, please try again later.',
	})
}

export const kycLimiter = createLimiter(
	15 * 60 * 1000,
	10,
	'Too many KYC submissions from this IP, please try again after 15 minutes.',
)

export const authLimiter = createLimiter(
	15 * 60 * 1000,
	5,
	'Too many authentication attempts, please try again in 15 minutes.',
)

export const walletLimiter = createLimiter(1 * 60 * 1000, 10)
