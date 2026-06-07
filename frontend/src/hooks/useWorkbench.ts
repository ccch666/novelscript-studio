import { useCallback, useMemo, useState } from 'react'
import {
  analyzeChapters,
  generateScript,
  getSampleOutput,
  readTextFile,
  validateScript,
  type ChapterAnalysis,
  type GenerateScriptResponse,
  type ValidationResponse,
} from '../api/client'
import type { AnalysisState, GenerationState, SampleState } from '../types'

const GENERATION_STYLE = 'film'

/**
 * 工作台核心状态机。
 *
 * 负责：
 *  - 维护 novelText / analysis / yamlText / validation 之间的派生关系
 *  - 提供 analyze / generate / loadSample / loadSampleOutput / validate / export 等操作
 *  - 屏蔽各状态之间的细粒度过渡（loading/success/error）
 */
export function useWorkbench() {
  const [novelText, setNovelText] = useState('')
  const [analysis, setAnalysis] = useState<ChapterAnalysis | null>(null)
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle')
  const [analysisError, setAnalysisError] = useState('')

  const [generationState, setGenerationState] = useState<GenerationState>('idle')
  const [generationError, setGenerationError] = useState('')
  const [generationModel, setGenerationModel] = useState('')

  const [sampleState, setSampleState] = useState<SampleState>('idle')

  const [yamlText, setYamlText] = useState('')
  const [validation, setValidation] = useState<ValidationResponse | null>(null)
  const [repairRounds, setRepairRounds] = useState(0)

  const isBusy =
    analysisState === 'loading' || generationState === 'loading' || sampleState === 'loading'
  const canAnalyze = novelText.trim().length > 0 && !isBusy
  const canGenerate = Boolean(analysis?.is_valid) && !isBusy

  const resetWorkspace = useCallback((nextNovelText: string) => {
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
  }, [])

  const analyze = useCallback(async (text: string) => {
    setAnalysisState('loading')
    setAnalysisError('')
    try {
      const result = await analyzeChapters(text)
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
  }, [])

  const generate = useCallback(async (text: string) => {
    setGenerationState('loading')
    setGenerationError('')
    try {
      const result: GenerateScriptResponse = await generateScript(text, GENERATION_STYLE)
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
  }, [])

  const validate = useCallback(async (text: string) => {
    if (!text) {
      return
    }
    try {
      const result = await validateScript(text)
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
  }, [])

  const loadSampleOutput = useCallback(async () => {
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
  }, [])

  const updateYaml = useCallback((value: string) => {
    setYamlText(value)
    setValidation(null)
  }, [])

  const loadFile = useCallback(async (file: File) => {
    try {
      const content = await readTextFile(file)
      resetWorkspace(content)
    } catch (error) {
      setAnalysisState('error')
      setAnalysisError(error instanceof Error ? error.message : '文件读取失败')
    }
  }, [resetWorkspace])

  return useMemo(
    () => ({
      novelText,
      setNovelText: resetWorkspace,
      analysis,
      analysisState,
      analysisError,
      generationState,
      generationError,
      generationModel,
      sampleState,
      yamlText,
      validation,
      repairRounds,
      isBusy,
      canAnalyze,
      canGenerate,
      analyze,
      generate,
      validate,
      loadSampleOutput,
      updateYaml,
      loadFile,
    }),
    [
      novelText,
      resetWorkspace,
      analysis,
      analysisState,
      analysisError,
      generationState,
      generationError,
      generationModel,
      sampleState,
      yamlText,
      validation,
      repairRounds,
      isBusy,
      canAnalyze,
      canGenerate,
      analyze,
      generate,
      validate,
      loadSampleOutput,
      updateYaml,
      loadFile,
    ],
  )
}

export type WorkbenchController = ReturnType<typeof useWorkbench>
