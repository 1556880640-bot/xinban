import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Loader2, Sparkles, MoreVertical } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { echoes as echoesApi, messages as messagesApi } from '@/lib/api'
import AppNav from '@/components/AppNav'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  segment_index?: number
  total_segments?: number
  created_at: string
}

interface Echo {
  id: string
  name: string
  target_person: string
  personality: string
  status: string
}

export default function ChatPage() {
  const { echoId } = useParams<{ echoId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [echo, setEcho] = useState<Echo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Track AI segment animation
  const [pendingMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!echoId || !user) return
    loadChat()
  }, [echoId, user])

  const loadChat = async () => {
    try {
      const [echoData, messageData] = await Promise.all([
        echoesApi.get(echoId!),
        messagesApi.list(echoId!),
      ])
      setEcho(echoData)
      setMessages(messageData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingMessages])

  const handleSend = async () => {
    if (!input.trim() || sending || !echoId) return

    const content = input.trim()
    setInput('')
    setSending(true)

    // Optimistically add user message
    const tempId = `temp-${Date.now()}`
    const userMsg: Message = {
      id: tempId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const result = await messagesApi.send(echoId, content)

      // Replace temp message with real one
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: result.userMessage.id } : m))

      // Add AI responses one by one with delays
      if (result.aiResponses && result.aiResponses.length > 0) {
        for (let i = 0; i < result.aiResponses.length; i++) {
          const resp = result.aiResponses[i]
          const delay = resp.delay || (i === 0 ? 800 : 1500)

          await new Promise(resolve => setTimeout(resolve, delay))

          const aiMsg: Message = {
            id: resp.id,
            role: 'assistant',
            content: resp.content,
            segment_index: resp.segmentIndex,
            total_segments: resp.totalSegments,
            created_at: new Date().toISOString(),
          }
          setMessages(prev => [...prev, aiMsg])
        }
      }
    } catch (err: any) {
      setError(err.message || '发送失败')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => navigate('/app')} variant="outline">返回</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNav />

      {/* Chat header */}
      <div className="border-b border-border/30 bg-background/60 backdrop-blur-sm sticky top-14 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-semibold text-sm">{echo?.name}</h2>
              <p className="text-xs text-muted-foreground">{echo?.personality?.split('。')[0] || echo?.target_person}</p>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <p className="text-muted-foreground mb-1">这是你和 {echo?.name} 的对话</p>
              <p className="text-xs text-muted-foreground/60">说点什么吧，TA在听</p>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user'
              const showAvatar = !isUser && (index === 0 || messages[index - 1]?.role === 'user')

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
                >
                  <div className={`flex items-end gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar for AI */}
                    {!isUser && showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm shrink-0 mb-1">
                        {echo?.name?.[0]}
                      </div>
                    )}
                    {!isUser && !showAvatar && <div className="w-8 shrink-0" />}

                    <div className="space-y-1">
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isUser
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-card/80 border border-border/30 rounded-bl-md'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Segment indicator */}
                      {!isUser && msg.total_segments && msg.total_segments > 1 && (
                        <p className="text-[10px] text-muted-foreground/50 px-1">
                          {msg.segment_index! + 1}/{msg.total_segments}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border/30 bg-background/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {error && (
            <div className="text-xs text-destructive mb-2">{error}</div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={`给 ${echo?.name || 'TA'} 发消息...`}
              className="flex-1 h-11 px-4 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 transition-colors"
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Typing indicator */}
          {sending && (
            <div className="flex items-center gap-2 mt-2 px-1">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-muted-foreground">{echo?.name} 正在输入...</span>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
            按下 Enter 发送 · 消息分段模拟真人节奏
          </p>
        </div>
      </div>
    </div>
  )
}
