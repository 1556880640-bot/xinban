import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authMiddleware, AuthRequest } from './auth'
import { dbRun, dbGet, dbAll } from './database-pg'

const router = Router()

const uploadDir = process.env.UPLOAD_DIR || './uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    cb(null, `${uuid()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.txt', '.csv', '.json', '.html', '.htm']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('仅支持 txt、csv、json、html 格式的聊天记录文件'))
    }
  }
})

function parseChatContent(content: string): {
  participants: string[]
  messages: { sender: string; content: string; timestamp?: string }[]
} {
  const participants = new Set<string>()
  const messages: { sender: string; content: string; timestamp?: string }[] = []

  const lines = content.split('\n')
  const wxPattern = /^(\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?)\s+(.+?)[:：]\s*(.+)$/
  const altPattern = /^(.+?)\s+(\d{1,2}[:：]\d{2}(?::\d{2})?)[\s]+(.+)$/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    let match = line.match(wxPattern)
    if (match) {
      participants.add(match[2].trim())
      messages.push({ sender: match[2].trim(), content: match[3].trim(), timestamp: match[1] })
      continue
    }
    match = line.match(altPattern)
    if (match) {
      participants.add(match[1].trim())
      messages.push({ sender: match[1].trim(), content: match[3].trim(), timestamp: match[2] })
      continue
    }
  }

  return { participants: Array.from(participants), messages }
}

function generatePersona(targetPerson: string, messages: { sender: string; content: string; timestamp?: string }[]): {
  personality: string; memories: string; quotes: string; places: string; gamesMemes: string; sleepPattern: string
} {
  const personMessages = messages.filter(m => m.sender === targetPerson)
  const totalMsgs = personMessages.length

  const quoteCandidates = personMessages.filter(m => m.content.length > 8 && m.content.length < 100).slice(0, 10)
  const quotes = quoteCandidates.map(m => m.content).slice(0, 5).join('；')

  const hours: number[] = []
  personMessages.forEach(m => {
    if (m.timestamp) {
      const h = new Date(m.timestamp).getHours()
      if (h >= 6 && h <= 23) hours.push(h)
    }
  })
  const avgHour = hours.length > 0 ? Math.round(hours.reduce((a, b) => a + b, 0) / hours.length) : 12
  const wakeTime = avgHour > 8 ? `${avgHour - 2}:00` : '6:00'
  const sleepTime = avgHour < 22 ? `${avgHour + 2}:00` : '23:00'
  const sleepPattern = `通常 ${wakeTime} 起床，${sleepTime} 左右休息`

  const contentLengths = personMessages.map(m => m.content.length)
  const avgContentLength = contentLengths.length > 0
    ? contentLengths.reduce((a, b) => a + b, 0) / contentLengths.length : 0

  const hasEmoji = personMessages.some(m => /\p{Extended_Pictographic}/u.test(m.content))
  const usesPunctuation = personMessages.filter(m => /[。！？，、]/.test(m.content)).length / Math.max(totalMsgs, 1)
  const questioningCount = personMessages.filter(m => m.content.includes('？') || m.content.includes('?')).length / Math.max(totalMsgs, 1)

  let personality = ''
  if (avgContentLength < 15) personality += '说话简洁明了，不喜欢长篇大论。'
  else if (avgContentLength > 40) personality += '说话比较细致，喜欢把事情讲得很清楚。'
  else personality += '说话风格平和适中，不啰嗦也不敷衍。'

  if (hasEmoji) personality += '喜欢用表情符号表达情感。'
  if (usesPunctuation > 0.7) personality += '说话习惯用标点，比较正式。'
  if (questioningCount > 0.3) personality += '很关心对方，经常问问题。'

  return {
    personality: personality || '温柔体贴，关心他人',
    memories: `从 ${totalMsgs} 条消息中提取的记忆。你们经常聊天，TA 的作息大约是：${sleepPattern}。`,
    quotes: quotes || '（从聊天记录中提取的典型话语）',
    places: '（从聊天记录中分析可能去过的地方）',
    gamesMemes: '（从聊天记录中提取的共同爱好和梗）',
    sleepPattern,
  }
}

// POST /api/echoes/upload
router.post('/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: '请上传聊天记录文件' })
    return
  }

  const content = fs.readFileSync(req.file.path, 'utf-8')
  const parsed = parseChatContent(content)
  fs.unlinkSync(req.file.path)

  res.json({ participants: parsed.participants, messageCount: parsed.messages.length })
})

// POST /api/echoes/create
router.post('/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, targetPerson, chatContent } = req.body

  if (!name || !targetPerson) {
    res.status(400).json({ error: '请填写必要信息' })
    return
  }

  const parsed = parseChatContent(chatContent || '')
  const persona = generatePersona(targetPerson, parsed.messages)

  const id = uuid()
  await dbRun(
    `INSERT INTO echoes (id, user_id, name, target_person, personality, memories, quotes, places, games_memes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    id, req.userId!, name, targetPerson, persona.personality, persona.memories,
    persona.quotes, persona.places, persona.gamesMemes
  )

  await dbRun('INSERT INTO echo_settings (echo_id) VALUES ($1)', id)

  res.status(201).json({ id, name, targetPerson, ...persona })
})

// PUT /api/echoes/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { personality, memories, quotes, places, gamesMemes, name } = req.body
  const echoId = req.params.id

  const echo = await dbGet<any>('SELECT * FROM echoes WHERE id = $1 AND user_id = $2', echoId, req.userId!)
  if (!echo) {
    res.status(404).json({ error: '回声不存在' })
    return
  }

  const fields: string[] = []
  const values: any[] = []
  let idx = 1

  for (const [key, val] of Object.entries({ personality, memories, quotes, places, games_memes: gamesMemes, name })) {
    if (val !== undefined) {
      fields.push(`${key} = $${idx++}`)
      values.push(val)
    }
  }

  if (fields.length > 0) {
    fields.push(`updated_at = NOW()`)
    values.push(echoId)
    await dbRun(`UPDATE echoes SET ${fields.join(', ')} WHERE id = $${idx}`, ...values)
  }

  res.json({ success: true })
})

// GET /api/echoes
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const echoes = await dbAll(`
    SELECT e.*,
      (SELECT content FROM messages WHERE echo_id = e.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages WHERE echo_id = e.id ORDER BY created_at DESC LIMIT 1) as last_message_time
    FROM echoes e
    WHERE e.user_id = $1
    ORDER BY e.created_at DESC
  `, req.userId!)

  res.json(echoes)
})

// GET /api/echoes/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const echo = await dbGet<any>('SELECT * FROM echoes WHERE id = $1 AND user_id = $2', req.params.id, req.userId!)
  if (!echo) {
    res.status(404).json({ error: '回声不存在' })
    return
  }

  const settings = await dbGet('SELECT * FROM echo_settings WHERE echo_id = $1', req.params.id)
  res.json({ ...echo, settings })
})

// DELETE /api/echoes/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const result = await dbGet<{ count?: number }>(
    'DELETE FROM echoes WHERE id = $1 AND user_id = $2', req.params.id, req.userId!
  )
  // Check if deleted — since pg doesn't return changes count easily, try a query
  const check = await dbGet('SELECT id FROM echoes WHERE id = $1', req.params.id)
  if (check) {
    res.status(404).json({ error: '回声不存在' })
    return
  }
  res.json({ success: true })
})

export default router
