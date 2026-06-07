# NovelScript Studio

Demo 视频链接：[NovelScript Studio Demo Video](https://github.com/ccch666/novelscript-studio/releases/download/demo-video-2026-06-07/novelscript-studio-demo.mov)

AI 小说剧本改编工作台。项目面向七牛云 x XEngineer 暑期实训营第三批次题目三：AI 小说转剧本工具。

## 项目目标

将 3 个章节以上的小说文本自动转换为可校验、可编辑、可导出的结构化 YAML 剧本初稿，并提供 YAML Schema 设计文档，说明剧本结构的字段设计和约束原因。

## 题目要求对应

- 输入 3 个章节以上的小说文本。
- 自动转换为结构化剧本。
- 输出 YAML 格式。
- 提供 YAML Schema 文档。
- 在文档中说明 Schema 的设计原因。

本项目已覆盖上述要求，并额外加入章节门槛校验、AI 输出自动修复、可视化场景卡片、改编报告、示例数据加载和 YAML 在线编辑导出。

## 核心功能

- 小说输入：支持粘贴小说文本、上传 `.txt`、加载内置示例。
- 章节分析：识别章节标题、章节数量、章节预览和字数，少于 3 章时阻止生成。
- AI 生成：调用 DeepSeek OpenAI 兼容接口，将小说改编为结构化剧本 YAML。
- Schema 校验：后端基于 `schema/screenplay.schema.json` 校验 YAML 格式。
- 自动修复：AI 输出不符合 Schema 时，后端会携带校验错误再次请求模型修复。
- 工作台编辑：前端展示角色表、场景卡片、改编报告和 YAML 编辑器。
- 导出：支持重新校验 YAML，并导出 `.yaml` 文件。
- 样例模式：可以直接加载示例小说和示例 YAML，便于评审快速查看效果。

## 项目亮点

- 端到端流程完整：输入、章节校验、AI 生成、Schema 校验、自动修复、编辑、导出均已串联。
- YAML Schema 可解释：不仅提供 JSON Schema 文件，还提供字段设计原因文档。
- 面向真实评审体验：提供示例小说、示例输出、工作流状态条和 demo 视频脚本。
- 输出质量可控：通过 Schema 约束 `metadata`、`source`、`characters`、`locations`、`scenes`、`adaptation_report` 等结构。
- 支持失败兜底：DeepSeek 配置缺失、请求失败、YAML 校验失败都会给出明确错误状态。
- GitHub 阶段化更新：按 PRD 拆分阶段持续提交，避免最后一次性堆代码。

## 技术栈

前端：

- React
- TypeScript
- Vite
- js-yaml

后端：

- Python
- FastAPI
- Pydantic
- PyYAML
- jsonschema
- httpx
- python-dotenv

AI：

- DeepSeek OpenAI 兼容模型接口

## 快速启动

建议环境：

- Python 3.9+
- Node.js 20+
- npm 10+

### 1. 启动后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

编辑 `backend/.env`，至少配置：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
LLM_TIMEOUT_SECONDS=90
```

启动服务：

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

健康检查：

```bash
curl http://127.0.0.1:8000/api/health
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认访问地址：

```text
http://127.0.0.1:5173
```

## 评审体验路径

1. 打开前端页面。
2. 点击“加载示例”，再点击“分析章节”，确认 3 章校验通过。
3. 点击“生成剧本”，等待 DeepSeek 返回结构化 YAML。
4. 查看工作流状态条、角色表、场景卡片、Schema 校验状态和改编报告。
5. 在 YAML 编辑器中修改内容，点击“校验 YAML”查看校验结果。
6. 点击“导出 YAML”下载剧本初稿。
7. 若只想快速查看完整输出，可直接点击“加载示例 YAML”。

## API 接口

- `GET /api/health`：后端健康检查。
- `POST /api/chapters/analyze`：章节识别与 3 章门槛校验。
- `POST /api/scripts/generate`：调用 DeepSeek 生成剧本 YAML，并自动校验修复。
- `POST /api/scripts/validate`：校验任意 YAML 是否符合 Schema。
- `POST /api/scripts/repair`：对已有 YAML 执行 AI 修复。
- `GET /api/samples/novel`：读取示例小说。
- `GET /api/samples/output`：读取示例 YAML。

## 项目文档

- PRD 与 72 小时执行计划：[AI小说转剧本工具_PRD.md](./AI小说转剧本工具_PRD.md)
- YAML Schema 文档：[docs/yaml-schema.md](./docs/yaml-schema.md)
- Demo 视频脚本：[docs/demo-script.md](./docs/demo-script.md)
- 最终自测清单：[docs/final-readiness.md](./docs/final-readiness.md)
- YAML Schema 文件：[schema/screenplay.schema.json](./schema/screenplay.schema.json)
- 示例小说：[samples/sample-novel.txt](./samples/sample-novel.txt)
- 示例 YAML：[samples/sample-output.yaml](./samples/sample-output.yaml)

## 项目结构

```text
.
├── backend/          # FastAPI 后端
├── frontend/         # React + Vite 前端
├── docs/             # Schema 文档和 demo 脚本
├── schema/           # YAML Schema
├── samples/          # 示例小说和示例输出
└── README.md
```

## 验证命令

前端：

```bash
cd frontend
npm run lint
npm run build
```

后端：

```bash
cd backend
source .venv/bin/activate
python -m compileall app
curl http://127.0.0.1:8000/api/health
```

## AI 使用说明

- 本项目通过后端读取 `backend/.env` 中的 DeepSeek 配置。
- 生成流程会要求模型输出严格 YAML，不允许 Markdown 包裹。
- 后端会将模型输出先送入 Schema 校验。
- 若校验失败，后端会把错误路径和错误信息传给模型进行修复。
- API Key 只应保存在本地 `.env` 中，不能提交到 GitHub。

## 第三方依赖说明

- FastAPI / Uvicorn：提供后端 HTTP 服务。
- Pydantic：定义请求、响应和配置模型。
- PyYAML：解析 YAML 文本。
- jsonschema：执行 YAML Schema 校验。
- httpx：请求 DeepSeek OpenAI 兼容接口。
- React / TypeScript / Vite：构建前端工作台。
- js-yaml：前端解析 YAML，用于场景卡片和改编报告展示。

## 当前完成阶段

已完成阶段 0 至阶段 10：

1. 项目规划、README、PR 模板和基础目录。
2. React 前端和 FastAPI 后端工程骨架。
3. YAML Schema 与 Schema 设计文档。
4. 小说输入、上传和章节识别。
5. DeepSeek AI 剧本生成。
6. YAML 校验与自动修复。
7. 剧本预览、编辑和导出。
8. 改编报告与样例数据。
9. 界面体验打磨。
10. README、demo 脚本和最终提交文档。
11. 最终自测与公开准备。

Demo 视频链接已替换到 README 顶部，可通过 GitHub Release 公开访问。

## 学术诚信与知识产权

本项目为参赛作品原型，代码、文档和样例围绕本题目独立实现。项目使用第三方开源依赖和 AI 辅助开发，依赖来源已在 README 中说明。提交前应确认仓库权限、demo 视频权限和 `.env` 密钥安全。
