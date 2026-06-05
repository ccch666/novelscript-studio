export type ChapterSummary = {
  id: string
  title: string
  word_count: number
  preview: string
}

export type ChapterAnalysis = {
  chapter_count: number
  is_valid: boolean
  total_word_count: number
  message: string
  chapters: ChapterSummary[]
}

export type GenerateScriptResponse = {
  yaml_text: string
  model: string
  chapter_analysis: ChapterAnalysis
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export async function analyzeChapters(novelText: string): Promise<ChapterAnalysis> {
  const response = await fetch(`${API_BASE_URL}/api/chapters/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ novel_text: novelText }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `HTTP ${response.status}`)
  }

  return response.json()
}

export async function generateScript(novelText: string, style = 'film'): Promise<GenerateScriptResponse> {
  const response = await fetch(`${API_BASE_URL}/api/scripts/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ novel_text: novelText, style }),
  })

  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    throw new Error(detail?.detail || `HTTP ${response.status}`)
  }

  return response.json()
}

export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}
