# AI 小说转剧本工具 PRD 与 72 小时执行计划

> 本文档是七牛云 x XEngineer 暑期实训营第三批次项目的长期执行文档。
> 后续每次继续开发前，优先阅读本文档，并按本文档检查项目是否仍然符合题目要求、提交规则和 GitHub 更新节奏。

## 0. 项目硬规则

### 0.1 批次信息

- 批次：七牛云 x XEngineer 暑期实训营第三批次。
- 实战时间：2026-06-05 00:00 至 2026-06-07 23:59。
- 选题：题目三，AI 小说转剧本工具。
- 24 小时内需要回到报名地址填写所选题目和代码仓库信息。
- 2026-06-07 23:59 前仓库和 demo 视频可设为私有。
- 2026-06-08 00:00 起仓库和 demo 视频需要公开。

### 0.2 不可违反的提交规则

- 仓库必须在开题后创建。
- 开发周期内必须持续提交 commit 和 PR。
- 严禁最后一天一次性导入全部代码。
- 每个 PR 只做一件明确的事情。
- 每个 PR 必须写清楚：
  - 功能描述
  - 实现思路
  - 测试方式
- 主分支合并后必须保持可运行。
- README 必须写清：
  - 项目简介
  - 功能列表
  - 技术栈
  - 安装与启动方式
  - 依赖项
  - 测试或使用方法
  - demo 视频链接
  - 特别设计和加分点
- demo 视频必须带配音讲解，并展示核心功能和效果。
- 若使用第三方库、框架、AI 工具或复用旧代码，必须在 README 或 PR 描述中说明。
- 不得抄袭第三方项目，不得提交不符合本批次议题方向的作品。

### 0.3 后续记忆锚点

后续开发时始终记住：

1. 本项目选择题目三。
2. 后端使用 Python + FastAPI。
3. 前端使用 React + TypeScript + Vite。
4. 项目核心不是普通聊天工具，而是小说到结构化 YAML 剧本的改编工作台。
5. 必须产出 YAML Schema 文档，并说明 Schema 的设计原因。
6. 每完成一个阶段就更新 GitHub，不能拖到最后集中提交。

## 1. 产品概述

### 1.1 产品名称

暂定名称：NovelScript Studio

中文定位：AI 小说剧本改编工作台

### 1.2 一句话简介

NovelScript Studio 是一款面向小说作者和内容创作者的 AI 辅助剧本创作工具，可以将 3 个章节以上的小说文本自动转换为可校验、可编辑、可导出的结构化 YAML 剧本初稿。

### 1.3 背景

很多小说作者希望将小说改编为短剧、电影、舞台剧或分镜脚本，但小说和剧本的表达方式差异很大：

- 小说依赖叙述、心理描写和长段背景说明。
- 剧本依赖场景、动作、对白、冲突和节奏。
- 普通 AI 直接生成的剧本往往格式不稳定，无法被后续工具读取。
- 作者需要的不只是生成文本，还需要可编辑、可校验、可持续打磨的结构化初稿。

因此，本项目将 AI 生成能力和结构化 Schema 约束结合起来，让小说改编结果既可读，也可被程序处理。

## 2. 题目要求对齐

| 官方要求 | 产品实现 |
| --- | --- |
| 将 3 个章节以上的小说文本自动转换为剧本 | 支持粘贴或上传小说文本，自动识别章节数，不足 3 章时提示用户 |
| 输出结构化剧本 | 输出标准 YAML 剧本，而不是普通自然语言文本 |
| YAML 格式 | 使用 YAML 编辑器、YAML 解析器和 Schema 校验器 |
| 作者可以快速获得初稿 | 一键生成剧本，提供场景卡片、人物表、改编报告 |
| 作者可以进一步打磨 | 支持在线编辑 YAML 和场景字段，支持导出 |
| 额外写一篇 YAML Schema 文档 | 新增 `docs/yaml-schema.md`，说明字段定义、约束和设计原因 |

