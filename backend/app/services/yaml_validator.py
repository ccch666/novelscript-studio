import json
from pathlib import Path
from typing import Any

import yaml
from jsonschema import Draft202012Validator

from app.models import ValidationIssue, ValidationResponse


PROJECT_ROOT = Path(__file__).resolve().parents[3]
SCHEMA_PATH = PROJECT_ROOT / "schema" / "screenplay.schema.json"


def validate_screenplay_yaml(yaml_text: str) -> ValidationResponse:
    try:
        parsed = yaml.safe_load(yaml_text)
    except yaml.YAMLError as exc:
        return ValidationResponse(
            passed=False,
            errors=[ValidationIssue(path="<yaml>", message=str(exc))],
        )

    if not isinstance(parsed, dict):
        return ValidationResponse(
            passed=False,
            errors=[ValidationIssue(path="<root>", message="YAML 顶层结构必须是对象。")],
        )

    schema = _load_schema()
    validator = Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(parsed), key=lambda error: list(error.path))

    return ValidationResponse(
        passed=len(errors) == 0,
        errors=[
            ValidationIssue(
                path=_format_error_path(error.path),
                message=error.message,
            )
            for error in errors
        ],
    )


def _load_schema() -> dict[str, Any]:
    return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))


def _format_error_path(path: Any) -> str:
    parts = [str(part) for part in path]
    if not parts:
        return "<root>"
    return ".".join(parts)

