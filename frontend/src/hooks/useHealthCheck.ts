import { useEffect, useState } from 'react'
import type { HealthState } from '../types'

type HealthCheck = {
  health: HealthState
  message: string
}

/**
 * 探测后端 /api/health，返回连接状态机。
 *
 * - checking: 正在请求中
 * - online: 200 + JSON 已解析
 * - offline: 任意失败 / 主动 abort
 */
export function useHealthCheck(apiBaseUrl: string): HealthCheck {
  const [health, setHealth] = useState<HealthState>('checking')
  const [message, setMessage] = useState('正在连接 FastAPI 后端')

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${apiBaseUrl}/api/health`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = (await response.json()) as { service: string; version: string }
        setHealth('online')
        setMessage(`${data.service} ${data.version}`)
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) {
          return
        }
        setHealth('offline')
        setMessage(error.message)
      })

    return () => controller.abort()
  }, [apiBaseUrl])

  return { health, message }
}