## 3. 产品目标与非目标

### 3.1 产品目标

P0 目标：

- 支持输入 3 个章节以上小说文本。
- 自动识别章节结构。
- 使用 AI 生成结构化 YAML 剧本。
- 提供 YAML Schema。
- 校验生成结果是否符合 Schema。
- 提供剧本预览和 YAML 编辑能力。
- 支持导出 YAML。
- 提供完整 README、Schema 文档和 demo 视频。

P1 目标：

- 三阶段 AI Pipeline：章节分析、场景规划、YAML 生成。
- 自动修复不合法 YAML。
- 生成原文溯源信息。
- 输出人物表、地点表和改编报告。
- 展示 Schema 校验状态和错误原因。

P2 目标：

- 剧本风格选择：电影剧本、短剧剧本、舞台剧剧本。
- 局部重写某一个场景。
- YAML 版本对比。
- 角色关系图。
- Markdown 剧本文本导出。

### 3.2 非目标

72 小时内不做以下内容：

- 不做完整商业化 SaaS。
- 不做多人协作。
- 不做用户登录和权限系统。
- 不做在线支付。
- 不做复杂部署。
- 不保证生成结果可以直接用于商业影视生产。
- 不接入版权检测系统。

## 4. 目标用户

### 4.1 小说作者

需求：

- 想快速知道自己的小说能否改成剧本。
- 想获得一个可以继续修改的初稿。
- 想保留人物、场景和关键剧情。

### 4.2 编剧或短剧创作者

需求：

- 想快速把小说素材拆成场景。
- 想查看每场戏的冲突、人物和对白。
- 想导出结构化文本继续打磨。

### 4.3 内容工作室助理

需求：

- 想批量预处理小说素材。
- 想获得人物表、场景列表和改编报告。
- 想判断小说改编难度和故事结构。

## 5. 核心用户流程

1. 用户进入工作台。
2. 用户粘贴小说文本，或上传 `.txt` 文件。
3. 系统自动识别章节数和章节标题。
4. 若不足 3 章，系统提示不符合题目要求。
5. 若满足 3 章，用户点击“生成剧本”。
6. 后端执行 AI Pipeline：
   - 分析章节、人物、地点、关键事件。
   - 规划剧本场景。
   - 生成 YAML。
   - 校验 YAML。
   - 必要时自动修复 YAML。
7. 前端展示：
   - 章节列表
   - 人物表
   - 场景卡片
   - YAML 文本
   - 校验结果
   - 改编报告
8. 用户编辑 YAML 或场景字段。
9. 用户重新校验。
10. 用户导出 `.yaml` 文件。

## 6. 功能需求

### 6.1 小说输入模块

优先级：P0

功能：

- 支持粘贴小说全文。
- 支持上传 `.txt` 文件。
- 显示文本字数。
- 显示识别到的章节数。
- 显示章节标题列表。
- 不足 3 章时禁用生成按钮，并提示“题目要求至少 3 个章节”。

章节识别规则：

- 支持 `第一章`、`第1章`、`第 1 章`。
- 支持 `Chapter 1`、`CHAPTER 1`。
- 支持 `1.`、`01.` 作为弱规则，但需要谨慎使用。

验收标准：

- 输入 3 章文本时可以进入生成流程。
- 输入 1 章或 2 章文本时会提示不满足要求。
- 上传 `.txt` 后文本能正确显示。

### 6.2 章节分析模块

优先级：P0

功能：

- 将小说按章节拆分。
- 每章生成：
  - 章节 ID
  - 章节标题
  - 字数
  - 摘要
  - 关键事件
  - 主要出场人物

验收标准：

- 前端可以展示章节列表。
- 每章至少有标题、字数和摘要。

### 6.3 AI 人物与地点提取模块

优先级：P1

功能：

- 提取角色列表。
- 提取地点列表。
- 识别角色别名。
- 简要描述角色身份、性格、动机。
- 简要描述地点用途。

验收标准：

