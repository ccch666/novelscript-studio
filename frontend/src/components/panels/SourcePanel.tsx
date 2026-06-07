import type { ChangeEvent } from 'react'
import type { AnalysisState, GenerationState, SampleState } from '../../types'
import { IconBook, IconBolt, IconCompass, IconSparkles, IconUpload } from '../icons'
import { Panel } from '../common/Panel'

type SourcePanelProps = {
  analysisState: AnalysisState
  canAnalyze: boolean
  canGenerate: boolean
  generationState: GenerationState
  isBusy: boolean
  novelText: string
  sampleState: SampleState
  onAnalyze: () => void
  onFileChange: (file: File | undefined) => void
  onGenerate: () => void
  onLoadSample: () => void
  onLoadSampleOutput: () => void
  onNovelTextChange: (value: string) => void
}

/**
 * 小说文本输入面板。
 * 顶部"评审快速入口"用于一键加载后端示例 YAML 跳过小说输入。
 * 底部主操作区支持 上传 TXT / 加载示例小说 / 分析 / 生成。
 */
export function SourcePanel({
  analysisState,
  canAnalyze,
  canGenerate,
  generationState,
  isBusy,
  novelText,
  sampleState,
  onAnalyze,
  onFileChange,
  onGenerate,
  onLoadSample,
  onLoadSampleOutput,
  onNovelTextChange,
}: SourcePanelProps) {
  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event.target.files?.[0])
  }

  return (
    <Panel
      className="panel--input"
      kicker="输入"
      title="小说文本"
      icon={<IconBook />}
      tone="emerald"
      accessory={
        <span className="panel-tag">
          <IconBook size={12} /> Manuscript
        </span>
      }
    >
      <div className="quick-lane" aria-label="评审快速入口">
        <div>
          <span className="quick-lane__label">Demo Path</span>
          <strong>评审快速入口</strong>
          <span>直接查看完整 YAML、场景卡片和 Schema 结果。</span>
        </div>
        <button type="button" className="demo-action" disabled={isBusy} onClick={onLoadSampleOutput}>
          <IconCompass size={14} />
          {sampleState === 'loading' ? '加载中' : '加载示例 YAML'}
        </button>
      </div>

      <div className="source-rule">
        <span>输入规则</span>
        <strong>至少 3 个章节，生成后自动校验 YAML Schema。</strong>
      </div>

      <div className="editor-shell">
        <div className="editor-toolbar">
          <span><IconBook size={12} /> manuscript.txt</span>
          <span>{novelText.trim().length} chars</span>
        </div>
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
        <div className="panel-actions__secondary">
          <label className="file-button">
            <IconUpload size={14} />
            上传 TXT
            <input type="file" accept=".txt,text/plain" onChange={handleFileInput} />
          </label>
          <button type="button" disabled={isBusy} onClick={onLoadSample}>
            <IconSparkles size={14} />
            加载示例小说
          </button>
        </div>
        <div className="panel-actions__primary">
          <button
            type="button"
            className="primary-action"
            disabled={!canAnalyze}
            onClick={onAnalyze}
          >
            <IconBolt size={14} />
            {analysisState === 'loading' ? '分析中' : '分析章节'}
          </button>
          <button
            type="button"
            className="primary-action primary-action--strong"
            disabled={!canGenerate}
            onClick={onGenerate}
          >
            <IconSparkles size={14} />
            {generationState === 'loading' ? '生成中' : '生成剧本'}
          </button>
        </div>
      </div>
    </Panel>
  )
}
