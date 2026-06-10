import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Medal, Award, Send, ExternalLink, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { contest as contestApi } from '@/lib/api'
import AppNav from '@/components/AppNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Submission {
  id: string
  url: string
  platform: string
  status: string
  created_at: string
}

const rewards = [
  { icon: <Trophy className="w-6 h-6 text-yellow-400" />, title: '特别奖', condition: '点赞过万', reward1: '一年免费订阅', reward2: '288 元现金', emoji: '🏆' },
  { icon: <Medal className="w-6 h-6 text-gray-300" />, title: '二等奖', condition: '点赞 ≥ 600', reward1: '一个季度免费订阅', reward2: '50 元现金', emoji: '🥈' },
  { icon: <Award className="w-6 h-6 text-amber-600" />, title: '三等奖', condition: '点赞 ≥ 200', reward1: '一个月免费订阅', reward2: '10 元现金', emoji: '🥉' },
]

export default function ContestPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      loadSubmissions()
    }
  }, [user])

  const loadSubmissions = async () => {
    try {
      const data = await contestApi.mySubmissions()
      setSubmissions(data)
    } catch (err) { /* silently fail */ }
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await contestApi.submit({ url, platform })
      setSuccess('作品链接已提交！我们会尽快审核。')
      setUrl('')
      setPlatform('')
      loadSubmissions()
    } catch (err: any) {
      setError(err.message || '提交失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-3xl mb-3">🎬</div>
          <h1 className="text-2xl font-bold mb-3">作品征集</h1>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            把你的心伴使用体验发到小红书、抖音或快手，带标签参与评选，赢取免费订阅。
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm border border-primary/20">#心伴</span>
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm border border-accent/20">#前任</span>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-5 text-center">参与只需 3 步</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { num: '1', title: '发布体验', desc: '发布你对心伴的真实使用体验，并带上标签。' },
              { num: '2', title: '提交链接', desc: '把发布链接提交到本页面。' },
              { num: '3', title: '月底核验', desc: '月底按点赞数核验，满足门槛发放奖励。' },
            ].map((s, i) => (
              <div key={i} className="p-5 rounded-xl bg-card/50 border border-border/50 text-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3">{s.num}</div>
                <h3 className="font-medium mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-5 text-center">奖励</h2>
          <div className="space-y-3">
            {rewards.map((r, i) => (
              <div key={i} className="p-5 rounded-xl bg-card/50 border border-border/50">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{r.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{r.title}</h3>
                      <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">{r.condition}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="text-primary">🎁 {r.reward1}</span>
                      <span className="text-muted-foreground">或</span>
                      <span className="text-foreground/80">💰 {r.reward2}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit form */}
        {user ? (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">提交作品链接</h2>
            <p className="text-sm text-muted-foreground mb-4">提交后我们会记录到你的活动投稿列表中。</p>

            {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">{error}</div>}
            {success && <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm mb-4">{success}</div>}

            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">作品链接</label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="粘贴你的作品链接..." className="bg-secondary/50 border-border/30" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">发布平台</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border/30 text-sm text-foreground"
                >
                  <option value="">请选择平台</option>
                  <option value="小红书">小红书</option>
                  <option value="抖音">抖音</option>
                  <option value="快手">快手</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <Button onClick={handleSubmit} disabled={!url || !platform || loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {loading ? '提交中...' : '提交作品'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-10 text-center p-8 rounded-2xl bg-card/50 border border-border/50">
            <p className="text-muted-foreground mb-4">请先登录再提交作品</p>
            <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              登录 / 注册
            </Button>
          </div>
        )}

        {/* My submissions */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">我的提交</h2>
          {submissions.length > 0 ? (
            <div className="space-y-2">
              {submissions.map((s) => (
                <div key={s.id} className="p-4 rounded-xl bg-card/50 border border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm truncate">{s.url}</span>
                    <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded shrink-0">{s.platform}</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-3 shrink-0">{new Date(s.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">暂无提交记录</p>
          )}
        </div>

        {/* Rules */}
        <div>
          <h2 className="text-lg font-semibold mb-4">参与规则</h2>
          <div className="space-y-3">
            {[
              '请勿提交违反法律法规、平台规则或公序良俗的内容。',
              '请勿提交非你本人原创、搬运、洗稿、盗图或未经授权发布的内容。',
              '请勿通过刷赞、刷量、恶意互赞等异常方式影响评选结果。',
              '提交即表示你授权心伴在活动核验、结果公示或活动回顾中引用公开链接。',
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-secondary/50 flex items-center justify-center text-xs shrink-0 mt-0.5">{i + 1}</span>
                {rule}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