- 生成结果中包含 `characters` 字段。
- 生成结果中包含 `locations` 字段。
- 场景中的角色和地点优先引用已定义 ID。

### 6.4 AI 剧本生成模块

优先级：P0

功能：

- 根据小说章节生成结构化 YAML 剧本。
- 每个剧本场景包含：
  - 场景 ID
  - 标题
  - 来源章节
  - 地点
  - 时间
  - 出场人物
  - 场景摘要
  - 戏剧冲突
  - 动作
  - 对白
  - 改编说明

验收标准：

- AI 输出是可解析的 YAML。
- 至少生成 3 个场景。
- 每个场景包含动作或对白。
- 每个场景能追溯到原文章节。

### 6.5 YAML Schema 模块

优先级：P0

功能：

- 在 `schema/screenplay.schema.json` 中定义剧本结构。
- 在 `docs/yaml-schema.md` 中解释 Schema 设计原因。
- Schema 至少约束：
  - `metadata`
  - `source`
  - `characters`
  - `locations`
  - `scenes`
  - `beats`
  - `adaptation_report`

验收标准：

- 文档说明每个顶层字段的用途。
- 文档说明为什么使用场景、人物、地点、节拍等结构。
- 文档说明 YAML 相比普通文本的优势。
- 后端可以使用 Schema 校验 YAML。

### 6.6 YAML 校验模块

优先级：P0

功能：

- 解析 YAML。
- 校验 YAML 是否符合 Schema。
- 返回校验状态。
- 返回错误字段和错误原因。

验收标准：

- 合法 YAML 返回通过。
- 非法 YAML 返回错误。
- 前端能展示错误信息。

### 6.7 自动修复模块

优先级：P1

功能：

- 当 YAML 不合法时，把错误信息和原 YAML 发送给 AI。
- AI 返回修复后的 YAML。
- 最多修复 2 轮，避免无限循环。

验收标准：

- 常见格式错误可以被修复。
- 修复后重新校验。
- 前端展示修复次数。

### 6.8 剧本预览与编辑模块

优先级：P0

功能：

- 展示场景卡片。
- 展示人物表。
- 展示 YAML 文本编辑区。
- 用户修改 YAML 后可以重新校验。

验收标准：

- 能看到每个场景的地点、时间、人物、摘要、动作、对白。
- 修改 YAML 后，校验结果会更新。

### 6.9 改编报告模块

优先级：P1

功能：

- 展示生成统计：
  - 原文章节数
  - 剧本场景数
  - 人物数量
  - 地点数量
  - 对白数量
  - 动作数量
  - Schema 校验状态
  - 自动修复次数
- 展示改编说明：
  - 哪些剧情被压缩
  - 哪些章节被合并
  - 主要冲突如何转化

验收标准：

- demo 中可以展示报告。
- 报告内容能体现 AI 改编不是简单复制。

### 6.10 导出模块

优先级：P0

功能：

- 支持导出 `.yaml` 文件。
- 文件名包含作品标题或时间戳。

验收标准：

- 用户可以下载 YAML。
- 下载后的 YAML 可以被重新解析。

## 7. YAML Schema v1 草案

示例结构：

```yaml
metadata:
  title: "示例剧本"
  version: "1.0"
  format: "screenplay_yaml"
  generated_at: "2026-06-05T12:00:00+08:00"
  style: "film"

source:
  title: "原小说标题"
  chapter_count: 3
  language: "zh-CN"
  chapters:
    - id: "chapter_001"
      title: "第一章"
      word_count: 1200
      summary: "本章摘要"

characters:
  - id: "char_001"
    name: "林舟"
    aliases: ["林先生"]
    role: "protagonist"
    description: "主角，年轻工程师"
    motivation: "寻找真相"

locations:
  - id: "loc_001"
    name: "旧咖啡馆"
    description: "故事开端发生的地点"

scenes:
  - id: "scene_001"
    title: "深夜重逢"
    chapter_refs: ["chapter_001"]
    source_excerpt: "原文关键片段"
    location_id: "loc_001"
    time_of_day: "night"
    characters: ["char_001"]
    summary: "林舟在咖啡馆遇到关键人物。"
    conflict: "林舟想知道真相，但对方拒绝透露。"
    beats:
      - type: "action"
        content: "林舟推门进入咖啡馆。"
      - type: "dialogue"
        speaker: "char_001"
        content: "你终于来了。"
    adaptation_notes:
      compression: "压缩了原文中的心理描写。"
      rationale: "将内心独白转为可表演动作。"

adaptation_report:
  scene_count: 1
  character_count: 1
  dialogue_count: 1
  action_count: 1
  validation_status: "passed"
  repair_rounds: 0
```

