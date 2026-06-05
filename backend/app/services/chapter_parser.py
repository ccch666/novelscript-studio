import re

from app.models import ChapterAnalysisResponse, ChapterSummary


CHAPTER_HEADING_PATTERN = re.compile(
    r"^\s*(?P<title>("
    r"第[零〇一二三四五六七八九十百千万\d]+[章节回卷部篇][^\n]*"
    r"|Chapter\s+\d+[^\n]*"
    r"|CHAPTER\s+\d+[^\n]*"
    r"|\d{1,3}[\.、]\s*[^\n]{1,40}"
    r"))\s*$",
    re.MULTILINE,
)


def analyze_novel_chapters(novel_text: str) -> ChapterAnalysisResponse:
    normalized_text = novel_text.replace("\r\n", "\n").replace("\r", "\n").strip()

    if not normalized_text:
        return ChapterAnalysisResponse(
            chapter_count=0,
            is_valid=False,
            total_word_count=0,
            message="请输入小说文本。",
            chapters=[],
        )

    matches = list(CHAPTER_HEADING_PATTERN.finditer(normalized_text))
    chapters = _split_by_headings(normalized_text, matches)
    total_word_count = _count_words(normalized_text)
    chapter_count = len(chapters)

    return ChapterAnalysisResponse(
        chapter_count=chapter_count,
        is_valid=chapter_count >= 3,
        total_word_count=total_word_count,
        message=_build_message(chapter_count),
        chapters=chapters,
    )


def _split_by_headings(text: str, matches: list[re.Match[str]]) -> list[ChapterSummary]:
    if not matches:
        return [
            ChapterSummary(
                id="chapter_001",
                title="未识别章节",
                word_count=_count_words(text),
                preview=_preview(text),
            )
        ]

    chapters: list[ChapterSummary] = []
    for index, match in enumerate(matches):
        next_start = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        content = text[match.end() : next_start].strip()
        title = match.group("title").strip()
        chapters.append(
            ChapterSummary(
                id=f"chapter_{index + 1:03d}",
                title=title,
                word_count=_count_words(content),
                preview=_preview(content),
            )
        )

    return chapters


def _count_words(text: str) -> int:
    return len(re.findall(r"\S", text))


def _preview(text: str, max_length: int = 90) -> str:
    compact = re.sub(r"\s+", " ", text).strip()
    if not compact:
        return "该章节暂无正文。"
    if len(compact) <= max_length:
        return compact
    return f"{compact[:max_length]}..."


def _build_message(chapter_count: int) -> str:
    if chapter_count >= 3:
        return f"已识别 {chapter_count} 个章节，满足题目要求。"
    return f"已识别 {chapter_count} 个章节，题目要求至少 3 个章节。"

