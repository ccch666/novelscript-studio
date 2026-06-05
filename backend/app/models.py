from pydantic import BaseModel, Field


class ChapterAnalysisRequest(BaseModel):
    novel_text: str = Field(..., min_length=1)


class ChapterSummary(BaseModel):
    id: str
    title: str
    word_count: int
    preview: str


class ChapterAnalysisResponse(BaseModel):
    chapter_count: int
    is_valid: bool
    total_word_count: int
    message: str
    chapters: list[ChapterSummary]

