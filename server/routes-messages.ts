import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { authMiddleware, AuthRequest } from './auth'
import { chat } from './ai'
import { dbRun, dbGet, dbAll } from './database-pg'

const router = Router()

// GET /api/messages/:echoId
router.get('/:echoId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { echoId } = req.params

  const echo = await dbGet('SELECT * FROM echoes WHERE id = $1 AND user_id = $2', echoId, req.userId!)
  if (!echo) {
    res.status(404).json({ error: '回声不存在' })
    return
  }

  const messages = await dbAll(
    `SELECT * FROM messages WHERE echo_id = $1 AND user_id = $2 ORDER BY created_at ASC, segment_index ASC`,
    echoId, req.userId!
  )

  res.json(messages)
})

// POST /api/messages/:echoId
router.post('/:echoId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { echoId } = req.params
  const { content } = req.body

  if (!content || !content.trim()) {
    res.status(400).json({ error: '消息不能为空' })
    return
  }

  const echo = await dbGet<any>('SELECT * FROM echoes WHERE id = $1 AND user_id = $2', echoId, req.userId!)
  if (!echo) {
    res.status(404).json({ error: '回声不存在' })
    return
  }

  const settings = await dbGet<any>('SELECT * FROM echo_settings WHERE echo_id = $1', echoId)

  // Save user message
  const userMsgId = uuid()
  await dbRun(
    "INSERT INTO messages (id, echo_id, user_id, role, content) VALUES ($1, $2, $3, 'user', $4)",
    userMsgId, echoId, req.userId!, content.trim()
  )

  // Check silent mode
  if (settings?.silent_mode) {
    res.json({ userMessage: { id: userMsgId, content: content.trim() }, aiResponses: [] })
    return
  }

  // Check skip reply mode
  if (settings?.skip_reply_mode && Math.random() < 0.3) {
    res.json({ userMessage: { id: userMsgId, content: content.trim() }, aiResponses: [] })
    return
  }

  // Get history
  const history = await dbAll<{ role: string; content: string }>(
    'SELECT role, content FROM messages WHERE echo_id = $1 ORDER BY created_at DESC LIMIT 20',
    echoId
  )

  // Call AI
  const responses = await chat(
    {
      personality: echo.personality,
      memories: echo.memories,
      quotes: echo.quotes,
      places: echo.places,
      gamesMemes: echo.games_memes,
      name: echo.name,
      targetPerson: echo.target_person,
    },
    history,
    content
  )

  // Save AI messages
  const savedResponses = []
  for (let i = 0; i < responses.length; i++) {
    const segment = responses[i]
    const msgId = uuid()
    const delay = settings?.delay_reply_enabled
      ? (settings.delay_seconds_min || 3) + Math.floor(Math.random() * ((settings.delay_seconds_max || 15) - (settings.delay_seconds_min || 3)))
      : 0

    await dbRun(
      "INSERT INTO messages (id, echo_id, user_id, role, content, segment_index, total_segments) VALUES ($1, $2, $3, 'assistant', $4, $5, $6)",
      msgId, echoId, req.userId!, segment, i, responses.length
    )

    savedResponses.push({ id: msgId, content: segment, delay, segmentIndex: i, totalSegments: responses.length })
  }

  res.json({
    userMessage: { id: userMsgId, content: content.trim() },
    aiResponses: savedResponses,
  })
})

export default router
