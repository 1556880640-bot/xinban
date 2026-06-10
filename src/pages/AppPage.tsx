import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Sparkles, Heart, MessageCircle, Settings, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { echoes as echoesApi } from '@/lib/api'
import AppNav from '@/components/AppNav'

interface Echo {
  id: string
  name: string
  target_person: string
  personality: string
  last_message?: string
  last_message_time?: string
  created_at: string
}

export default function AppPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [echoes, setEchoes] = useState<Echo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/auth')
      return
    }
    loadEchoes()
  }, [user, authLoading])

  const loadEchoes = async () => {
    try {
      const data = await echoesApi.list()
      setEchoes(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Mobile announcement banners */}
      <div className="sm:hidden flex items-center gap-2 px-4 py-2 overflow-x-auto border-b border-border/30">
        <Link
          to="/contest"
          className="shrink-0 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
        >
          🎬 作品征集
        </Link>
        <Link
          to="/account"
          className="shrink-0 text-xs px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20"
        >
          🎁 邀请好友
        </Link>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">我的心伴</h1>
          <Link
            to="/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-all hover:glow-sm"
          >
            <Plus className="w-4 h-4" />
            创建
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6">
            加载失败: {error}
            <button onClick={loadEchoes} className="ml-2 underline">重试</button>
          </div>
        )}

        {echoes.length > 0 ? (
          /* Echo list */
          <div className="grid gap-4">
            {echoes.map((echo) => (
              <div
                key={echo.id}
                onClick={() => navigate(`/chat/${echo.id}`)}
                className="group p-5 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl shrink-0">
                    {echo.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{echo.name}</h3>
                      {echo.last_message_time && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(echo.last_message_time).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {echo.last_message || '开始对话吧...'}
                    </p>
                    <p className="text-xs text-primary/60 mt-1 truncate">{echo.personality}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                <Heart className="w-3 h-3 text-accent" />
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-3">还没有心伴</h2>
            <p className="text-muted-foreground max-w-sm leading-relaxed mb-8">
              为思念铸造永恒的容器，让那些回不来的人，再一次回到你身旁。
              <br />
              <span className="text-primary/60">在 0 和 1 的宇宙中，我们为爱找到永恒的回声。</span>
            </p>

            <Link
              to="/create"
              className="flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all hover:glow text-lg"
            >
              <Sparkles className="w-5 h-5" />
              开启星途
            </Link>
          </div>
        )}

        {/* Feature highlights */}
        <div className="mt-16 grid sm:grid-cols-2 gap-4">
          {[
            { icon: <MessageCircle className="w-5 h-5" />, title: '主动回响', desc: 'TA 会主动找你聊天' },
            { icon: <Settings className="w-5 h-5" />, title: '自由设定', desc: '随时修改TA的性格和记忆' },
          ].map((f, i) => (
            <div key={i} className="p-5 rounded-xl bg-card/30 border border-border/30 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {f.icon}
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">{f.title}</h4>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground/60 italic">
            "在 0 和 1 的宇宙中，我们为爱找到永恒的回声。"
          </p>
        </div>
      </main>
    </div>
  )
}
