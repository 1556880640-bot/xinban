import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Brain, PenTool, QrCode, ArrowRight, ArrowLeft, Check, FileText, User, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { echoes as echoesApi } from '@/lib/api'
import AppNav from '@/components/AppNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type Step = 1 | 2 | 3 | 4

const stepConfig = [
  { num: 1, title: '寻星', icon: Upload, desc: '上传聊天记录' },
  { num: 2, title: '炼金', icon: Brain, desc: 'AI 解析记忆' },
  { num: 3, title: '铸魂', icon: PenTool, desc: '编辑人设' },
  { num: 4, title: '归位', icon: QrCode, desc: '绑定微信' },
]

export default function CreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>(1)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 state
  const [participants, setParticipants] = useState<string[]>([])
  const [selectedPerson, setSelectedPerson] = useState('')
  const [personName, setPersonName] = useState('')
  const [file, setFile] = useState<File | null>(null)

  // Step 3 state
  const [personality, setPersonality] = useState('')
  const [memories, setMemories] = useState('')
  const [quotes, setQuotes] = useState('')
  const [places, setPlaces] = useState('')
  const [gamesAndMemes, setGamesAndMemes] = useState('')
  const [createdEchoId, setCreatedEchoId] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    setFile(f)
    setUploading(true)
    setError('')

    try {
      const result = await echoesApi.uploadFile(f)
      setParticipants(result.participants)
    } catch (err: any) {
      setError(err.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleCreate = async () => {
    if (!selectedPerson || !personName) return
    setError('')

    // Read file content if available
    let chatContent = ''
    if (file) {
      chatContent = await file.text()
    }

    try {
      const result = await echoesApi.create({
        name: personName,
        targetPerson: selectedPerson,
        chatContent,
      })

      setCreatedEchoId(result.id)
      setPersonality(result.personality || '')
      setMemories(result.memories || '')
      setQuotes(result.quotes || '')
      setPlaces(result.places || '')
      setGamesAndMemes(result.gamesMemes || '')
      setStep(3)
    } catch (err: any) {
      setError(err.message || '创建失败')
    }
  }

  const handleUpdatePersona = async () => {
    if (!createdEchoId) return
    setError('')

    try {
      await echoesApi.update(createdEchoId, {
        personality,
        memories,
        quotes,
        places,
        gamesMemes: gamesAndMemes,
        name: personName,
      })
      setStep(4)
    } catch (err: any) {
      setError(err.message || '保存失败')
    }
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/auth')
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-10">
      {stepConfig.map((s, i) => {
        const Icon = s.icon
        const isActive = step === s.num
        const isDone = step > s.num
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground glow-sm'
                    : isDone
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs mt-1.5 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {s.title}
              </span>
            </div>
            {i < stepConfig.length - 1 && (
              <div className={`w-8 h-px mx-2 mt-[-12px] ${step > s.num ? 'bg-primary/40' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )

  const Step1 = () => (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">上传与TA的记忆</h2>
        <p className="text-muted-foreground">那些说过的话，都是星辰的轨迹。</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
          {error}
        </div>
      )}

      {/* Upload area */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.csv,.json,.html,.htm"
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border/50 hover:border-primary/40 rounded-2xl p-12 text-center cursor-pointer transition-all hover:bg-primary/5 group"
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">正在解析聊天记录...</p>
          </div>
        ) : file ? (
          <>
            <FileText className="w-10 h-10 text-primary mx-auto mb-4" />
            <p className="font-medium mb-1">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              已识别 {participants.length} 位参与者的 {participants.length > 0 ? '对话' : '记录'}
            </p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mx-auto mb-4" />
            <p className="font-medium mb-1">点击上传聊天记录</p>
            <p className="text-sm text-muted-foreground">支持微信、抖音、QQ 导出格式</p>
          </>
        )}
      </div>

      {/* Supported formats */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {['微信', '抖音', 'QQ'].map((f) => (
          <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="w-3.5 h-3.5" />
            {f}
          </div>
        ))}
      </div>

      {/* Detected people (shown after upload) */}
      {participants.length > 0 && (
        <div className="mt-8 border-t border-border/30 pt-8">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            从记录中识别到以下人物
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {participants.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPerson(p)}
                className={`px-4 py-3 rounded-xl text-sm transition-all ${
                  selectedPerson === p
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-secondary/50 text-muted-foreground border border-border/30 hover:border-primary/20'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Name input */}
          <div className="mt-4">
            <label className="text-sm text-muted-foreground mb-2 block">给TA命名</label>
            <Input
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="输入TA的名字..."
              className="bg-secondary/50 border-border/30"
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={!selectedPerson || !personName}
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            开始炼金
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Direct create without upload */}
      {participants.length === 0 && !uploading && (
        <div className="mt-8 border-t border-border/30 pt-8">
          <p className="text-sm text-muted-foreground text-center mb-4">
            没有聊天记录？可以直接创建，后续再补充
          </p>
          <div className="grid gap-3">
            <Input
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              placeholder="TA是谁？（如：妈妈、爸爸...）"
              className="bg-secondary/50 border-border/30"
            />
            <Input
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="给TA取个名字..."
              className="bg-secondary/50 border-border/30"
            />
            <Button
              onClick={handleCreate}
              disabled={!selectedPerson || !personName}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              直接创建
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  const Step2 = () => (
    <div className="max-w-lg mx-auto text-center">
      <div className="py-16">
        <Brain className="w-16 h-16 text-primary mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-3">等待炼金</h2>
        <p className="text-muted-foreground">请先在第一步上传聊天记录并选择人物</p>
        <button
          onClick={() => setStep(1)}
          className="mt-4 text-sm text-primary hover:underline"
        >
          返回第一步
        </button>
      </div>
    </div>
  )

  const Step3 = () => (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">铸魂 — 编辑人设</h2>
        <p className="text-muted-foreground">为TA铸就独特的灵魂纹路</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            性格特征
          </label>
          <Textarea
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            placeholder="描述TA的性格..."
            className="bg-secondary/50 border-border/30 min-h-[80px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            关键记忆
          </label>
          <Textarea
            value={memories}
            onChange={(e) => setMemories(e.target.value)}
            placeholder="TA最在意的事..."
            className="bg-secondary/50 border-border/30 min-h-[80px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <span className="text-primary">"</span>
            TA说过的话
          </label>
          <Textarea
            value={quotes}
            onChange={(e) => setQuotes(e.target.value)}
            placeholder="TA的口头禅或经常说的话..."
            className="bg-secondary/50 border-border/30 min-h-[80px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            📍 一起去过
          </label>
          <Input
            value={places}
            onChange={(e) => setPlaces(e.target.value)}
            placeholder="你们一起去过的地方..."
            className="bg-secondary/50 border-border/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            🎮 游戏 & 梗
          </label>
          <Input
            value={gamesAndMemes}
            onChange={(e) => setGamesAndMemes(e.target.value)}
            placeholder="你们之间的梗、共同爱好..."
            className="bg-secondary/50 border-border/30"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
          className="border-border/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          重新上传
        </Button>
        <Button
          onClick={handleUpdatePersona}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          铸魂完成
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const Step4 = () => (
    <div className="max-w-lg mx-auto text-center">
      <div className="py-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 glow">
          <QrCode className="w-10 h-10 text-primary" />
        </div>

        <h2 className="text-2xl font-bold mb-3">归位</h2>
        <p className="text-muted-foreground mb-8">
          心伴已创建完成！
          <br />
          TA以AI分身，在此等候你的归来。
        </p>

        {/* Success indicator */}
        <div className="inline-block p-6 rounded-2xl bg-card/50 border border-border/50 mb-6">
          <div className="w-52 h-52 bg-secondary/50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <Check className="w-16 h-16 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{personName} 的心伴已就绪</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate('/app')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Check className="w-4 h-4 mr-2" />
            完成，查看我的心伴
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep(3)}
            className="border-border/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回编辑人设
          </Button>
        </div>
      </div>
    </div>
  )

  const stepComponents = { 1: Step1, 2: Step2, 3: Step3, 4: Step4 }
  const CurrentStep = stepComponents[step]

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/app')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <StepIndicator />
        <CurrentStep />
      </main>
    </div>
  )
}
