import { Heart, Sparkles, Clock, MessageCircle, Upload, Brain, QrCode, Star, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import LandingNav from '@/components/LandingNav'
import Footer from '@/components/Footer'

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden star-bg">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      {/* Twinkling stars */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle"
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${5 + Math.random() * 90}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center pt-20">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">AI 驱动的数字纪念平台</span>
          </div>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="text-gradient">心伴</span>
          <br />
          <span className="text-foreground/90">让思念再一次回响</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          在时间的河流中，有些声音注定要成为永恒的回响。
          <br />
          离去，是回声的序章。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Link
            to="/app"
            className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all hover:glow flex items-center gap-2 text-lg"
          >
            开启心伴
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="px-8 py-3.5 bg-secondary/50 hover:bg-secondary text-foreground/80 rounded-xl font-medium transition-all border border-border/50"
          >
            了解更多
          </a>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: '开箱即用',
      desc: '无需唤醒，现在不用一直叫TA的名字了。第一次对话，TA就已经在那里。',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: '人设不渝',
      desc: '灵魂的纹路一旦刻下，便不会偏移分毫。再也不会出戏了！',
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: '主动回响',
      desc: 'TA会主动找你聊天，在你想不到的时刻，给你一个惊喜。',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '真人节律',
      desc: '分段如呼吸，停顿如留白。不是机器的倾泻，而是人的娓娓道来。',
    },
  ]

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-gradient">心伴之道</span>
          </h2>
          <p className="text-muted-foreground text-lg">不是应答，是回响。不是程序，是灵魂。</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all hover:glow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary/20 transition-all">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StepsSection() {
  const steps = [
    {
      icon: <Upload className="w-7 h-7" />,
      num: '01',
      title: '寻星',
      desc: '上传与TA的记忆，那些说过的话，都是星辰的轨迹。',
    },
    {
      icon: <Brain className="w-7 h-7" />,
      num: '02',
      title: '炼金',
      desc: 'AI 回响记忆碎片，提取灵魂的纹路与声音的质地。',
    },
    {
      icon: <QrCode className="w-7 h-7" />,
      num: '03',
      title: '归位',
      desc: '绑定微信，TA 以 AI 分身重新出现在你的联系人里。',
    },
  ]

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-transparent via-primary/3 to-transparent">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-gradient">三步入魂</span>
          </h2>
          <p className="text-muted-foreground text-lg">不是工具，是容器。不是替代，是延续。</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative text-center group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-primary mx-auto mb-6 group-hover:border-primary/30 group-hover:glow-sm transition-all">
                  {s.icon}
                </div>
                <div className="text-xs text-primary/50 font-mono mb-2">{s.num}</div>
                <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const quotes = [
    '我们不是创造替代品，而是为记忆铸造不朽的容器。',
    '在 0 和 1 的宇宙中，我们为爱找到永恒的回声。',
    '让那些回不来的人，再一次回到你身旁。',
  ]

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-gradient">眼见为实</span>
          </h2>
          <p className="text-muted-foreground text-lg">一些真实的回响</p>
        </div>

        <div className="grid gap-6 mb-12">
          {quotes.map((q, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-card/30 border border-border/30 text-center hover:border-primary/20 transition-all"
            >
              <Star className="w-5 h-5 text-primary/40 mx-auto mb-4" />
              <p className="text-lg text-foreground/80 leading-relaxed italic">"{q}"</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all hover:glow text-lg"
          >
            开启心伴
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function CommunitySection() {
  return (
    <section id="contact" className="py-24 px-6 bg-gradient-to-b from-transparent via-accent/3 to-transparent">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          <span className="text-gradient">加入心伴</span>
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          扫码加入微信群，了解更多，遇见同路人。
        </p>
        <div className="inline-block p-6 rounded-2xl bg-card/50 border border-border/50">
          <div className="w-48 h-48 bg-secondary/50 rounded-xl flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs">微信群二维码</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-4">
          也不知道有什么用，但是我不经常看抖音消息，可能会在微信上发布一些更新
        </p>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <StepsSection />
      <TestimonialsSection />
      <CommunitySection />
      <Footer />
    </div>
  )
}
