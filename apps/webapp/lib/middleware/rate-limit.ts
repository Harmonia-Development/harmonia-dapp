// Simple rate limiter for dev
// TODO: Use Redis for production

interface RateLimitStore {
	[key: string]: {
		count: number
		resetTime: number
	}
}

const store: RateLimitStore = {}

export class RateLimiter {
	private windowMs: number
	private maxRequests: number

	constructor(windowMs = 60000, maxRequests = 100) {
		this.windowMs = windowMs
		this.maxRequests = maxRequests
	}

	check(key: string): {
		allowed: boolean
		remaining: number
		resetTime: number
	} {
		const now = Date.now()
		const record = store[key]

		if (!record || now > record.resetTime) {
			// New window or expired
			store[key] = {
				count: 1,
				resetTime: now + this.windowMs,
			}
			return {
				allowed: true,
				remaining: this.maxRequests - 1,
				resetTime: now + this.windowMs,
			}
		}

		if (record.count >= this.maxRequests) {
			return {
				allowed: false,
				remaining: 0,
				resetTime: record.resetTime,
			}
		}

		record.count++
		return {
			allowed: true,
			remaining: this.maxRequests - record.count,
			resetTime: record.resetTime,
		}
	}

	reset(key: string): void {
		delete store[key]
	}
}

// Default instances - adjust as needed
export const apiRateLimiter = new RateLimiter(60000, 100)
export const authRateLimiter = new RateLimiter(300000, 5) // 5 min window, 5 requests
export const proposalRateLimiter = new RateLimiter(60000, 10)
