import { useEffect, useMemo, useState } from 'react'
import {
  analyzeChapters,
  generateScript,
  readTextFile,
  validateScript,
  type ChapterAnalysis,
  type ValidationResponse,
} from './api/client'
import { sampleNovel } from './data/sampleNovel'
import {
  buildLookup,
  countBeats,
  getExportFilename,
  parseScreenplayYaml,
} from './utils/screenplay'
import './App.css'

type HealthState = 'checking' | 'online' | 'offline'
type AnalysisState = 'idle' | 'loading' | 'success' | 'error'
type GenerationState = 'idle' | 'loading' | 'success' | 'error'

const EMPTY_YAML = `metadata:
  title: ""
source:
  chapter_count: 0
characters: []
locations: []
scenes: []`

function App() {
  const [health, setHealth] = useState<HealthState>('checking')
  const [healthMessage, setHealthMessage] = useState('正在连接 FastAPI 后端')
  const [novelText, setNovelText] = useState('')
  const [analysis, setAnalysis] = useState<ChapterAnalysis | null>(null)
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle')
  const [analysisError, setAnalysisError] = useState('')
  const [generationState, setGenerationState] = useState<GenerationState>('idle')
  const [generationError, setGenerationError] = useState('')
  const [yamlText, setYamlText] = useState('')
  const [generationModel, setGenerationModel] = useState('')
  const [validation, setValidation] = useState<ValidationResponse | null>(null)
  const [repairRounds, setRepairRounds] = useState(0)
  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
    [],
  )

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${apiBaseUrl}/api/health`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()
        setHealth('online')
        setHealthMessage(`${data.service} ${data.version}`)
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) {
          return
        }
        setHealth('offline')
        setHealthMessage(error.message)
      })

    return () => controller.abort()
  }, [apiBaseUrl])

  async function handleAnalyze() {
    setAnalysisState('loading')
    setAnalysisError('')

    try {
      const result = await analyzeChapters(novelText)
      setAnalysis(result)
      setAnalysisState('success')
      setGenerationState('idle')
      setGenerationError('')
      setYamlText('')
      setValidation(null)
      setRepairRounds(0)
    } catch (error) {
      setAnalysisState('error')
      setAnalysisError(error instanceof Error ? error.message : '章节分析失败')
    }
  }

  async function handleFileChange(file: File | undefined) {
    if (!file) {
      return
    }

    try {
      const content = await readTextFile(file)
      setNovelText(content)
      setAnalysis(null)
      setAnalysisState('idle')
      setAnalysisError('')
      setGenerationState('idle')
      setGenerationError('')
      setYamlText('')
      setValidation(null)
      setRepairRounds(0)
    } catch (error) {
      setAnalysisState('error')
      setAnalysisError(error instanceof Error ? error.message : '文件读取失败')
    }
  }

  function handleLoadSample() {
    setNovelText(sampleNovel)
    setAnalysis(null)
    setAnalysisState('idle')
    setAnalysisError('')
    setGenerationState('idle')
    setGenerationError('')
    setYamlText('')
    setValidation(null)
    setRepairRounds(0)
  }

  const canAnalyze = novelText.trim().length > 0 && analysisState !== 'loading'
  const canGenerate =
    Boolean(analysis?.is_valid) && generationState !== 'loading' && analysisState !== 'loading'
  const screenplay = useMemo(() => {
    try {
      return parseScreenplayYaml(yamlText)
    } catch {
      return null
    }
  }, [yamlText])
  const characterById = useMemo(() => buildLookup(screenplay?.characters), [screenplay])
  const locationById = useMemo(() => buildLookup(screenplay?.locations), [screenplay])
  const scenes = screenplay?.scenes ?? []

  function handleYamlChange(value: string) {
    setYamlText(value)
    setValidation(null)
  }

  async function handleValidateYaml() {
    if (!yamlText) {
      return
    }

    try {
      const result = await validateScript(yamlText)
      setValidation(result)
    } catch (error) {
      setValidation({
        passed: false,
        errors: [
          {
            path: '<request>',
            message: error instanceof Error ? error.message : 'YAML 校验失败',
          },
        ],
      })
    }
  }

  function handleExportYaml() {
    if (!yamlText) {
      return
    }

    const blob = new Blob([yamlText], { type: 'application/x-yaml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = getExportFilename(screenplay)
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleGenerate() {
    setGenerationState('loading')
    setGenerationError('')

    try {
      const result = await generateScript(novelText, 'film')
      setYamlText(result.yaml_text)
      setAnalysis(result.chapter_analysis)
      setGenerationModel(result.model)
      setValidation(result.validation)
      setRepairRounds(result.repair_rounds)
      setGenerationState('success')
    } catch (error) {
      setGenerationState('error')
      setGenerationError(error instanceof Error ? error.message : '剧本生成失败')
    }
  }

  return (
    <main className="workspace-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">AI 小说剧本改编工作台</p>
          <h1>NovelScript Studio</h1>
        </div>
        <div className={`status-pill status-pill--${health}`}>
          <span className="status-dot" aria-hidden="true" />
          <span>{health === 'checking' ? '连接中' : health === 'online' ? '后端在线' : '后端离线'}</span>
        </div>
      </header>

      <section className="status-bar">
        <span>阶段 6：剧本预览、编辑与导出</span>
        <code>{healthMessage}</code>
      </section>

      <section className="workspace-grid">
        <div className="panel panel--input">
          <div className="panel-heading">
            <p className="panel-kicker">输入</p>
            <h2>小说文本</h2>
          </div>
          <textarea
            aria-label="小说文本输入"
            value={novelText}
            placeholder="粘贴 3 个章节以上的小说文本，例如：第一章、第二章、第三章..."
            onChange={(event) => {
              setNovelText(event.target.value)
              setAnalysis(null)
              setAnalysisState('idle')
              setAnalysisError('')
              setGenerationState('idle')
              setGenerationError('')
              setYamlText('')
              setValidation(null)
              setRepairRounds(0)
            }}
          />
          <div className="panel-actions">
            <label className="file-button">
              上传 TXT
              <input
                type="file"
                accept=".txt,text/plain"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
              />
            </label>
            <button type="button" onClick={handleLoadSample}>
              加载示例
            </button>
            <button type="button" className="primary-action" disabled={!canAnalyze} onClick={handleAnalyze}>
              {analysisState === 'loading' ? '分析中' : '分析章节'}
            </button>
            <button type="button" className="primary-action" disabled={!canGenerate} onClick={handleGenerate}>
              {generationState === 'loading' ? '生成中' : '生成剧本'}
            </button>
          </div>
        </div>

        <div className="panel panel--analysis">
          <div className="panel-heading">
            <p className="panel-kicker">分析</p>
            <h2>章节与人物</h2>
          </div>
          {analysisState === 'idle' && (
            <div className="empty-state">
              <strong>等待小说输入</strong>
              <span>章节识别结果将在这里展示，阶段 4 后会继续增加人物和地点提取。</span>
            </div>
          )}
          {analysisState === 'loading' && (
            <div className="empty-state">
              <strong>正在分析章节</strong>
              <span>FastAPI 后端正在识别章节标题、章节数和字数。</span>
            </div>
          )}
          {analysisState === 'error' && (
            <div className="notice notice--error">
              <strong>分析失败</strong>
              <span>{analysisError}</span>
            </div>
          )}
          {analysisState === 'success' && analysis && (
            <div className="analysis-result">
              <div className={`notice ${analysis.is_valid ? 'notice--success' : 'notice--warning'}`}>
                <strong>{analysis.is_valid ? '满足题目要求' : '章节数不足'}</strong>
                <span>{analysis.message}</span>
              </div>
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
              {screenplay?.characters?.length ? (
                <div className="character-list">
                  {screenplay.characters.map((character) => (
                    <article key={character.id}>
                      <span>{character.id}</span>
                      <strong>{character.name}</strong>
                      <small>{character.role ?? 'unknown'}</small>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="panel panel--scenes">
          <div className="panel-heading">
            <p className="panel-kicker">剧本</p>
            <h2>场景卡片</h2>
          </div>
          {scenes.length > 0 ? (
            <div className="scene-list">
              {scenes.map((scene) => {
                const locationName = scene.location_id ? locationById[scene.location_id]?.name : '未设置地点'
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
                <strong>{yamlText ? 'YAML 暂无法解析为场景' : analysis?.is_valid ? '可以调用 DeepSeek 生成场景' : '需先通过 3 章校验'}</strong>
              </article>
              <article>
                <span>Schema</span>
                <strong>{validation?.passed ? '校验通过，可以进入编辑导出' : validation ? '校验失败，已显示错误' : '生成后会自动校验并尝试修复'}</strong>
              </article>
            </div>
          )}
          {generationState === 'error' && (
            <div className="notice notice--error generation-notice">
              <strong>生成失败</strong>
              <span>{generationError}</span>
            </div>
          )}
          {generationState === 'success' && (
            <div className="notice notice--success generation-notice">
              <strong>生成完成</strong>
              <span>模型：{generationModel}，自动修复 {repairRounds} 轮</span>
            </div>
          )}
        </div>

        <div className="panel panel--yaml">
          <div className="panel-heading">
            <p className="panel-kicker">YAML</p>
            <h2>结构化输出</h2>
          </div>
          <div className="yaml-actions">
            <button
              type="button"
              disabled={!yamlText}
              onClick={handleValidateYaml}
            >
              校验 YAML
            </button>
            <button type="button" disabled={!yamlText} onClick={handleExportYaml}>
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
            value={yamlText || EMPTY_YAML.replace('chapter_count: 0', `chapter_count: ${analysis?.chapter_count ?? 0}`)}
            onChange={(event) => handleYamlChange(event.target.value)}
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
        </div>
      </section>
    </main>
  )
}

export default App
