import type { ReactNode } from 'react'
import { IconCompass, IconSparkles, IconWave } from '../icons'

type EmptyStateProps = {
  label: string
  message: string
  /** 可选图标或字符。默认给一个分层图标。 */
  glyph?: ReactNode
  tone?: 'emerald' | 'indigo' | 'amber' | 'teal' | 'rose'
}

/**
 * 面板内"暂无内容"占位。
 * 带渐变背景 + 图标 + 标签 + 描述。
 */
export function EmptyState({
  label,
  message,
  glyph = <IconCompass size={20} />,
  tone = 'indigo',
}: EmptyStateProps) {
  return (
    <div className={`empty-state empty-state--tone-${tone}`}>
      <span className="empty-state__glyph" aria-hidden="true">
        {glyph}
      </span>
      <div className="empty-state__body">
        <strong>{label}</strong>
        <span>{message}</span>
      </div>
    </div>
  )
}

export { IconSparkles, IconWave }
