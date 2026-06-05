import re
from pathlib import Path

from app.models import ChapterAnalysisResponse
from app.services.chapter_parser import analyze_novel_chapters
from app.services.llm_client import DeepSeekClient
from app.settings import Settings


PROMPT_DIR = Path(__file__).resolve().parents[1] / "prompts"


async def generate_screenplay_yaml(
    novel_text: str,
    style: str,
    settings: Settings,
) -> tuple[str, ChapterAnalysisResponse, str]:
    chapter_analysis = analyze_novel_chapters(novel_text)
    if not chapter_analysis.is_valid:
        raise ValueError(chapter_analysis.message)

    prompt = _load_prompt("generate_screenplay.txt")
    client = DeepSeekClient(settings)
    yaml_text = await client.chat(
        messages=[
            {
                "role": "system",
                "content": prompt,
            },
            {
                "role": "user",
                "content": _build_user_prompt(novel_text, style, chapter_analysis),
            },
        ],
        temperature=0.2,
    )

    return _extract_yaml(yaml_text), chapter_analysis, settings.deepseek_model


def _load_prompt(filename: str) -> str:
    return (PROMPT_DIR / filename).read_text(encoding="utf-8")


def _build_user_prompt(
    novel_text: str,
    style: str,
    chapter_analysis: ChapterAnalysisResponse,
) -> str:
    chapters = "\n".join(
        f"- {chapter.id}: {chapter.title}（{chapter.word_count} 字）"
        for chapter in chapter_analysis.chapters
    )
    return f"""目标剧本风格：{style}

已识别章节：
{chapters}

小说原文：
{novel_text}
"""


def _extract_yaml(model_output: str) -> str:
    fenced_match = re.search(r"```(?:yaml|yml)?\s*(.*?)```", model_output, re.DOTALL | re.IGNORECASE)
    if fenced_match:
        return fenced_match.group(1).strip()
    return model_output.strip()

