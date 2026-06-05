from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.models import ChapterAnalysisRequest, ChapterAnalysisResponse
from app.services.chapter_parser import analyze_novel_chapters


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
        stage="chapter-analysis",
    )


@app.post("/api/chapters/analyze", response_model=ChapterAnalysisResponse)
async def analyze_chapters(request: ChapterAnalysisRequest) -> ChapterAnalysisResponse:
    return analyze_novel_chapters(request.novel_text)
