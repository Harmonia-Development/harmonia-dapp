import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import envs from './config/envs'
import { logError, logger, loggerMiddleware } from './middlewares/logger'
import { authLimiter, kycLimiter, walletLimiter } from './middlewares/rate-limit'
import { authLoginRouter } from './routes/auth-login'
import { authVerifyRouter } from './routes/auth-verify'
import { kycRouter } from './routes/kyc'
import { kycVerifyRouter } from './routes/kyc-verify'
import { walletRouter } from './routes/wallet'

export const app = express()

// Middlewares
app.use(loggerMiddleware)
app.use(cors())
app.use(express.json())

// Routes
app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({ status: 'ok' })
})

app.post('/auth', authLimiter, (_req: Request, res: Response) => {
	res.status(200).json({})
})

app.use('/auth/verify', authLimiter, authVerifyRouter)

// Mount auth login routes
app.use('/auth', authLoginRouter)

// Protected routes - require JWT authentication
app.use('/kyc', kycLimiter, kycRouter)
app.use('/kyc', kycLimiter, kycVerifyRouter)

app.use('/wallet', walletLimiter, walletRouter)

// 404 Not Found Handler
app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: 'Not found' })
})

// 500 Error Handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
	logError(err, { route: req.originalUrl ?? req.url })
	res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(envs.PORT, () => {
	logger.info({ message: 'server_started', port: envs.PORT })
})
