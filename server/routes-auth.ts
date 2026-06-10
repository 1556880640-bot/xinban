import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { generateToken, authMiddleware, AuthRequest } from './auth'
import { dbRun, dbGet, dbAll } from './database-pg'

const router = Router()

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// POST /api/auth/register
router.post('/register', async (req: AuthRequest, res: Response) => {
  const { username, password, email, inviteCode } = req.body

  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' })
    return
  }
  if (username.length < 2 || username.length > 20) {
    res.status(400).json({ error: '用户名长度需在2-20个字符之间' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: '密码长度至少6位' })
    return
  }

  try {
    const existing = await dbGet('SELECT id FROM users WHERE username = $1', username)
    if (existing) {
      res.status(409).json({ error: '用户名已被使用' })
      return
    }

    const id = uuid()
    const passwordHash = bcrypt.hashSync(password, 10)
    const userInviteCode = generateInviteCode()

    let invitedBy: string | null = null
    if (inviteCode) {
      const inviter = await dbGet<{ id: string }>('SELECT id FROM users WHERE invite_code = $1', inviteCode)
      if (inviter) invitedBy = inviter.id
    }

    const trialEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    await dbRun(
      `INSERT INTO users (id, username, password_hash, email, invite_code, invited_by, trial_ends_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      id, username, passwordHash, email || null, userInviteCode, invitedBy, trialEndsAt
    )

    const token = generateToken(id)

    res.status(201).json({
      token,
      user: {
        id, username, inviteCode: userInviteCode,
        subscriptionTier: 'free', trialEndsAt,
      }
    })
  } catch (err: any) {
    console.error('Register error:', err)
    res.status(500).json({ error: '注册失败' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response) => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' })
    return
  }

  try {
    const user = await dbGet<any>('SELECT * FROM users WHERE username = $1', username)
    if (!user) {
      res.status(401).json({ error: '用户名或密码错误' })
      return
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: '用户名或密码错误' })
      return
    }

    const token = generateToken(user.id)

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        inviteCode: user.invite_code,
        invitedBy: user.invited_by,
        subscriptionTier: user.subscription_tier,
        subscriptionExpiresAt: user.subscription_expires_at,
        trialEndsAt: user.trial_ends_at,
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: '登录失败' })
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await dbGet<any>('SELECT * FROM users WHERE id = $1', req.userId!)
    if (!user) {
      res.status(404).json({ error: '用户不存在' })
      return
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      inviteCode: user.invite_code,
      invitedBy: user.invited_by,
      subscriptionTier: user.subscription_tier,
      subscriptionExpiresAt: user.subscription_expires_at,
      trialEndsAt: user.trial_ends_at,
      createdAt: user.created_at,
    })
  } catch (err) {
    console.error('GetMe error:', err)
    res.status(500).json({ error: '获取用户信息失败' })
  }
})

// POST /api/auth/invite
router.post('/invite', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { inviteCode } = req.body

  if (!inviteCode) {
    res.status(400).json({ error: '请输入邀请码' })
    return
  }

  try {
    const user = await dbGet<any>('SELECT * FROM users WHERE id = $1', req.userId!)
    if (user.invited_by) {
      res.status(400).json({ error: '你已经填写过邀请码了' })
      return
    }

    const inviter = await dbGet<{ id: string }>('SELECT id FROM users WHERE invite_code = $1', inviteCode)
    if (!inviter) {
      res.status(400).json({ error: '邀请码无效' })
      return
    }
    if (inviter.id === req.userId) {
      res.status(400).json({ error: '不能邀请自己' })
      return
    }

    await dbRun('UPDATE users SET invited_by = $1 WHERE id = $2', inviter.id, req.userId!)

    const countResult = await dbGet<{ count: string }>(
      'SELECT COUNT(*) as count FROM users WHERE invited_by = $1', inviter.id
    )
    const invitedCount = parseInt(countResult!.count)

    if (invitedCount >= 3 && invitedCount % 3 === 0) {
      const currentExpiry = await dbGet<{ subscription_expires_at: string }>(
        'SELECT subscription_expires_at FROM users WHERE id = $1', inviter.id
      )
      const baseDate = currentExpiry?.subscription_expires_at
        ? new Date(currentExpiry.subscription_expires_at)
        : new Date()
      if (baseDate < new Date()) baseDate.setTime(Date.now())
      const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()

      await dbRun(
        'UPDATE users SET subscription_tier = $1, subscription_expires_at = $2 WHERE id = $3',
        'premium', newExpiry, inviter.id
      )
    }

    res.json({ success: true, message: '邀请码已激活' })
  } catch (err) {
    console.error('Invite error:', err)
    res.status(500).json({ error: '激活邀请码失败' })
  }
})

// GET /api/auth/invite-stats
router.get('/invite-stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await dbGet<{ count: string }>(
      'SELECT COUNT(*) as count FROM users WHERE invited_by = $1', req.userId!
    )
    res.json({ count: parseInt(result!.count) })
  } catch (err) {
    res.status(500).json({ error: '获取邀请统计失败' })
  }
})

export default router
