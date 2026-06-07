import type { ChapterAnalysis, ValidationResponse } from '../../api/client'
import type { GenerationState, ScreenplayDocument, ScriptCharacter, ScriptLocation } from '../../types'
import { IconChat, IconClock, IconPin, IconQuote, IconUsers, IconWave } from '../icons'
import { Notice } from '../common/Notice'
import { Panel } from '../common/Panel'
import { countBeats } from '../../utils/screenplay'

type Lookup<T> = Record<string, T>

type ScenesPanelProps = {
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
}

/**
 * 场景卡片时间线。
 * 优先渲染解析后的 scenes；无场景时给出引导。
 * 底部根据 generationState 渲染 loading / success / error 通知。
 */
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
}: ScenesPanelProps) {
  const scenes = screenplay?.scenes ?? []

  return (
    <Panel
      className="panel--scenes"
      kicker="剧本"
      title="场景卡片"
      icon={<IconWave />}
      tone="rose"
      accessory={
        <span className="panel-tag">
          <IconWave size={12} /> {scenes.length} scenes
        </span>
      }
    >
      {scenes.length > 0 ? (
        <div className="scene-list scene-list--timeline">
          {scenes.map((scene, index) => {
            const locationName = scene.location_id
              ? locationById[scene.location_id]?.name
              : '未设置地点'
            const characterNames = (scene.characters ?? [])
              .map((id) => characterById[id]?.name ?? id)
              .join('、')

            return (
              <article className="scene-row" key={scene.id}>
                <div className="scene-card__head">
                  <span className="scene-card__id">
                    <IconQuote size={11} />
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <strong>{scene.title}</strong>
                </div>
                <div className="scene-meta">
                  <span><IconPin size={11} /> {locationName}</span>
                  <span><IconClock size={11} /> {scene.time_of_day ?? 'unknown'}</span>
                  <span><IconUsers size={11} /> {characterNames || '无出场人物'}</span>
                </div>
                <p>{scene.summary}</p>
                {scene.conflict && <small className="scene-conflict"><IconWave size={11} /> 冲突：{scene.conflict}</small>}
                <div className="beat-summary">
                  <span><IconWave size={11} /> 动作 {countBeats(scene, 'action')}</span>
                  <span><IconChat size={11} /> 对白 {countBeats(scene, 'dialogue')}</span>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="scene-list scene-list--placeholder">
          <div className="scene-row">
            <span><IconQuote size={11} /> Scene 001</span>
            <strong>
              {yamlText
                ? 'YAML 暂无法解析为场景'
                : analysis?.is_valid
                  ? '可以调用 DeepSeek 生成场景'
                  : '需先通过 3 章校验'}
            </strong>
          </div>
          <div className="scene-row">
            <span><IconWave size={11} /> Schema</span>
            <strong>
              {validation?.passed
                ? '校验通过，可以进入编辑导出'
                : validation
                  ? '校验失败，已显示错误'
                  : '生成后会自动校验并尝试修复'}
            </strong>
          </div>
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
            kind="info"
            label="正在生成并校验"
            message="DeepSeek 正在输出剧本，后端会自动进行 Schema 校验与修复。"
          />
        </div>
      )}
      {generationState === 'success' && (
        <div className="generation-notice">
          <Notice
            kind="success"
            label="生成完成"
            message={`模型：${generationModel}，自动修复 ${repairRounds} 轮`}
          />
        </div>
      )}
    </Panel>
  )
}
