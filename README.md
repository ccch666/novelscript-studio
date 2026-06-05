# NovelScript Studio

AI 小说剧本改编工作台。项目面向七牛云 x XEngineer 暑期实训营第三批次题目三：AI 小说转剧本工具。

## 项目目标

将 3 个章节以上的小说文本自动转换为可校验、可编辑、可导出的结构化 YAML 剧本初稿，并提供 YAML Schema 设计文档，说明剧本结构的字段设计和约束原因。

## 当前选题

题目三：AI 小说转剧本工具

核心要求：

- 输入 3 个章节以上的小说文本。
- 自动转换为结构化剧本。
- 输出 YAML 格式。
- 额外提供 YAML Schema 文档。
- 文档中说明 Schema 的设计原因。

## 核心功能规划

- 小说粘贴和 `.txt` 上传。
- 章节识别与 3 章以上校验。
- AI 人物、地点、关键事件提取。
- AI 剧本场景规划。
- YAML 剧本生成。
- YAML Schema 校验。
- 不合法 YAML 自动修复。
- 场景卡片和 YAML 预览编辑。
- YAML 文件导出。
- 改编报告。

## 当前已完成

- 项目 PRD 与 72 小时执行计划。
- React + Vite 前端骨架。
- FastAPI 后端骨架。
- 后端健康检查：`GET /api/health`。
- 小说章节识别：`POST /api/chapters/analyze`。
- 前端小说粘贴、`.txt` 上传、示例加载和章节分析。
- YAML Schema 文件与设计文档。
- 示例小说：[samples/sample-novel.txt](./samples/sample-novel.txt)
- 示例 YAML：[samples/sample-output.yaml](./samples/sample-output.yaml)

## 技术栈

前端：

- React
- TypeScript
- Vite

后端：

- Python
- FastAPI
- Pydantic
- PyYAML
- jsonschema

AI：

- OpenAI 兼容模型接口

## 项目文档

- PRD 与 72 小时执行计划：[AI小说转剧本工具_PRD.md](./AI小说转剧本工具_PRD.md)
- YAML Schema 文档：[docs/yaml-schema.md](./docs/yaml-schema.md)
- YAML Schema 文件：[schema/screenplay.schema.json](./schema/screenplay.schema.json)
- Demo 视频脚本：`docs/demo-script.md`，开发阶段 9 添加

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

## 开发计划

本项目按 72 小时限时实战节奏推进：

1. 阶段 0：项目规划、README、PR 模板和基础目录。
2. 阶段 1：React 前端和 FastAPI 后端工程骨架。
3. 阶段 2：YAML Schema 与 Schema 设计文档。
4. 阶段 3：小说输入、上传和章节识别。
5. 阶段 4：AI 剧本生成。
6. 阶段 5：YAML 校验与自动修复。
7. 阶段 6：剧本预览、编辑和导出。
8. 阶段 7：改编报告与样例数据。
9. 阶段 8：界面体验打磨。
10. 阶段 9：README、demo 脚本和最终提交文档。
11. 阶段 10：最终自测与公开准备。

## 启动方式

### 后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

健康检查：

```bash
curl http://localhost:8000/api/health
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

默认访问地址：

```text
http://localhost:5173
```

## Demo 视频

Demo 视频链接将在最终提交前放置在 README 顶部显眼位置。

## 学术诚信与依赖说明

本项目允许使用 AI 辅助开发，但所有功能、架构和文档会在 PR 和 README 中说明来源与实现方式。使用的第三方依赖将在 README 中持续补充。
