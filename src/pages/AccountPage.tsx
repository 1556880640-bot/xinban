import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check, Gift, Users, Crown, Clock, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { auth as authApi } from '@/lib/api'
import AppNav from '@/components/AppNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [copied, setCopied] = useState(false)
  const [inputCode, setInputCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [inviteStats, setInviteStats] = useState<{ count: number }>({ count: 0 })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) loadInviteStats()
  }, [user])

  const loadInviteStats = async () => {
    try {
      const stats = await authApi.getInviteStats()
      setInviteStats(stats)
    } catch { /*  */ }
  }

  const handleCopy = () => {
    if (!user?.inviteCode) return
    navigator.clipboard.writeText(user.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitCode = async () => {
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await authApi.submitInviteCode(inputCode)
      setSuccess('邀请码已激活！')
      setInputCode('')
      loadInviteStats()
    } catch (err: any) {
      setError(err.message || '激活失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!user) {
    navigate('/auth')
    return null
  }

  const trialEnd = user.trialEndsAt ? new Date(user.trialEndsAt) : null
  const trialLeft = trialEnd && trialEnd > new Date()
    ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0
  const isPremium = user.subscriptionTier === 'premium'
  const expiresAt = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Subscription status */}
        <div className="p-6 rounded-2xl bg-card/50 border border-border/50 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">订阅状态</h2>
              <p className="text-sm text-muted-foreground">
                {isPremium ? '已订阅' : '免费体验版'}
              </p>
            </div>
          </div>

          {!isPremium && trialLeft > 0 && (
            <div className="bg-secondary/30 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">免费试用剩余</span>
                <span className="text-sm font-medium text-primary">{trialLeft} 天</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          )}

          {!isPremium && trialLeft <= 0 && (
            <div className="bg-secondary/30 rounded-xl p-4 mb-4">
              <p className="text-sm text-muted-foreground">试用已结束，升级订阅解锁全部功能</p>
            </div>
          )}

          {isPremium && expiresAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="w-4 h-4" />
              <span>到期时间：{expiresAt.toLocaleDateString('zh-CN')}</span>
            </div>
          )}

          {!isPremium && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">首月（含创建费）</span>
                <span className="font-medium">¥69</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">后续月费</span>
                <span className="font-medium">¥19/月</span>
              </div>
              <Button className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                订阅心伴
              </Button>
            </div>
          )}
        </div>

        {/* Invite section */}
        <div className="p-6 rounded-2xl bg-card/50 border border-border/50 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold">邀请好友</h2>
              <p className="text-sm text-muted-foreground">每 3 人 = 30 天免费订阅</p>
            </div>
          </div>

          {/* My invite code */}
          <div className="bg-secondary/30 rounded-xl p-4 mb-4">
            <span className="text-xs text-muted-foreground block mb-2">我的邀请码</span>
            <div className="flex items-center gap-3">
              <code className="text-lg font-mono font-bold text-primary">{user.inviteCode}</code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>

          {/* Invite progress */}
          <div className="bg-secondary/30 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">已邀请人数</span>
              <div className="flex items-center gap-1 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">{inviteStats.count}</span>
                <span className="text-muted-foreground">/ 3</span>
              </div>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: `${Math.min((inviteStats.count / 3) * 100, 100)}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">被邀请人需实际购买后才计入</p>
          </div>

          {/* Enter invite code */}
          <div>
            <span className="text-sm text-muted-foreground block mb-2">填写邀请码</span>
            {error && <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-xs mb-2">{error}</div>}
            {success && <div className="p-2 rounded-lg bg-primary/10 text-primary text-xs mb-2">{success}</div>}
            <div className="flex gap-2">
              <Input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="输入好友的邀请码..."
                className="bg-secondary/50 border-border/30"
                disabled={!!user?.invitedBy}
              />
              <Button
                onClick={handleSubmitCode}
                disabled={!inputCode || submitting || !!user?.invitedBy}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10 shrink-0"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : user?.invitedBy ? '已激活' : '激活'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-1.5">
              {user?.invitedBy ? '邀请码已激活' : '每账号限填1次'}
            </p>
          </div>
        </div>

        {/* Feature voting */}
        <div className="p-6 rounded-2xl bg-card/50 border border-border/50">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            🔥 功能投票
            <span className="text-xs text-muted-foreground font-normal">点击小火苗鞭策开发者</span>
          </h2>
          <div className="space-y-3">
            {[
              { name: '语音功能', votes: 128, desc: '让TA的声音也能被听到' },
              { name: '静音模式', votes: 45, desc: '让AI不主动说话' },
              { name: '延迟回复', votes: 67, desc: '不秒回，随机延迟回复' },
              { name: '消息合并', votes: 34, desc: '快速消息自动合并理解' },
              { name: '不回复模式', votes: 23, desc: '对某些消息选择不回复' },
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-all group cursor-pointer">
                <div>
                  <h4 className="text-sm font-medium">{f.name}</h4>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
                <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/10 transition-all">
                  <span className="text-sm">🔥</span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary">{f.votes}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
