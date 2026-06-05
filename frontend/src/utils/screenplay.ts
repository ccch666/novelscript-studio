import { load } from 'js-yaml'

export type ScriptCharacter = {
  id: string
  name: string
  role?: string
  description?: string
}

export type ScriptLocation = {
  id: string
  name: string
}

export type ScriptBeat = {
  type: string
  speaker?: string
  content: string
}

export type ScriptScene = {
  id: string
  title: string
  location_id?: string
  time_of_day?: string
  characters?: string[]
  summary?: string
  conflict?: string
  beats?: ScriptBeat[]
}

export type ScreenplayDocument = {
  metadata?: {
    title?: string
  }
  characters?: ScriptCharacter[]
  locations?: ScriptLocation[]
  scenes?: ScriptScene[]
}

export function parseScreenplayYaml(yamlText: string): ScreenplayDocument | null {
  if (!yamlText.trim()) {
    return null
  }

  const parsed = load(yamlText)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null
  }

  return parsed as ScreenplayDocument
}

export function buildLookup<T extends { id: string }>(items: T[] | undefined): Record<string, T> {
  return Object.fromEntries((items ?? []).map((item) => [item.id, item]))
}

export function countBeats(scene: ScriptScene, type: string): number {
  return (scene.beats ?? []).filter((beat) => beat.type === type).length
}

export function getExportFilename(document: ScreenplayDocument | null): string {
  const title = document?.metadata?.title?.trim() || 'screenplay'
  const safeTitle = title.replace(/[\\/:*?"<>|\s]+/g, '-').replace(/^-+|-+$/g, '')
  return `${safeTitle || 'screenplay'}.yaml`
}
