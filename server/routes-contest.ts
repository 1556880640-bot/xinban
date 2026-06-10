import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { authMiddleware, AuthRequest } from './auth'
import { dbRun, dbAll } from './database-pg'

const router = Router()

// POST /api/contest/submit
router.post('/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { url, platform } = req.body

  if (!url || !platform) {
    res.status(400).json({ error: '请填写作品链接和发布平台' })
    return
  }

  const id = uuid()
  await dbRun(
    'INSERT INTO contest_submissions (id, user_id, url, platform) VALUES ($1, $2, $3, $4)',
    id, req.userId!, url, platform
  )

  res.status(201).json({ success: true, id })
})

// GET /api/contest/my-submissions
router.get('/my-submissions', authMiddleware, async (req: AuthRequest, res: Response) => {
  const submissions = await dbAll(
    'SELECT * FROM contest_submissions WHERE user_id = $1 ORDER BY created_at DESC',
    req.userId!
  )
  res.json(submissions)
})

export default router
