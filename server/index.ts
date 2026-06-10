import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import authRoutes from './routes-auth'
import echoRoutes from './routes-echoes'
import messageRoutes from './routes-messages'
import contestRoutes from './routes-contest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/echoes', echoRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/contest', contestRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Serve static frontend in production
const frontendDist = path.join(__dirname, '..', 'dist')
app.use(express.static(frontendDist))
app.use((_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`心伴服务器已启动: http://localhost:${PORT}`)
  console.log(`API: http://localhost:${PORT}/api/health`)
})
