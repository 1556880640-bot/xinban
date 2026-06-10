import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LandingNav from '@/components/LandingNav'
import Footer from '@/components/Footer'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(username, password)
      } else {
        await register(username, password, email || undefined, inviteCode || undefined)
      }
      navigate('/app')
    } catch (err: any) {
      setError(err.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingNav showAuth={false} />

      <main className="flex items-center justify-center min-h-screen px-4 pt-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <Heart className="w-6 h-6 text-primary fill-primary/30" />
              <span className="text-xl font-semibold text-gradient">心伴</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2">
              {mode === 'login' ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'login' ? '继续你的心伴旅程' : '开启你的心伴之旅'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex mb-6 bg-secondary/50 rounded-xl p-1">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              登录
            </button>
            <button
              onClick={() => { setMode('register'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              注册
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">用户名</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="输入用户名..."
                className="bg-secondary/50 border-border/30 h-11"
                required
                minLength={2}
                maxLength={20}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">邮箱（选填）</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-secondary/50 border-border/30 h-11"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">密码</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码（至少6位）..."
                className="bg-secondary/50 border-border/30 h-11"
                required
                minLength={6}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">邀请码（选填）</label>
                <Input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="输入好友的邀请码..."
                  className="bg-secondary/50 border-border/30 h-11"
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
            >
              {loading ? (
                '处理中...'
              ) : (
                <>
                  {mode === 'login' ? '登录' : '创建账号'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Trial info */}
          {mode === 'register' && (
            <p className="text-xs text-muted-foreground/60 text-center mt-4">
              注册即享 1 天免费试用
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
