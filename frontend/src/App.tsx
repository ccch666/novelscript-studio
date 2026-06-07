import { useMemo } from 'react'
import './App.css'
import { AppHeader } from './components/AppHeader'
import { WorkflowStatus } from './components/WorkflowStatus'
import { InsightPanel } from './components/panels/InsightPanel'
import { ScenesPanel } from './components/panels/ScenesPanel'
import { SourcePanel } from './components/panels/SourcePanel'
import { YamlPanel } from './components/panels/YamlPanel'
import { sampleNovel } from './data/sampleNovel'
import { useHealthCheck } from './hooks/useHealthCheck'
import { useScreenplayView } from './hooks/useScreenplayView'
import { useWorkbench } from './hooks/useWorkbench'
import { getExportFilename, type ScreenplayDocument } from './utils/screenplay'

const DEFAULT_YAML_TEMPLATE = `metadata:
  title: ""
source:
  chapter_count: 0
characters: []
locations: []
scenes: []`

function buildPreviewYaml(
  analysisChapterCount: number | undefined,
  fallback: number,
  existingYaml: string,
): string {
  if (existingYaml) {
    return existingYaml
  }
  const chapterCount = analysisChapterCount ?? fallback
  return DEFAULT_YAML_TEMPLATE.replace('chapter_count: 0', `chapter_count: ${chapterCount}`)
}

function downloadYaml(yamlText: string, screenplay: ScreenplayDocument | null) {
  if (!yamlText) {
    return
  }
  const blob = new Blob([yamlText], { type: 'application/x-yaml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = getExportFilename(screenplay)
  link.click()
  URL.revokeObjectURL(url)
}

function App() {
  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
    [],
  )

  const { health, message: healthMessage } = useHealthCheck(apiBaseUrl)
  const workbench = useWorkbench()
  const screenplayView = useScreenplayView(workbench.yamlText)

  const chapterCount = workbench.analysis?.chapter_count ?? screenplayView.document?.source?.chapter_count
  const hasValidChapterCount =
    workbench.analysis?.is_valid ??
    (typeof screenplayView.document?.source?.chapter_count === 'number' &&
      screenplayView.document.source.chapter_count >= 3)

  const displayYaml = buildPreviewYaml(
    workbench.analysis?.chapter_count,
    chapterCount ?? 0,
    workbench.yamlText,
  )

  return (
    <main className="workspace-shell">
      <div className="workspace-stage">
        <AppHeader health={health} healthMessage={healthMessage} />
        <WorkflowStatus
          chapterCount={chapterCount}
          hasValidChapterCount={hasValidChapterCount}
          validation={workbench.validation}
          yamlText={workbench.yamlText}
        />
        <section className="workspace-grid">
          <div className="workspace-column workspace-column--source">
            <SourcePanel
              analysisState={workbench.analysisState}
              canAnalyze={workbench.canAnalyze}
              canGenerate={workbench.canGenerate}
              generationState={workbench.generationState}
              isBusy={workbench.isBusy}
              novelText={workbench.novelText}
              sampleState={workbench.sampleState}
              onAnalyze={() => workbench.analyze(workbench.novelText)}
              onFileChange={(file) => {
                if (file) {
                  workbench.loadFile(file)
                }
              }}
              onGenerate={() => workbench.generate(workbench.novelText)}
              onLoadSample={() => workbench.setNovelText(sampleNovel)}
              onLoadSampleOutput={workbench.loadSampleOutput}
              onNovelTextChange={workbench.setNovelText}
            />
          </div>
          <div className="workspace-column workspace-column--review">
            <InsightPanel
              analysis={workbench.analysis}
              analysisError={workbench.analysisError}
              analysisState={workbench.analysisState}
              metrics={screenplayView.metrics}
              repairRounds={workbench.repairRounds}
              screenplay={screenplayView.document}
              validation={workbench.validation}
              yamlText={workbench.yamlText}
            />
            <ScenesPanel
              analysis={workbench.analysis}
              characterById={screenplayView.characterById}
              generationError={workbench.generationError}
              generationModel={workbench.generationModel}
              generationState={workbench.generationState}
              locationById={screenplayView.locationById}
              repairRounds={workbench.repairRounds}
              screenplay={screenplayView.document}
              validation={workbench.validation}
              yamlText={workbench.yamlText}
            />
            <YamlPanel
              displayYaml={displayYaml}
              validation={workbench.validation}
              yamlText={workbench.yamlText}
              onExportYaml={() => downloadYaml(workbench.yamlText, screenplayView.document)}
              onValidateYaml={() => workbench.validate(workbench.yamlText)}
              onYamlChange={workbench.updateYaml}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
