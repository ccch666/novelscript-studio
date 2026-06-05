import re
from pathlib import Path

from app.models import ValidationIssue, ValidationResponse
from app.services.llm_client import DeepSeekClient
from app.services.yaml_validator import validate_screenplay_yaml
from app.settings import Settings


PROMPT_DIR = Path(__file__).resolve().parents[1] / "prompts"


async def repair_yaml_until_valid(
    yaml_text: str,
    settings: Settings,
    max_rounds: int = 2,
) -> tuple[str, ValidationResponse, int, str]:
    validation = validate_screenplay_yaml(yaml_text)
    repair_rounds = 0
    model = settings.deepseek_model

    while not validation.passed and repair_rounds < max_rounds:
        yaml_text = await _repair_once(yaml_text, validation.errors, settings)
        repair_rounds += 1
        validation = validate_screenplay_yaml(yaml_text)

    return yaml_text, validation, repair_rounds, model


async def _repair_once(
    yaml_text: str,
    errors: list[ValidationIssue],
    settings: Settings,
) -> str:
    prompt = (PROMPT_DIR / "repair_yaml.txt").read_text(encoding="utf-8")
    client = DeepSeekClient(settings)
    error_text = "\n".join(f"- {error.path}: {error.message}" for error in errors[:20])
    repaired = await client.chat(
        messages=[
            {
                "role": "system",
                "content": prompt,
            },
            {
                "role": "user",
                "content": f"""Schema 校验错误：
{error_text}

需要修复的 YAML：
{yaml_text}
""",
            },
        ],
        temperature=0.1,
    )
    return _extract_yaml(repaired)


def _extract_yaml(model_output: str) -> str:
    fenced_match = re.search(r"```(?:yaml|yml)?\s*(.*?)```", model_output, re.DOTALL | re.IGNORECASE)
    if fenced_match:
        return fenced_match.group(1).strip()
    return model_output.strip()