设计原因：

- `metadata` 用于标识剧本版本、生成时间和风格。
- `source` 用于保留原文来源，确保剧本可以追溯。
- `characters` 独立出来，避免场景中重复描述人物。
- `locations` 独立出来，方便后续做场景管理。
- `scenes` 是剧本的核心结构，符合剧本按场景推进的习惯。
- `beats` 用于表达动作、对白、旁白等剧本最小单元。
- `adaptation_notes` 说明 AI 如何处理小说和剧本之间的表达差异。
- `adaptation_report` 提供可量化反馈，方便 demo 展示。

## 8. AI Pipeline 设计

### 8.1 Pipeline 总览

```text
小说文本
  -> 章节解析
  -> 人物/地点/事件提取
  -> 场景规划
  -> YAML 剧本生成
  -> Schema 校验
  -> 自动修复
  -> 剧本预览与导出
```

### 8.2 阶段一：章节解析

输入：

- 用户上传或粘贴的小说文本。

输出：

- 章节数组。
- 章节数。
- 字数统计。

实现方式：

- 先使用规则解析章节标题。
- 若规则解析失败，则将整段文本作为单章，并提示用户调整格式。

### 8.3 阶段二：人物、地点、事件提取

输入：

- 章节数组。

输出：

- 人物列表。
- 地点列表。
- 关键事件列表。

实现方式：

- 通过 AI 提取结构化 JSON。
- 后端再将 JSON 整理为 YAML 生成阶段可用的上下文。

### 8.4 阶段三：场景规划

输入：

- 章节摘要。
- 人物列表。
- 地点列表。
- 关键事件。

输出：

- 场景大纲。

实现方式：

- 要求 AI 将小说情节拆成若干剧本场景。
- 每个场景必须包含来源章节、地点、人物、冲突和目标。

### 8.5 阶段四：YAML 生成

输入：

- 场景大纲。
- Schema 约束说明。

输出：

- YAML 剧本。

实现方式：

- Prompt 中明确要求只输出 YAML。
- 后端使用 `PyYAML` 解析。

### 8.6 阶段五：Schema 校验与修复

输入：

- YAML 剧本。
- JSON Schema。

输出：

- 校验结果。
- 修复后的 YAML。

实现方式：

- 使用 `jsonschema` 校验解析后的 YAML 对象。
- 如果失败，将错误信息发送给 AI 修复。
- 最多自动修复 2 轮。

## 9. 技术方案

### 9.1 前端

- React
- TypeScript
- Vite
- CSS Modules 或普通 CSS
- YAML 编辑区可先使用 `<textarea>`，有时间再升级为 CodeMirror

前端职责：

- 输入小说。
- 展示章节识别结果。
- 调用后端生成剧本。
- 展示人物、场景、YAML、校验报告。
- 支持编辑和导出。

### 9.2 后端

- Python
- FastAPI
- Pydantic
- PyYAML
- jsonschema
- OpenAI 兼容模型 SDK 或 HTTP 调用

后端职责：

- 章节解析。
- AI 调用。
- YAML 解析。
- Schema 校验。
- 自动修复。
- 返回结构化结果。

### 9.3 推荐目录结构

