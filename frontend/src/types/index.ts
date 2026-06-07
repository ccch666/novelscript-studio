/**
 * 领域类型集中导出。
 *
 * 这些类型与后端 (backend/app/models.py) 的 Pydantic 模型保持 1:1 同步。
 * 涉及后端契约的类型来自 api/client.ts；解析 YAML 后得到的领域模型
 * （剧本结构）来自 utils/screenplay.ts。
 */

export type {
  ChapterSummary,
  ChapterAnalysis,
  GenerateScriptResponse,
  ValidationIssue,
  ValidationResponse,
} from '../api/client'

export type {
  ScriptBeat,
  ScriptCharacter,
  ScriptLocation,
  ScriptScene,
  ScreenplayDocument,
} from '../utils/screenplay'

/** 后端健康检查状态机。 */
export type HealthState = 'checking' | 'online' | 'offline'

/** 章节分析状态机。 */
export type AnalysisState = 'idle' | 'loading' | 'success' | 'error'

/** 剧本生成状态机。 */
export type GenerationState = 'idle' | 'loading' | 'success' | 'error'

/** 示例 YAML 加载状态机。 */
export type SampleState = 'idle' | 'loading' | 'error'

/** 改编报告核心指标。 */
export type AdaptationMetrics = {
  sceneCount: number
  characterCount: number
  dialogueCount: number
  actionCount: number
  validationStatus: string
  repairRounds: number
}

/** 工具函数：把状态值映射为更精细的展示标签（保留给 hooks/components 共用）。 */
export const HEALTH_LABEL: Record<HealthState, string> = {
  checking: '连接中',
  online: '后端在线',
  offline: '后端离线',
}
