import { useMemo } from 'react'
import {
  buildAdaptationMetrics,
  buildLookup,
  parseScreenplayYaml,
  type ScriptCharacter,
  type ScriptLocation,
  type ScreenplayDocument,
} from '../utils/screenplay'
import type { AdaptationMetrics } from '../types'

type Lookup<T> = Record<string, T>

type ScreenplayView = {
  document: ScreenplayDocument | null
  characterById: Lookup<ScriptCharacter>
  locationById: Lookup<ScriptLocation>
  metrics: AdaptationMetrics
}

/**
 * 把 yaml 文本解析为结构化剧本视图。
 * 解析失败时 document 为 null，其它 lookup 仍保持空对象，保证 UI 安全渲染。
 */
export function useScreenplayView(yamlText: string): ScreenplayView {
  const document = useMemo(() => {
    try {
      return parseScreenplayYaml(yamlText)
    } catch {
      return null
    }
  }, [yamlText])

  const characterById = useMemo(() => buildLookup(document?.characters), [document])
  const locationById = useMemo(() => buildLookup(document?.locations), [document])
  const metrics = useMemo(() => buildAdaptationMetrics(document), [document])

  return { document, characterById, locationById, metrics }
}