```text
.
├── README.md
├── docs/
│   ├── yaml-schema.md
│   ├── demo-script.md
│   └── prd.md
├── schema/
│   └── screenplay.schema.json
├── samples/
│   ├── sample-novel.txt
│   └── sample-output.yaml
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py
│       ├── models.py
│       ├── services/
│       │   ├── chapter_parser.py
│       │   ├── llm_client.py
│       │   ├── screenplay_generator.py
│       │   └── yaml_validator.py
│       └── prompts/
│           ├── analyze_novel.txt
│           ├── generate_screenplay.txt
│           └── repair_yaml.txt
└── frontend/
    ├── package.json
    ├── index.html
    └── src/
        ├── App.tsx
        ├── api/
        ├── components/
        └── styles/
```

## 10. API 设计

### 10.1 健康检查

```text
GET /api/health
```

返回：

```json
{
  "status": "ok"
}
```

### 10.2 章节识别

```text
POST /api/chapters/analyze
```

请求：

```json
{
  "novel_text": "第一章..."
}
```

返回：

```json
{
  "chapter_count": 3,
  "is_valid": true,
  "chapters": [
    {
      "id": "chapter_001",
      "title": "第一章",
      "word_count": 1200
    }
  ]
}
```

### 10.3 生成剧本

```text
POST /api/scripts/generate
```

请求：

```json
{
  "novel_text": "第一章...",
  "style": "film"
}
```

返回：

```json
{
  "yaml_text": "metadata:\n  title: ...",
  "validation": {
    "passed": true,
    "errors": []
  },
  "report": {
    "chapter_count": 3,
    "scene_count": 6,
    "character_count": 4,
    "repair_rounds": 0
  }
}
```

### 10.4 校验 YAML

```text
POST /api/scripts/validate
```

请求：

```json
{
  "yaml_text": "metadata:\n  title: ..."
}
```

返回：

```json
{
  "passed": true,
  "errors": []
}
```

### 10.5 修复 YAML

```text
POST /api/scripts/repair
```

请求：

```json
{
  "yaml_text": "metadata:\n  title: ...",
  "errors": ["scenes.0.id is required"]
}
```

返回：

```json
{
  "yaml_text": "metadata:\n  title: ...",
  "validation": {
    "passed": true,
    "errors": []
  }
}
```

### 10.6 获取 Schema

```text
GET /api/schema
```

返回：

```json
{
  "schema": {}
}
```

## 11. 前端页面设计

### 11.1 主工作台

首屏直接是工具工作台，不做营销型 landing page。

布局建议：

- 顶部：项目名、当前状态、导出按钮。
- 左侧：小说输入区、上传按钮、章节识别结果。
- 中间：场景卡片、人物表、改编报告。
- 右侧：YAML 编辑器、Schema 校验结果。

### 11.2 关键状态

- 初始状态：展示输入区和示例小说入口。
- 输入不足状态：提示章节数不足。
- 生成中状态：展示当前阶段，例如“正在提取人物”“正在规划场景”。
- 生成成功状态：展示剧本预览、YAML 和报告。
- 校验失败状态：展示错误列表和修复按钮。
- 导出成功状态：提示已下载 YAML。

## 12. 72 小时阶段计划与 GitHub 更新节奏

### 总原则

- 每完成一个阶段，必须至少产生一次 commit。
- 每完成一个独立功能，必须开 PR。
- 每个 PR 合并后，主分支必须能运行。
- PR 描述必须写清功能、实现、测试。
- 不允许在第 3 天集中提交全部代码。

### Day 1：2026-06-05，确定方向并完成可运行骨架

#### 阶段 0：创建仓库与项目文档

工作内容：

- 创建 GitHub 仓库。
- 添加本 PRD。
- 添加基础 README。
- 添加初始目录结构。
- 添加 `.gitignore`。

GitHub 更新：

- Commit：`docs: add project PRD and execution plan`
- PR：`docs: add project planning documents`

完成标准：

- 仓库存在。
- README 能说明项目方向。
- PRD 已提交。
- 报名表可填写仓库地址。

