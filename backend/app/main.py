from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.models import (
    ChapterAnalysisRequest,
    ChapterAnalysisResponse,
    GenerateScriptRequest,
    GenerateScriptResponse,
    RepairScriptRequest,
    RepairScriptResponse,
    ValidateScriptRequest,
    ValidationResponse,
)
from app.services.chapter_parser import analyze_novel_chapters
from app.services.llm_client import LLMConfigurationError, LLMRequestError
from app.services.screenplay_generator import generate_screenplay_yaml
from app.services.yaml_repairer import repair_yaml_until_valid
from app.services.yaml_validator import validate_screenplay_yaml
from app.settings import get_settings


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    stage: str


app = FastAPI(
    title="NovelScript Studio API",
    description="FastAPI backend for AI novel-to-screenplay YAML generation.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="novelscript-studio-api",
        version="0.1.0",
        stage="schema-validation",
    )


@app.post("/api/chapters/analyze", response_model=ChapterAnalysisResponse)
async def analyze_chapters(request: ChapterAnalysisRequest) -> ChapterAnalysisResponse:
    return analyze_novel_chapters(request.novel_text)


@app.post("/api/scripts/generate", response_model=GenerateScriptResponse)
async def generate_script(request: GenerateScriptRequest) -> GenerateScriptResponse:
    try:
        yaml_text, chapter_analysis, model = await generate_screenplay_yaml(
            novel_text=request.novel_text,
            style=request.style,
            settings=get_settings(),
        )
        yaml_text, validation, repair_rounds, model = await repair_yaml_until_valid(
            yaml_text=yaml_text,
            settings=get_settings(),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LLMConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except LLMRequestError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return GenerateScriptResponse(
        yaml_text=yaml_text,
        model=model,
        chapter_analysis=chapter_analysis,
        validation=validation,
        repair_rounds=repair_rounds,
    )


@app.post("/api/scripts/validate", response_model=ValidationResponse)
async def validate_script(request: ValidateScriptRequest) -> ValidationResponse:
    return validate_screenplay_yaml(request.yaml_text)


@app.post("/api/scripts/repair", response_model=RepairScriptResponse)
async def repair_script(request: RepairScriptRequest) -> RepairScriptResponse:
    try:
        yaml_text, validation, repair_rounds, model = await repair_yaml_until_valid(
            yaml_text=request.yaml_text,
            settings=get_settings(),
        )
    except LLMConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except LLMRequestError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return RepairScriptResponse(
        yaml_text=yaml_text,
        model=model,
        validation=validation,
        repair_rounds=repair_rounds,
    )
