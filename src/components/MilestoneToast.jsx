import { useEffect } from 'react'
import { Sparkles, Trophy, Clock, Type } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'

const KIND_ICON = {
  words:     Sparkles,
  time:      Clock,
  length:    Type,
  newRecord: Trophy,
}

const TOAST_DURATION_MS = 2500

export default function MilestoneToast() {
  const milestone      = useGameStore(s => s.currentMilestone)
  const clearMilestone = useGameStore(s => s.clearMilestone)

  useEffect(() => {
    if (!milestone) return
    const t = setTimeout(clearMilestone, TOAST_DURATION_MS)
    return () => clearTimeout(t)
  }, [milestone, clearMilestone])

  if (!milestone) return null

  const Icon = KIND_ICON[milestone.kind] ?? Sparkles
  const isRecord = milestone.kind === 'newRecord'

  return (
    <div className="animate-enter" style={{
      position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 60, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 20px',
      background: isRecord ? 'var(--warning-container)' : 'var(--primary-container)',
      color:      isRecord ? 'var(--warning)'           : 'var(--on-primary-container)',
      borderRadius: 'var(--shape-full)',
      boxShadow: 'var(--shadow-3)',
      maxWidth: 'calc(100% - 32px)',
    }}>
      <Icon size={20} />
      <div>
        <p style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
          {milestone.title}
        </p>
        {milestone.subtitle && (
          <p className="type-label-md" style={{ marginTop: 2, opacity: 0.85 }}>
            {milestone.subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
