import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface LandingNavProps {
  showAuth?: boolean
}

export default function LandingNav({ showAuth = true }: LandingNavProps) {
  const { user, logout } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="w-6 h-6 text-primary fill-primary/30 group-hover:fill-primary/50 transition-all" />
          <span className="text-xl font-semibold tracking-wide">
            <span className="text-gradient">心伴</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            联系我们
          </a>
          {showAuth && (
            user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/app"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {user.username}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  退出
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-5 py-2 bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-all hover:glow-sm"
              >
                登录 / 注册
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  )
}
