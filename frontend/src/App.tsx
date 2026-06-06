import { useEffect, useMemo, useState } from 'react'
import {
  analyzeChapters,
  generateScript,
  getSampleOutput,
  readTextFile,
  validateScript,
  type ChapterAnalysis,
  type ValidationResponse,
} from './api/client'
import {
  AppHeader,
  InsightPanel,
  ScenesPanel,
  SourcePanel,
  WorkflowStatus,
  YamlPanel,
  type AnalysisState,
  type GenerationState,
  type HealthState,
  type SampleState,
} from './components/WorkbenchShell'
import { sampleNovel } from './data/sampleNovel'
import {
  buildAdaptationMetrics,
  buildLookup,
  getExportFilename,
  parseScreenplayYaml,
} from './utils/screenplay'
import './App.css'

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
  const [sampleState, setSampleState] = useState<SampleState>('idle')
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

  const isBusy = analysisState === 'loading' || generationState === 'loading' || sampleState === 'loading'
  const canAnalyze = novelText.trim().length > 0 && !isBusy
  const canGenerate = Boolean(analysis?.is_valid) && !isBusy
  const screenplay = useMemo(() => {
    try {
      return parseScreenplayYaml(yamlText)
    } catch {
      return null
    }
  }, [yamlText])
  const characterById = useMemo(() => buildLookup(screenplay?.characters), [screenplay])
  const locationById = useMemo(() => buildLookup(screenplay?.locations), [screenplay])
  const adaptationMetrics = useMemo(() => buildAdaptationMetrics(screenplay), [screenplay])
  const chapterCount = analysis?.chapter_count ?? screenplay?.source?.chapter_count
  const hasValidChapterCount =
    analysis?.is_valid ?? (typeof screenplay?.source?.chapter_count === 'number' && screenplay.source.chapter_count >= 3)
  const displayYaml =
    yamlText || EMPTY_YAML.replace('chapter_count: 0', `chapter_count: ${analysis?.chapter_count ?? 0}`)

  function resetWorkspace(nextNovelText = novelText) {
    setNovelText(nextNovelText)
    setAnalysis(null)
    setAnalysisState('idle')
    setAnalysisError('')
    setGenerationState('idle')
    setGenerationError('')
    setSampleState('idle')
    setYamlText('')
    setValidation(null)
    setRepairRounds(0)
  }

  async function handleAnalyze() {
    setAnalysisState('loading')
    setAnalysisError('')

    try {
      const result = await analyzeChapters(novelText)
      setAnalysis(result)
      setAnalysisState('success')
      setGenerationState('idle')
      setGenerationError('')
      setSampleState('idle')
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
      resetWorkspace(content)
    } catch (error) {
      setAnalysisState('error')
      setAnalysisError(error instanceof Error ? error.message : '文件读取失败')
    }
  }

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

  async function handleLoadSampleOutput() {
    setSampleState('loading')
    setGenerationError('')

    try {
      const output = await getSampleOutput()
      setYamlText(output)
      setGenerationState('success')
      setGenerationError('')
      setGenerationModel('sample-output')
      setRepairRounds(0)
      const result = await validateScript(output)
      setValidation(result)
      setSampleState('idle')
    } catch (error) {
      setSampleState('error')
      setGenerationState('error')
      setGenerationError(error instanceof Error ? error.message : '示例 YAML 加载失败')
    }
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
      <AppHeader health={health} healthMessage={healthMessage} />
      <WorkflowStatus
        chapterCount={chapterCount}
        hasValidChapterCount={hasValidChapterCount}
        validation={validation}
        yamlText={yamlText}
      />
      <section className="workspace-grid">
        <div className="workspace-column workspace-column--source">
          <SourcePanel
            analysisState={analysisState}
            canAnalyze={canAnalyze}
            canGenerate={canGenerate}
            generationState={generationState}
            isBusy={isBusy}
            novelText={novelText}
            onAnalyze={handleAnalyze}
            onFileChange={handleFileChange}
            onGenerate={handleGenerate}
            onLoadSample={() => resetWorkspace(sampleNovel)}
            onLoadSampleOutput={handleLoadSampleOutput}
            onNovelTextChange={resetWorkspace}
            sampleState={sampleState}
          />
        </div>
        <div className="workspace-column workspace-column--review">
          <InsightPanel
            adaptationMetrics={adaptationMetrics}
            analysis={analysis}
            analysisError={analysisError}
            analysisState={analysisState}
            repairRounds={repairRounds}
            screenplay={screenplay}
            validation={validation}
            yamlText={yamlText}
          />
          <ScenesPanel
            analysis={analysis}
            characterById={characterById}
            generationError={generationError}
            generationModel={generationModel}
            generationState={generationState}
            locationById={locationById}
            repairRounds={repairRounds}
            screenplay={screenplay}
            validation={validation}
            yamlText={yamlText}
          />
          <YamlPanel
            displayYaml={displayYaml}
            onExportYaml={handleExportYaml}
            onValidateYaml={handleValidateYaml}
            onYamlChange={handleYamlChange}
            validation={validation}
            yamlText={yamlText}
          />
        </div>
      </section>
    </main>
  )
}

export default App
