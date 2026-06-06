import type { ChangeEvent, ReactNode } from 'react'
import type { ChapterAnalysis, ValidationResponse } from '../api/client'
import type { ScreenplayDocument, ScriptCharacter, ScriptLocation } from '../utils/screenplay'
import { countBeats } from '../utils/screenplay'

export type HealthState = 'checking' | 'online' | 'offline'
export type AnalysisState = 'idle' | 'loading' | 'success' | 'error'
export type GenerationState = 'idle' | 'loading' | 'success' | 'error'
export type SampleState = 'idle' | 'loading' | 'error'

export type AdaptationMetrics = {
  actionCount: number
  characterCount: number
  dialogueCount: number
  repairRounds: number
  sceneCount: number
  validationStatus: string
}

type Lookup<T> = Record<string, T>

function healthLabel(health: HealthState) {
  if (health === 'checking') {
    return '连接中'
  }

  return health === 'online' ? '后端在线' : '后端离线'
}

function workflowClass(done: boolean, warn = false) {
  if (warn) {
    return 'workflow-step workflow-step--warn'
  }

  return done ? 'workflow-step workflow-step--done' : 'workflow-step'
}

function Panel({
  children,
  className,
  kicker,
  title,
}: {
  children: ReactNode
  className?: string
  kicker: string
  title: string
}) {
  return (
    <section className={`panel ${className ?? ''}`.trim()}>
      <div className="panel-heading">
        <p className="panel-kicker">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Notice({
  kind,
  label,
  message,
}: {
  kind: 'success' | 'warning' | 'error'
  label: string
  message: string
}) {
  return (
    <div className={`notice notice--${kind}`}>
      <strong>{label}</strong>
      <span>{message}</span>
    </div>
  )
}

function EmptyState({ label, message }: { label: string; message: string }) {
  return (
    <div className="empty-state">
      <strong>{label}</strong>
      <span>{message}</span>
    </div>
  )
}

function MetricGrid({
  metrics,
}: {
  metrics: Array<{ label: string; value: number | string }>
}) {
  return (
    <div className="report-grid">
      {metrics.map((metric) => (
        <article key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </article>
      ))}
    </div>
  )
}

function CharacterGrid({ screenplay }: { screenplay: ScreenplayDocument | null }) {
  if (!screenplay?.characters?.length) {
    return null
  }

  return (
    <div className="character-list">
      {screenplay.characters.map((character) => (
        <article key={character.id}>
          <span>{character.id}</span>
          <strong>{character.name}</strong>
          <small>{character.role ?? 'unknown'}</small>
        </article>
      ))}
    </div>
  )
}

export function AppHeader({
  health,
  healthMessage,
}: {
  health: HealthState
  healthMessage: string
}) {
  return (
    <header className="app-header">
      <div className="brand-lockup">
        <p className="eyebrow">AI 小说剧本改编工作台</p>
        <h1>NovelScript Studio</h1>
        <p className="header-copy">把三章以上小说改编成可校验、可编辑、可导出的 YAML 剧本初稿。</p>
      </div>
      <div className="header-status">
        <div className={`status-pill status-pill--${health}`}>
          <span className="status-dot" aria-hidden="true" />
          <span>{healthLabel(health)}</span>
        </div>
        <code>{healthMessage}</code>
      </div>
    </header>
  )
}

export function WorkflowStatus({
  chapterCount,
  hasValidChapterCount,
  validation,
  yamlText,
}: {
  chapterCount: number | undefined
  hasValidChapterCount: boolean
  validation: ValidationResponse | null
  yamlText: string
}) {
  const steps = [
    {
      done: hasValidChapterCount,
      label: '章节',
      value: chapterCount ?? '-',
    },
    {
      done: Boolean(yamlText),
      label: 'YAML',
      value: yamlText ? '已生成' : '等待',
    },
    {
      done: Boolean(validation?.passed),
      label: 'Schema',
      value: validation?.passed ? '通过' : validation ? '待修复' : '未校验',
      warn: Boolean(validation && !validation.passed),
    },
    {
      done: Boolean(yamlText),
      label: '导出',
      value: yamlText ? '可用' : '等待',
    },
  ]

  return (
    <section className="workflow-strip" aria-label="工作流状态">
      {steps.map((step) => (
        <article className={workflowClass(step.done, step.warn)} key={step.label}>
          <span>{step.label}</span>
          <strong>{step.value}</strong>
        </article>
      ))}
    </section>
  )
}

export function SourcePanel({
  analysisState,
  canAnalyze,
  canGenerate,
  generationState,
  isBusy,
  novelText,
  onAnalyze,
  onFileChange,
  onGenerate,
  onLoadSample,
  onLoadSampleOutput,
  onNovelTextChange,
  sampleState,
}: {
  analysisState: AnalysisState
  canAnalyze: boolean
  canGenerate: boolean
  generationState: GenerationState
  isBusy: boolean
  novelText: string
  onAnalyze: () => void
  onFileChange: (file: File | undefined) => void
  onGenerate: () => void
  onLoadSample: () => void
  onLoadSampleOutput: () => void
  onNovelTextChange: (value: string) => void
  sampleState: SampleState
}) {
  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event.target.files?.[0])
  }

  return (
    <Panel className="panel--input" kicker="输入" title="小说文本">
      <div className="quick-lane" aria-label="评审快速入口">
        <div>
          <strong>评审快速入口</strong>
          <span>直接查看完整 YAML、场景卡片和 Schema 结果。</span>
        </div>
        <button type="button" className="demo-action" disabled={isBusy} onClick={onLoadSampleOutput}>
          {sampleState === 'loading' ? '加载中' : '加载示例 YAML'}
        </button>
      </div>
      <div className="editor-shell">
        <textarea
          aria-label="小说文本输入"
          value={novelText}
          placeholder="粘贴 3 个章节以上的小说文本，例如：第一章、第二章、第三章..."
          onChange={(event) => onNovelTextChange(event.target.value)}
        />
        <div className="input-meta">
          <span>{novelText.trim().length} 字符</span>
          <span>{novelText ? '已输入' : '等待文本'}</span>
        </div>
      </div>
      <div className="panel-actions">
        <label className="file-button">
          上传 TXT
          <input type="file" accept=".txt,text/plain" onChange={handleFileInput} />
        </label>
        <button type="button" disabled={isBusy} onClick={onLoadSample}>
          加载示例小说
        </button>
        <button type="button" className="primary-action" disabled={!canAnalyze} onClick={onAnalyze}>
          {analysisState === 'loading' ? '分析中' : '分析章节'}
        </button>
        <button type="button" className="primary-action" disabled={!canGenerate} onClick={onGenerate}>
          {generationState === 'loading' ? '生成中' : '生成剧本'}
        </button>
      </div>
    </Panel>
  )
}

