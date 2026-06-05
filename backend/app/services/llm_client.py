from typing import Any

import httpx

from app.settings import Settings


class LLMConfigurationError(RuntimeError):
    pass


class LLMRequestError(RuntimeError):
    pass


class DeepSeekClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def chat(self, messages: list[dict[str, str]], temperature: float = 0.2) -> str:
        if not self.settings.deepseek_api_key:
            raise LLMConfigurationError("缺少 DEEPSEEK_API_KEY，请在 backend/.env 中配置。")

        payload: dict[str, Any] = {
            "model": self.settings.deepseek_model,
            "messages": messages,
            "temperature": temperature,
            "stream": False,
        }
        endpoint = f"{self.settings.deepseek_base_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.settings.deepseek_api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(
            timeout=self.settings.llm_timeout_seconds,
            trust_env=False,
        ) as client:
            response = await client.post(endpoint, json=payload, headers=headers)

        if response.status_code >= 400:
            raise LLMRequestError(f"DeepSeek API 请求失败：HTTP {response.status_code} {response.text}")

        data = response.json()
        try:
            return str(data["choices"][0]["message"]["content"])
        except (KeyError, IndexError, TypeError) as exc:
            raise LLMRequestError("DeepSeek API 返回结构不符合预期。") from exc

