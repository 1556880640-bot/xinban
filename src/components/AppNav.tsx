import { Heart, LogOut, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export default function AppNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/app" className="flex items-center gap-2 group">
          <Heart className="w-5 h-5 text-primary fill-primary/30 group-hover:fill-primary/50 transition-all" />
          <span className="text-lg font-semibold text-gradient">心伴</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 mr-4">
            <Link
              to="/contest"
              className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
            >
              🎬 作品征集
            </Link>
            <Link
              to="/account"
              className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all"
            >
              🎁 邀请好友
            </Link>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{user?.username || '我的'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>退出</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
