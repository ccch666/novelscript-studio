import type { ValidationResponse } from '../../api/client'
import { IconCheck, IconCross, IconDoc, IconDownload, IconShield } from '../icons'
import { Panel } from '../common/Panel'

type YamlPanelProps = {
  displayYaml: string
  validation: ValidationResponse | null
  yamlText: string
  onExportYaml: () => void
  onValidateYaml: () => void
  onYamlChange: (value: string) => void
}

/**
 * YAML 剧本编辑面板。
 * - 顶部 action bar：校验 / 导出 / 校验结果 chip
 * - 中部 textarea：可编辑 / 只读切换
 * - 底部错误列表：最多 6 条
 */
export function YamlPanel({
  displayYaml,
  validation,
  yamlText,
  onExportYaml,
  onValidateYaml,
  onYamlChange,
}: YamlPanelProps) {
  return (
    <Panel
      className="panel--yaml"
      kicker="YAML"
      title="结构化输出"
      icon={<IconDoc />}
      tone="teal"
      accessory={
        validation ? (
          <span
            className={
              validation.passed
                ? 'validation-chip validation-chip--pass'
                : 'validation-chip validation-chip--fail'
            }
          >
            {validation.passed ? <IconCheck size={12} /> : <IconCross size={12} />}
            {validation.passed ? 'Schema 通过' : `Schema 失败：${validation.errors.length} 项`}
          </span>
        ) : (
          <span className="panel-tag">
            <IconShield size={12} /> 未校验
          </span>
        )
      }
    >
      <div className="yaml-actions">
        <button type="button" className="primary-action primary-action--amber" disabled={!yamlText} onClick={onValidateYaml}>
          <IconShield size={14} />
          校验 YAML
        </button>
        <button type="button" className="ghost-action ghost-action--teal" disabled={!yamlText} onClick={onExportYaml}>
          <IconDownload size={14} />
          导出 YAML
        </button>
      </div>

      <div className="yaml-editor-shell">
        <div className="yaml-editor-top">
          <span><IconDoc size={12} /> screenplay.yaml</span>
          <span>{yamlText ? 'editable' : 'preview'}</span>
        </div>
        <div className="yaml-editor-body">
          <div className="yaml-line-numbers" aria-hidden="true">
            {(displayYaml ? displayYaml.split('\n') : ['']).map((_, idx) => (
              <span key={idx}>{idx + 1}</span>
            ))}
          </div>
          <textarea
            className="yaml-editor"
            aria-label="YAML 剧本编辑器"
            disabled={!yamlText}
            value={displayYaml}
            onChange={(event) => onYamlChange(event.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

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
