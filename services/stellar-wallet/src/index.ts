import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import envs from './config/envs'
import { kycRouter } from './routes/kyc'
import walletRouter from './routes/wallet'

export const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Routes
app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({ status: 'ok' })
})

app.post('/auth', (_req: Request, res: Response) => {
	res.status(200).json({})
})

app.use('/kyc', kycRouter)

app.use('/wallet', walletRouter)

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
