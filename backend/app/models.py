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


class ValidationIssue(BaseModel):
    path: str
    message: str


class ValidationResponse(BaseModel):
    passed: bool
    errors: list[ValidationIssue]


class GenerateScriptRequest(BaseModel):
    novel_text: str = Field(..., min_length=1)
    style: str = "film"


class GenerateScriptResponse(BaseModel):
    yaml_text: str
    model: str
    chapter_analysis: ChapterAnalysisResponse
    validation: ValidationResponse
    repair_rounds: int


class ValidateScriptRequest(BaseModel):
    yaml_text: str = Field(..., min_length=1)


class RepairScriptRequest(BaseModel):
    yaml_text: str = Field(..., min_length=1)


class RepairScriptResponse(BaseModel):
    yaml_text: str
    model: str
    validation: ValidationResponse
    repair_rounds: int
