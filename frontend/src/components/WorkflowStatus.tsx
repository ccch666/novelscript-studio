import type { ReactNode } from 'react'
import type { ValidationResponse } from '../api/client'
import {
  IconCheck,
  IconClock,
  IconDoc,
  IconDownload,
  IconList,
  IconShield,
  IconWarn,
} from './icons'

type Step = {
  done: boolean
  label: string
  value: string | number
  warn?: boolean
  icon: ReactNode
  tone: 'emerald' | 'indigo' | 'amber' | 'teal' | 'rose'
}

type WorkflowStatusProps = {
  chapterCount: number | undefined
  hasValidChapterCount: boolean
  validation: ValidationResponse | null
  yamlText: string
}

function stepClass(step: Step) {
  const base = 'workflow-step'
  if (step.warn) {
    return `${base} ${base}--warn`
  }
  if (step.done) {
    return `${base} ${base}--done ${base}--tone-${step.tone}`
  }
  return `${base} ${base}--tone-${step.tone}`
}

/**
 * 工作流进度条：4 步骤，依次为 章节 / YAML / Schema / 导出。
 * - 章节通过 = done · emerald
 * - YAML 生成 = done · indigo
 * - Schema 未通过 = warn · amber
 * - Schema 通过 / 导出可用 = done · teal
 */
export function WorkflowStatus({
  chapterCount,
  hasValidChapterCount,
  validation,
  yamlText,
}: WorkflowStatusProps) {
  const steps: Step[] = [
    {
      done: hasValidChapterCount,
      label: '章节',
      value: chapterCount ?? '-',
      icon: <IconList />,
      tone: 'emerald',
    },
    {
      done: Boolean(yamlText),
      label: 'YAML',
      value: yamlText ? '已生成' : '等待',
      icon: <IconDoc />,
      tone: 'indigo',
    },
    {
      done: Boolean(validation?.passed),
      label: 'Schema',
      value: validation?.passed ? '通过' : validation ? '待修复' : '未校验',
      warn: Boolean(validation && !validation.passed),
      icon: validation?.passed ? <IconShield /> : validation ? <IconWarn /> : <IconClock />,
      tone: 'amber',
    },
    {
      done: Boolean(yamlText),
      label: '导出',
      value: yamlText ? '可用' : '等待',
      icon: <IconDownload />,
      tone: 'teal',
    },
  ]

  return (
    <section className="workflow-strip" aria-label="工作流状态">
      <div className="workflow-rail" aria-hidden="true" />
      {steps.map((step, index) => (
        <div className={stepClass(step)} key={step.label}>
          <span className="workflow-step__icon" aria-hidden="true">
            {step.done && !step.warn ? <IconCheck size={12} /> : step.icon}
          </span>
          <div className="workflow-step__body">
            <small>{String(index + 1).padStart(2, '0')}</small>
            <div>
              <span>{step.label}</span>
              <strong>{step.value}</strong>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