#### 阶段 1：前后端工程骨架

工作内容：

- 初始化 `frontend`。
- 初始化 `backend`。
- FastAPI 提供 `/api/health`。
- 前端能调用健康检查接口。
- 添加启动说明。

GitHub 更新：

- Branch：`feature/project-scaffold`
- Commit：`chore: scaffold frontend and backend apps`
- PR：`chore: scaffold runnable frontend and FastAPI backend`

完成标准：

- 前端可以启动。
- 后端可以启动。
- README 写清启动方式。
- 主分支合并后可运行。

#### 阶段 2：YAML Schema 与 Schema 文档

工作内容：

- 创建 `schema/screenplay.schema.json`。
- 创建 `docs/yaml-schema.md`。
- 写清 Schema 字段和设计原因。
- 增加一份 `samples/sample-output.yaml`。

GitHub 更新：

- Branch：`feature/yaml-schema`
- Commit：`feat: define screenplay YAML schema`
- PR：`feat: add screenplay YAML schema and design document`

完成标准：

- Schema 能覆盖 metadata、source、characters、locations、scenes、beats、adaptation_report。
- 文档说明为什么这样设计。
- 示例 YAML 能体现结构。

#### 阶段 3：小说输入与章节识别

工作内容：

- 前端支持粘贴小说。
- 前端支持上传 `.txt`。
- 后端实现章节识别。
- 前端展示章节数、标题和字数。
- 不足 3 章时提示不符合题目要求。

GitHub 更新：

- Branch：`feature/chapter-analysis`
- Commit：`feat: add novel input and chapter analysis`
- PR：`feat: support novel input and chapter validation`

完成标准：

- 输入 3 章样例可以通过。
- 输入不足 3 章会提示。
- demo 中能展示题目要求被严格执行。

### Day 2：2026-06-06，完成 AI 生成、校验和核心产品流程

#### 阶段 4：AI 分析与剧本生成

工作内容：

- 实现 AI 调用配置。
- 编写 prompt：
  - `analyze_novel.txt`
  - `generate_screenplay.txt`
- 后端实现 `/api/scripts/generate`。
- 生成 YAML 剧本。

GitHub 更新：

- Branch：`feature/ai-generation`
- Commit：`feat: generate screenplay YAML from novel text`
- PR：`feat: add AI screenplay generation pipeline`

完成标准：

- 能从 3 章样例生成 YAML。
- YAML 至少包含人物、地点、场景和对白。
- 生成过程有基本错误处理。

#### 阶段 5：Schema 校验与自动修复

工作内容：

- 后端实现 YAML 解析。
- 后端实现 Schema 校验。
- 后端实现 `/api/scripts/validate`。
- 后端实现 `/api/scripts/repair`。
- 前端展示校验结果。

GitHub 更新：

- Branch：`feature/schema-validation`
- Commit：`feat: validate and repair generated screenplay YAML`
- PR：`feat: add YAML validation and repair workflow`

完成标准：

- 合法 YAML 显示通过。
- 非法 YAML 显示错误。
- 自动修复最多执行 2 轮。
- demo 中可以讲“生成后会被结构校验约束”。

#### 阶段 6：剧本预览、编辑与导出

工作内容：

- 前端展示人物表。
- 前端展示场景卡片。
- 前端展示 YAML 编辑区。
- 支持编辑后重新校验。
- 支持导出 `.yaml`。

GitHub 更新：

- Branch：`feature/script-workspace`
- Commit：`feat: add screenplay preview editor and export`
- PR：`feat: add editable screenplay workspace`

完成标准：

- 用户能看到剧本结构。
- 用户能修改 YAML。
- 用户能导出文件。
- 主流程可完整演示。

### Day 3：2026-06-07，打磨、文档、demo 和最终检查

#### 阶段 7：改编报告与样例数据

工作内容：

- 添加 `samples/sample-novel.txt`。
- 添加改编报告。
- 展示章节数、场景数、人物数、对白数、校验状态、修复次数。
- 增加示例输出。