export function InsightPanel({
  adaptationMetrics,
  analysis,
  analysisError,
  analysisState,
  repairRounds,
  screenplay,
  validation,
  yamlText,
}: {
  adaptationMetrics: AdaptationMetrics
  analysis: ChapterAnalysis | null
  analysisError: string
  analysisState: AnalysisState
  repairRounds: number
  screenplay: ScreenplayDocument | null
  validation: ValidationResponse | null
  yamlText: string
}) {
  const reportMetrics = [
    { label: '场景', value: adaptationMetrics.sceneCount },
    { label: '角色', value: adaptationMetrics.characterCount },
    { label: '对白', value: adaptationMetrics.dialogueCount },
    { label: '动作', value: adaptationMetrics.actionCount },
    { label: '校验', value: validation?.passed ? '通过' : adaptationMetrics.validationStatus },
    { label: '修复', value: repairRounds || adaptationMetrics.repairRounds },
  ]

  return (
    <Panel className="panel--analysis" kicker="分析" title="章节与人物">
      {analysisState === 'idle' && !screenplay && (
        <EmptyState label="等待小说输入" message="先分析章节，通过 3 章门槛后即可生成剧本。" />
      )}
      {analysisState === 'loading' && (
        <EmptyState label="正在分析章节" message="后端正在识别章节标题、章节数和字数。" />
      )}
      {analysisState === 'error' && (
        <Notice kind="error" label="分析失败" message={analysisError} />
      )}
      {analysisState === 'idle' && screenplay && (
        <div className="analysis-result">
          <CharacterGrid screenplay={screenplay} />
          <MetricGrid metrics={reportMetrics} />
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
                  <span>{chapter.id}</span>
                  <strong>{chapter.title}</strong>
                </div>
                <p>{chapter.preview}</p>
                <small>{chapter.word_count} 字</small>
              </article>
            ))}
          </div>
          <CharacterGrid screenplay={screenplay} />
          {yamlText && <MetricGrid metrics={reportMetrics} />}
        </div>
      )}
    </Panel>
  )
}

