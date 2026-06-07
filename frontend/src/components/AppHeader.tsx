import { HEALTH_LABEL, type HealthState } from '../types'
import { IconBolt, IconDoc, IconLayers, IconShield } from './icons'

type AppHeaderProps = {
  health: HealthState
  healthMessage: string
}

/**
 * 工作台顶部条。
 * - 仿真 macOS 红黄绿圆点
 * - 品牌标记 + 名称 + 版本徽章
 * - 后端健康状态 pill + 详细版本
 */
export function AppHeader({ health, healthMessage }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__bar">
        <div className="window-controls" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="brand-mark" aria-hidden="true">
          <IconLayers size={18} />
        </div>
        <div className="brand-lockup">
          <p className="eyebrow">
            题目三 · AI 小说转剧本工具
            <span className="brand-version">v1.0</span>
          </p>
          <h1>
            NovelScript <span className="brand-mark--word">Studio</span>
          </h1>
        </div>
        <div className="header-status">
          <div className={`status-pill status-pill--${health}`}>
            <span className="status-dot" aria-hidden="true" />
            <span>{HEALTH_LABEL[health]}</span>
          </div>
          <code>{healthMessage}</code>
        </div>
      </div>
      <div className="app-header__lower">
        <p className="header-copy">把三章以上小说改编成可校验、可编辑、可导出的 YAML 剧本初稿。</p>
        <div className="header-meta" aria-label="核心能力">
          <span><IconDoc size={12} /> 3+ 章节门槛</span>
          <span><IconShield size={12} /> Schema 校验</span>
          <span><IconBolt size={12} /> 在线编辑导出</span>
        </div>
      </div>
    </header>
  )
}