GitHub 更新：

- Branch：`feature/adaptation-report`
- Commit：`feat: add adaptation report and sample data`
- PR：`feat: add adaptation report for generated screenplay`

完成标准：

- demo 中可以展示可量化结果。
- 样例数据可以让评委快速试用。

#### 阶段 8：界面打磨与体验优化

工作内容：

- 优化工作台布局。
- 增加加载状态。
- 增加错误提示。
- 保证移动端和桌面端不出现文本重叠。
- 保证按钮、输入框和卡片尺寸稳定。

GitHub 更新：

- Branch：`feature/ui-polish`
- Commit：`style: polish screenplay workspace UI`
- PR：`style: polish UI and loading states`

完成标准：

- 核心操作清晰。
- 生成中状态明确。
- 不出现明显 UI 错位。

#### 阶段 9：README、demo 脚本和最终说明

工作内容：

- 完善 README。
- 写清依赖、启动、功能和技术栈。
- 写清 AI 使用说明。
- 写清第三方库。
- 写清加分点。
- 创建 `docs/demo-script.md`。
- 准备 demo 视频讲解脚本。

GitHub 更新：

- Branch：`docs/final-submission`
- Commit：`docs: complete README and demo script`
- PR：`docs: complete final submission documents`

完成标准：

- 评委能按 README 跑起项目。
- README 顶部预留 demo 视频链接位置。
- demo 脚本覆盖核心功能。

#### 阶段 10：最终自测与公开准备

工作内容：

- 本地完整跑通前后端。
- 使用样例小说完整生成一次。
- 导出 YAML。
- 校验 README 启动命令。
- 检查所有 PR 描述是否完整。
- 检查仓库是否准备在 2026-06-08 00:00 公开。
- 录制 demo 视频并放入 README 显眼位置。

GitHub 更新：

- Branch：`release/final-check`
- Commit：`chore: final submission checks`
- PR：`chore: final submission readiness check`

完成标准：

- 仓库代码完整。
- 主分支可运行。
- README 完整。
- demo 视频链接可访问。
- YAML Schema 文档存在。
- 不存在最后突击导入代码的问题。

## 13. PR 模板

每个 PR 使用以下结构：

```markdown
## 功能描述

本 PR 新增或修改了什么功能。

## 实现思路

说明主要技术方案、关键模块和为什么这样实现。

## 测试方式

- [ ] 本地启动前端
- [ ] 本地启动后端
- [ ] 访问核心页面
- [ ] 验证接口或功能

## 备注

是否使用第三方库、AI 辅助或复用代码。
```

## 14. README 内容计划

README 至少包含：

- 项目名称。
- 一句话简介。
- 题目背景。
- 核心功能。
- 技术栈。
- 项目结构。
- 安装与启动。
- 环境变量配置。
- 使用方法。
- YAML Schema 说明入口。
- demo 视频链接。
- 示例输入和输出。
- 加分点。
- AI 使用说明。
- 第三方依赖说明。
- 开发过程和 PR 记录说明。

## 15. Demo 视频脚本计划

视频时长建议：3 至 5 分钟。

讲解顺序：

1. 说明选题：AI 小说转剧本工具。
2. 说明核心目标：3 章以上小说转结构化 YAML 剧本。
3. 展示小说输入和章节识别。
4. 展示不足 3 章时的限制提示。
5. 使用 3 章样例生成剧本。
6. 展示人物表、地点表、场景卡片。
7. 展示 YAML 文本。
8. 展示 Schema 校验通过。
9. 手动改坏一个字段，展示错误提示。
10. 展示自动修复或重新校验。
11. 展示导出 YAML。
12. 展示 Schema 设计文档。
13. 总结加分点：
    - 三阶段 AI Pipeline
    - Schema 校验
    - 自动修复
    - 原文溯源
    - 改编报告

## 16. 验收清单

### 16.1 功能验收

