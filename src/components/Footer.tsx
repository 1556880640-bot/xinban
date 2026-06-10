import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border/30 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary fill-primary/30" />
          <span className="text-sm text-gradient font-medium">心伴</span>
        </div>
        <p className="text-xs text-muted-foreground">记忆永恒，心伴不灭</p>
        <p className="text-xs text-muted-foreground/50">心伴 © 2026</p>
        <div className="flex gap-4 mt-2">
          <a href="#contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">联系我们</a>
          <Link to="/contest" className="text-xs text-muted-foreground hover:text-foreground transition-colors">作品征集</Link>
          <Link to="/account" className="text-xs text-muted-foreground hover:text-foreground transition-colors">邀请好友</Link>
        </div>
      </div>
    </footer>
  )
}
