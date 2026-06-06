# NovelScript Studio Demo 视频脚本

建议视频时长：3 到 5 分钟。

## 0. 开场

大家好，这是 NovelScript Studio，一款面向七牛云 x XEngineer 暑期实训营第三批次题目三的 AI 小说转剧本工具。

本项目可以把 3 个章节以上的小说文本自动改编为结构化 YAML 剧本，并提供 YAML Schema、Schema 设计文档、在线编辑、校验、自动修复和导出能力。

## 1. 展示项目结构

画面切到代码仓库，简要展示目录：

- `backend`：FastAPI 后端。
- `frontend`：React + TypeScript 前端。
- `schema`：剧本 YAML Schema。
- `docs/yaml-schema.md`：Schema 设计原因文档。
- `samples`：示例小说和示例 YAML。

强调本项目按照阶段拆分开发，每个阶段通过 GitHub PR 更新。

## 2. 启动后端和前端

后端命令：

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

前端命令：

```bash
cd frontend
npm run dev
```

打开：

```text
http://127.0.0.1:5173
```

说明：DeepSeek API Key 保存在本地 `backend/.env`，该文件已被 Git 忽略，不会上传仓库。

## 3. 章节分析演示

在前端点击“加载示例”，示例小说会填入左侧文本框。

点击“分析章节”，展示：

- 章节数。
- 总字数。
- 每章标题、预览和字数。
- 若章节少于 3 章，系统会阻止生成，符合题目对 3 个章节以上输入的要求。

## 4. AI 剧本生成演示

点击“生成剧本”，说明后端会执行：

1. 发送小说文本和改编要求到 DeepSeek。
2. 要求模型输出严格 YAML。
3. 用 JSON Schema 校验模型输出。
4. 如果不合格，自动把错误交给模型修复。

生成完成后，画面展示：

- 工作流状态条：章节、YAML、Schema、导出。
- 角色表。
- 场景卡片。
- YAML 编辑器。
- 生成模型和自动修复轮数。

## 5. YAML Schema 和可编辑工作台

切到 YAML 编辑器，说明结构包含：

- `metadata`：作品标题、版本、生成时间和风格。
- `source`：原小说章节信息。
- `characters`：角色列表。
- `locations`：地点列表。
- `scenes`：剧本场景，每个场景包含动作、对白和转场。
- `adaptation_report`：改编报告，统计场景数、角色数、对白数、动作数和修复轮数。

演示修改 YAML 中某个字段，然后点击“校验 YAML”。

如果 Schema 通过，右侧显示“Schema 通过”；如果故意删掉必填字段，会出现错误路径和错误信息。

## 6. 导出和样例输出

点击“导出 YAML”，浏览器下载结构化剧本文件。

再点击“加载示例 YAML”，说明评委即使暂时没有 DeepSeek Key，也可以直接查看完整输出效果。

此时状态条应显示：

```text
章节3 / YAML已生成 / Schema通过 / 导出可用
```

## 7. 项目亮点总结

最后总结：

- 完整覆盖题目要求：3 章以上小说输入、AI 自动改编、YAML 输出、Schema 文档。
- 加入质量控制：章节门槛、Schema 校验、AI 自动修复。
- 加入编辑体验：场景卡片、改编报告、在线 YAML 编辑和导出。
- 仓库持续更新：每个阶段通过独立 PR 合并，便于评审查看开发轨迹。

## 8. 收尾镜头

展示 README 顶部的 demo 视频链接位置、`docs/yaml-schema.md` 和 `schema/screenplay.schema.json`。

结束语：

NovelScript Studio 的目标是让小说作者快速获得可编辑、可校验、可继续打磨的剧本初稿，降低小说改编成剧本的门槛。
