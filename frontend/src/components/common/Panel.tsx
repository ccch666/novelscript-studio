import type { ReactNode } from 'react'

type PanelTone = 'emerald' | 'indigo' | 'amber' | 'rose' | 'teal' | 'neutral'

type PanelProps = {
  children: ReactNode
  className?: string
  kicker: string
  title: string
  /** 标题前小图标，14-18px 效果最好。 */
  icon?: ReactNode
  /** 右上角追加元素（如 status chip / 副标题）。 */
  accessory?: ReactNode
  /**
   * 调色基调。决定 kicker chip 颜色 + panel 顶部 accent line。
   * 默认 emerald（输入/分析主色）。
   */
  tone?: PanelTone
}

/**
 * 工作台通用面板外壳。
 * - 提供统一的 kicker / title 头
 * - 处理 body 内边距与圆角
 * - 顶部 2px accent line 表达面板语义色
 * - accessory slot 让调用方在标题右侧插入轻量状态信息
 */
export function Panel({
  children,
  className,
  kicker,
  title,
  icon,
  accessory,
  tone = 'emerald',
}: PanelProps) {
  const toneClass = `panel--tone-${tone}`
  return (
    <section className={`panel ${toneClass} ${className ?? ''}`.trim()}>
      <span className="panel-accent" aria-hidden="true" />
      <header className="panel-heading">
        <div className="panel-heading__lead">
          <div className="panel-title-row">
            {icon && <span className="panel-title-icon">{icon}</span>}
            <h2>{title}</h2>
          </div>
          <p className="panel-kicker">{kicker}</p>
        </div>
        {accessory && <div className="panel-heading__trail">{accessory}</div>}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  )
}