export function ScenesPanel({
  analysis,
  characterById,
  generationError,
  generationModel,
  generationState,
  locationById,
  repairRounds,
  screenplay,
  validation,
  yamlText,
}: {
  analysis: ChapterAnalysis | null
  characterById: Lookup<ScriptCharacter>
  generationError: string
  generationModel: string
  generationState: GenerationState
  locationById: Lookup<ScriptLocation>
  repairRounds: number
  screenplay: ScreenplayDocument | null
  validation: ValidationResponse | null
  yamlText: string
}) {
  const scenes = screenplay?.scenes ?? []

  return (
    <Panel className="panel--scenes" kicker="剧本" title="场景卡片">
      {scenes.length > 0 ? (
        <div className="scene-list">
          {scenes.map((scene) => {
            const locationName = scene.location_id
              ? locationById[scene.location_id]?.name
              : '未设置地点'
            const characterNames = (scene.characters ?? [])
              .map((id) => characterById[id]?.name ?? id)
              .join('、')

            return (
              <article className="scene-card" key={scene.id}>
                <div className="scene-card__head">
                  <span>{scene.id}</span>
                  <strong>{scene.title}</strong>
                </div>
                <div className="scene-meta">
                  <span>{locationName}</span>
                  <span>{scene.time_of_day ?? 'unknown'}</span>
                  <span>{characterNames || '无出场人物'}</span>
                </div>
                <p>{scene.summary}</p>
                <small>{scene.conflict}</small>
                <div className="beat-summary">
                  <span>动作 {countBeats(scene, 'action')}</span>
                  <span>对白 {countBeats(scene, 'dialogue')}</span>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="scene-list">
          <article>
            <span>Scene 001</span>
            <strong>
              {yamlText
                ? 'YAML 暂无法解析为场景'
                : analysis?.is_valid
                  ? '可以调用 DeepSeek 生成场景'
                  : '需先通过 3 章校验'}
            </strong>
          </article>
          <article>
            <span>Schema</span>
            <strong>
              {validation?.passed
                ? '校验通过，可以进入编辑导出'
                : validation
                  ? '校验失败，已显示错误'
                  : '生成后会自动校验并尝试修复'}
            </strong>
          </article>
        </div>
      )}
      {generationState === 'error' && (
        <div className="generation-notice">
          <Notice kind="error" label="生成失败" message={generationError} />
        </div>
      )}
      {generationState === 'loading' && (
        <div className="generation-notice">
          <Notice
            kind="warning"
            label="正在生成并校验"
            message="DeepSeek 正在输出剧本，后端会自动进行 Schema 校验与修复。"
          />
        </div>
      )}
      {generationState === 'success' && (
        <div className="generation-notice">
          <Notice kind="success" label="生成完成" message={`模型：${generationModel}，自动修复 ${repairRounds} 轮`} />
        </div>
      )}
    </Panel>
  )
}

export function YamlPanel({
  displayYaml,
  onExportYaml,
  onValidateYaml,
  onYamlChange,
  validation,
  yamlText,
}: {
  displayYaml: string
  onExportYaml: () => void
  onValidateYaml: () => void
  onYamlChange: (value: string) => void
  validation: ValidationResponse | null
  yamlText: string
}) {
  return (
    <Panel className="panel--yaml" kicker="YAML" title="结构化输出">
      <div className="yaml-actions">
        <button type="button" disabled={!yamlText} onClick={onValidateYaml}>
          校验 YAML
        </button>
        <button type="button" disabled={!yamlText} onClick={onExportYaml}>
          导出 YAML
        </button>
        {validation && (
          <span className={validation.passed ? 'validation-chip validation-chip--pass' : 'validation-chip validation-chip--fail'}>
            {validation.passed ? 'Schema 通过' : `Schema 失败：${validation.errors.length} 项`}
          </span>
        )}
      </div>
      <textarea
        className="yaml-editor"
        aria-label="YAML 剧本编辑器"
        disabled={!yamlText}
        value={displayYaml}
        onChange={(event) => onYamlChange(event.target.value)}
      />
      {validation && !validation.passed && (
        <div className="validation-list">
          {validation.errors.slice(0, 6).map((error) => (
            <article key={`${error.path}-${error.message}`}>
              <strong>{error.path}</strong>
              <span>{error.message}</span>
            </article>
          ))}
        </div>
      )}
    </Panel>
  )
}