- [ ] 可以输入或上传小说。
- [ ] 可以识别至少 3 个章节。
- [ ] 不足 3 章时有提示。
- [ ] 可以生成 YAML 剧本。
- [ ] YAML 包含人物、地点、场景、动作、对白。
- [ ] 可以校验 YAML。
- [ ] 可以展示校验错误。
- [ ] 可以编辑 YAML。
- [ ] 可以导出 YAML。
- [ ] 有 Schema 文档。
- [ ] 有 README。
- [ ] 有 demo 脚本。

### 16.2 工程验收

- [ ] 前端可启动。
- [ ] 后端可启动。
- [ ] 主分支可运行。
- [ ] 环境变量有示例。
- [ ] 第三方依赖写清楚。
- [ ] 错误处理清晰。
- [ ] 样例数据可用。

### 16.3 实训规则验收

- [ ] 仓库在开题后创建。
- [ ] commit 分布在 2026-06-05 至 2026-06-07。
- [ ] 没有最后一天一次性导入全部代码。
- [ ] 每个 PR 只做一件事。
- [ ] 每个 PR 描述完整。
- [ ] README 有 demo 视频链接。
- [ ] demo 视频带配音。
- [ ] 仓库可在 2026-06-08 00:00 起公开。

## 17. 风险与应对

### 17.1 AI 输出 YAML 不合法

风险：

- AI 可能输出解释文字。
- AI 可能生成无法解析的 YAML。
- AI 可能漏字段。

应对：

- Prompt 明确要求只输出 YAML。
- 后端使用 PyYAML 解析。
- 使用 JSON Schema 校验。
- 增加自动修复流程。

### 17.2 文本过长导致生成不稳定

风险：

- 三章小说文本过长，模型上下文不够。

应对：

- 先做章节摘要。
- 再基于摘要和关键事件生成场景。
- 示例文本控制在可演示范围内。

### 17.3 时间不足

风险：

- P1 和 P2 亮点过多，影响 P0 完成。

应对：

- Day 1 完成工程骨架和 Schema。
- Day 2 必须完成主流程。
- Day 3 只做打磨、文档和 demo。
- 若时间不足，优先保证 P0。

### 17.4 API Key 或模型调用异常

风险：

- 模型接口不可用会影响 demo。

应对：

- 使用 `.env.example` 明确配置。
- 保留样例小说和样例输出。
- 前端支持加载样例输出用于说明结构，但 demo 中要如实说明样例用途。

### 17.5 GitHub 提交不合规

风险：

- 提交过少或 PR 描述不完整会影响有效性。

应对：

- 每个阶段完成即 commit。
- 每个独立功能开 PR。
- 使用本文档中的 PR 模板。
- 每天至少保持多次有效提交。

## 18. 最终交付物

- 公开代码仓库。
- 可运行的前端和后端。
- README。
- YAML Schema 文档：`docs/yaml-schema.md`。
- YAML Schema 文件：`schema/screenplay.schema.json`。
- 示例小说：`samples/sample-novel.txt`。
- 示例输出：`samples/sample-output.yaml`。
- demo 视频链接。
- 清晰的 PR 和 commit 记录。

## 19. 后续开发时的固定开场检查

每次继续开发前，先检查：

1. 当前是否仍然围绕题目三。
2. 当前功能是否服务于小说转 YAML 剧本。
3. 是否已经把上一阶段提交到 GitHub。
4. 是否需要开新 PR，而不是把多个功能混在一起。
5. 主分支是否仍然可运行。
6. README 和文档是否需要同步更新。

## 20. 当前推荐执行顺序

立刻执行：

1. 创建 GitHub 仓库。
2. 提交本 PRD。
3. 提交基础 README。
4. 初始化前端和 FastAPI 后端。
5. 在 24 小时内填写题目和仓库地址。

优先完成：

1. Schema。
2. 章节识别。
3. AI 生成。
4. YAML 校验。
5. 预览编辑和导出。
6. README、demo、最终检查。
