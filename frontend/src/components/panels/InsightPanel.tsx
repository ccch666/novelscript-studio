import type { ChapterAnalysis, ValidationResponse } from '../../api/client'
import type {
  AdaptationMetrics,
  AnalysisState,
  ScreenplayDocument,
} from '../../types'
import { IconCheck, IconClock, IconList, IconUsers, IconWarn } from '../icons'
import { CharacterGrid } from '../common/CharacterGrid'
import { EmptyState } from '../common/EmptyState'
import { MetricGrid } from '../common/MetricGrid'
import { Notice } from '../common/Notice'
import { Panel } from '../common/Panel'

type InsightPanelProps = {
  analysis: ChapterAnalysis | null
  analysisError: string
  analysisState: AnalysisState
  metrics: AdaptationMetrics
  repairRounds: number
  screenplay: ScreenplayDocument | null
  validation: ValidationResponse | null
  yamlText: string
}

/**
 * 章节 + 人物 + 改编指标三合一面板。
 * 状态分支按优先级渲染：
 *  1. error → 错误提示
 *  2. loading → loading 占位
 *  3. idle + 无 screenplay → 等待
 *  4. idle + 有 screenplay → 角色卡 + 指标
 *  5. success + analysis → 完整章节列表 + 角色 + 指标
 */
export function InsightPanel({
  analysis,
  analysisError,
  analysisState,
  metrics,
  repairRounds,
  screenplay,
  validation,
  yamlText,
}: InsightPanelProps) {
  const total = Math.max(1, metrics.sceneCount + metrics.dialogueCount + metrics.actionCount)
  const sceneRatio = Math.round((metrics.sceneCount / total) * 100)
  const dialogueRatio = Math.round((metrics.dialogueCount / total) * 100)
  const actionRatio = Math.round((metrics.actionCount / total) * 100)
  const reportMetrics = [
    { label: '场景', value: metrics.sceneCount, fill: sceneRatio },
    { label: '角色', value: metrics.characterCount, fill: Math.min(100, metrics.characterCount * 10) },
    { label: '对白', value: metrics.dialogueCount, fill: dialogueRatio },
    { label: '动作', value: metrics.actionCount, fill: actionRatio },
    { label: '校验', value: validation?.passed ? '通过' : metrics.validationStatus, fill: validation?.passed ? 100 : 60 },
    { label: '修复', value: repairRounds || metrics.repairRounds, fill: Math.min(100, (repairRounds || metrics.repairRounds) * 25) },
  ]

  return (
    <Panel
      className="panel--analysis"
      kicker="分析"
      title="章节与人物"
      icon={<IconList />}
      tone="indigo"
      accessory={
        analysis?.is_valid ? (
          <span className="panel-tag panel-tag--success">
            <IconCheck size={12} /> 已就绪
          </span>
        ) : analysis ? (
          <span className="panel-tag panel-tag--warning">
            <IconWarn size={12} /> 章节不足
          </span>
        ) : null
      }
    >
      {analysisState === 'error' && (
        <Notice kind="error" label="分析失败" message={analysisError} />
      )}

      {analysisState === 'loading' && (
        <EmptyState
          label="正在分析章节"
          message="后端正在识别章节标题、章节数和字数。"
          glyph={<IconClock size={20} />}
          tone="emerald"
        />
      )}

      {analysisState === 'idle' && !screenplay && (
        <EmptyState
          label="等待小说输入"
          message="先分析章节，通过 3 章门槛后即可生成剧本。"
          tone="amber"
        />
      )}

      {analysisState === 'idle' && screenplay && (
        <div className="analysis-result">
          <CharacterGrid characters={screenplay.characters} />
          <MetricGrid metrics={reportMetrics} emphasisIndex={4} />
        </div>
      )}

      {analysisState === 'success' && analysis && (
        <div className="analysis-result">
          <Notice
            kind={analysis.is_valid ? 'success' : 'warning'}
            label={analysis.is_valid ? '满足题目要求' : '章节数不足'}
            message={analysis.message}
          />
          <div className="metric-row">
            <span>章节数：{analysis.chapter_count}</span>
            <span>总字数：{analysis.total_word_count}</span>
          </div>
          <div className="chapter-list">
            {analysis.chapters.map((chapter) => (
              <article key={chapter.id}>
                <div>
                  <span className="chapter-list__id">
                    <IconList size={11} />
                    {chapter.id}
                  </span>
                  <strong>{chapter.title}</strong>
                </div>
                <p>{chapter.preview}</p>
                <small>{chapter.word_count} 字</small>
              </article>
            ))}
          </div>
          {screenplay && (
            <div className="section-label">
              <IconUsers size={12} />
              <span>出场角色</span>
            </div>
          )}
          {screenplay && <CharacterGrid characters={screenplay.characters} />}
          {yamlText && <MetricGrid metrics={reportMetrics} emphasisIndex={4} />}
        </div>
      )}
    </Panel>
  )
}
