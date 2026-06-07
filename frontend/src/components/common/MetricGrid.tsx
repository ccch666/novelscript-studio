import type { ReactNode } from 'react'
import { IconChat, IconCheck, IconClock, IconDoc, IconLayers, IconShield, IconSparkles, IconUsers, IconWave } from '../icons'

type Metric = {
  label: string
  value: number | string
  /** 显式指定 icon，否则按 label 推断 */
  icon?: ReactNode
  /** 0-100，用于绘制底部进度条（强调用） */
  fill?: number
}

type MetricGridProps = {
  metrics: Metric[]
  /** 强调某一项作为高亮卡片（如"校验"状态）。 */
  emphasisIndex?: number
}

const ICON_FOR_LABEL: Record<string, ReactNode> = {
  场景: <IconLayers size={14} />,
  角色: <IconUsers size={14} />,
  对白: <IconChat size={14} />,
  动作: <IconWave size={14} />,
  校验: <IconShield size={14} />,
  修复: <IconSparkles size={14} />,
  章节: <IconDoc size={14} />,
  字数: <IconCheck size={14} />,
  模型: <IconSparkles size={14} />,
  时长: <IconClock size={14} />,
}

function inferIcon(label: string): ReactNode {
  return ICON_FOR_LABEL[label] ?? <IconSparkles size={14} />
}

/**
 * 报告指标条：等宽栅格 + 图标 + 大数字 + 强调卡。
 * 强调项使用高亮深色背景 + 底部填充条。
 */
export function MetricGrid({ metrics, emphasisIndex }: MetricGridProps) {
  return (
    <div
      className="report-strip"
      style={{ '--report-columns': metrics.length } as React.CSSProperties}
    >
      {metrics.map((metric, index) => {
        const emphasis = index === emphasisIndex
        const fill =
          metric.fill !== undefined
            ? Math.max(0, Math.min(100, metric.fill))
            : emphasis
              ? 100
              : undefined
        return (
          <div
            className={`report-item${emphasis ? ' report-item--emphasis' : ''}`}
            key={metric.label}
          >
            <span className="report-item__head">
              <span className="report-item__icon">{metric.icon ?? inferIcon(metric.label)}</span>
              <span className="report-item__label">{metric.label}</span>
            </span>
            <strong className="report-item__value">{metric.value}</strong>
            {fill !== undefined && <span className="report-item__bar" style={{ '--fill': `${fill}%` } as React.CSSProperties} />}
          </div>
        )
      })}
    </div>
  )
}
