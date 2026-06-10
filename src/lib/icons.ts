import { Heart, Sparkles, Clock, MessageCircle, Zap, Brain, Upload, Settings, QrCode } from 'lucide-react'

export const icons = {
  heart: Heart,
  sparkles: Sparkles,
  clock: Clock,
  message: MessageCircle,
  zap: Zap,
  brain: Brain,
  upload: Upload,
  settings: Settings,
  qrcode: QrCode,
}

export type IconName = keyof typeof icons
