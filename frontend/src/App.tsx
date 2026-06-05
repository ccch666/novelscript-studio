import { useEffect, useMemo, useState } from 'react'
import './App.css'

type HealthState = 'checking' | 'online' | 'offline'

function App() {
  const [health, setHealth] = useState<HealthState>('checking')
  const [healthMessage, setHealthMessage] = useState('正在连接 FastAPI 后端')
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
        <span>阶段 1：前后端工程骨架</span>
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
            placeholder="阶段 3 将支持粘贴 3 个章节以上的小说文本"
            disabled
          />
          <div className="panel-actions">
            <button type="button" disabled>
              加载示例
            </button>
            <button type="button" className="primary-action" disabled>
              生成剧本
            </button>
          </div>
        </div>

        <div className="panel panel--analysis">
          <div className="panel-heading">
            <p className="panel-kicker">分析</p>
            <h2>章节与人物</h2>
          </div>
          <div className="empty-state">
            <strong>等待小说输入</strong>
            <span>章节识别、人物提取和地点提取将在这里展示。</span>
          </div>
        </div>

        <div className="panel panel--scenes">
          <div className="panel-heading">
            <p className="panel-kicker">剧本</p>
            <h2>场景卡片</h2>
          </div>
          <div className="scene-list">
            <article>
              <span>Scene 001</span>
              <strong>来源章节、地点、时间、人物、动作与对白</strong>
            </article>
            <article>
              <span>Schema</span>
              <strong>后续生成结果会先校验，再允许导出</strong>
            </article>
          </div>
        </div>

        <div className="panel panel--yaml">
          <div className="panel-heading">
            <p className="panel-kicker">YAML</p>
            <h2>结构化输出</h2>
          </div>
          <pre>{`metadata:
  title: ""
source:
  chapter_count: 0
characters: []
locations: []
scenes: []`}</pre>
        </div>
      </section>
    </main>
  )
}

export default App
