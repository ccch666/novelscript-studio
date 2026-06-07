import type { ReactNode } from 'react'
import { IconCheck, IconCross, IconInfo, IconWarn } from '../icons'

type NoticeKind = 'success' | 'warning' | 'error' | 'info'

type NoticeProps = {
  kind: NoticeKind
  label: string
  message: string
}

const ICON: Record<NoticeKind, ReactNode> = {
  success: <IconCheck />,
  warning: <IconWarn />,
  error: <IconCross />,
  info: <IconInfo />,
}

/**
 * 统一提示条。带前置图标 + 标签 + 描述。
 */
export function Notice({ kind, label, message }: NoticeProps) {
  return (
    <div className={`notice notice--${kind}`} role="status">
      <span className="notice__icon" aria-hidden="true">
        {ICON[kind]}
      </span>
      <div className="notice__body">
        <strong>{label}</strong>
        <span>{message}</span>
      </div>
    </div>
  )
}
