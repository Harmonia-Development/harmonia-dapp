import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import envs from './config/envs'
import { authLimiter, kycLimiter, walletLimiter } from './middlewares/rate-limit'
import { authLoginRouter } from './routes/auth-login'
import { kycRouter } from './routes/kyc'
import { kycVerifyRouter } from './routes/kyc-verify'
import { walletRouter } from './routes/wallet'
import { webauthnRegisterRouter } from './routes/webauthn-register'
import { webauthnAuthenticateRouter } from './routes/webauthn-authenticate'
import { initializeDatabase } from './db/init'

export const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

initializeDatabase()
	.then(() => {
		console.log('Database initialized successfully')
	})
	.catch((err) => {
		console.error('Failed to initialize database:', err)
		process.exit(1)
	})

// Routes
app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({ status: 'ok' })
})

app.post('/auth', authLimiter, (_req: Request, res: Response) => {
	res.status(200).json({})
})

app.use('/api/webauthn', authLimiter, webauthnRegisterRouter)
app.use('/api/webauthn', authLimiter, webauthnAuthenticateRouter)

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
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error('Internal server error:', err)
	res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(envs.PORT, () => {
	console.log(`🚀 Server running at http://localhost:${envs.PORT}`)
})
