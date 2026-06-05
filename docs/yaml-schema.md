# YAML Schema 设计文档

本文档说明 NovelScript Studio 剧本 YAML Schema 的字段结构、约束规则和设计原因。该文档对应题目三的额外要求：定义剧本的 YAML Schema，并说明 Schema 的设计原因。

## 1. 设计目标

本 Schema 的目标不是把小说改写成一段普通文本，而是把小说内容转换成可以被作者继续编辑、被程序校验、被后续工具读取的剧本初稿。

设计重点：

- 保留原文来源，避免 AI 改编结果失去出处。
- 将人物、地点和场景拆分为独立结构，方便作者检查。
- 使用动作、对白、旁白等 `beats` 表达剧本最小单位。
- 通过 Schema 约束 AI 输出，减少格式漂移。
- 给出改编报告，展示章节、场景、人物和校验状态等量化结果。

## 2. 顶层结构

```yaml
metadata: {}
source: {}
characters: []
locations: []
scenes: []
adaptation_report: {}
```

### 2.1 metadata

`metadata` 描述剧本文件本身。

必填字段：

- `title`：剧本标题。
- `version`：Schema 或输出版本。
- `format`：固定为 `screenplay_yaml`。
- `generated_at`：生成时间，使用 ISO 8601 时间格式。
- `style`：剧本风格，例如 `film`、`short_drama`、`stage`。

设计原因：

剧本初稿会经历多轮修改，`metadata` 能帮助作者和程序判断当前文件的版本、生成时间和目标风格。`format` 使用固定值，是为了让后续导入工具能快速识别文件类型。

### 2.2 source

`source` 描述原小说来源。

必填字段：

- `title`：原小说标题。
- `chapter_count`：章节数，必须大于等于 3。
- `language`：原文语言。
- `chapters`：章节列表，至少 3 项。

章节字段：

- `id`：章节 ID，例如 `chapter_001`。
- `title`：章节标题。
- `word_count`：章节字数。
- `summary`：章节摘要。
- `key_events`：章节关键事件。

设计原因：

题目明确要求输入 3 个章节以上的小说文本，因此 Schema 在 `source.chapter_count` 和 `source.chapters` 上都做了约束。保留章节摘要和关键事件，可以让评委看到工具不是只做格式转换，而是先理解小说结构再进行改编。

### 2.3 characters

`characters` 是角色表。

字段：

- `id`：角色 ID，例如 `char_001`。
- `name`：角色名。
- `aliases`：角色别名。
- `role`：角色类型，例如主角、反派、配角。
- `description`：角色描述。
- `motivation`：角色动机。
- `relationships`：角色关系。

设计原因：

剧本创作中，角色一致性非常重要。如果每个场景都直接写角色名，AI 容易出现名字不一致、角色身份漂移等问题。因此 Schema 使用角色表统一管理角色，再让场景通过角色 ID 引用它们。

### 2.4 locations

`locations` 是地点表。

字段：

- `id`：地点 ID，例如 `loc_001`。
- `name`：地点名称。
- `description`：地点说明。
- `visual_notes`：可选的视觉提示。

设计原因：

剧本通常按场景组织，而场景离不开地点。将地点独立出来，可以避免不同场景重复描述同一个地点，也方便后续扩展到分镜、拍摄计划或场景调度。

### 2.5 scenes

`scenes` 是剧本的核心。

字段：

- `id`：场景 ID，例如 `scene_001`。
- `title`：场景标题。
- `chapter_refs`：该场景来自哪些章节。
- `source_excerpt`：原文关键片段。
- `location_id`：地点 ID。
- `time_of_day`：时间段。
- `characters`：出场角色 ID 列表。
- `summary`：场景摘要。
- `conflict`：场景冲突。
- `beats`：场景中的动作、对白、旁白等节拍。
- `adaptation_notes`：改编说明。

设计原因：

小说是连续叙事，剧本是场景驱动。`scenes` 负责把原文拆成可表演、可编辑的戏剧单元。`chapter_refs` 和 `source_excerpt` 提供原文溯源，方便作者检查 AI 是否偏离原作。

### 2.6 beats

`beats` 是场景内部的最小剧本单位。

支持类型：

- `action`：动作。
- `dialogue`：对白。
- `narration`：旁白。
- `stage_direction`：舞台或表演提示。
- `transition`：转场。

规则：

- 每个 beat 必须有 `type` 和 `content`。
- 当 `type` 是 `dialogue` 时，必须提供 `speaker`。

设计原因：

直接把一个场景写成大段文本会降低可编辑性。拆成 `beats` 后，作者可以单独修改一句对白、一个动作或一个转场。对白强制绑定 `speaker`，是为了避免剧本出现“这句话不知道是谁说的”的问题。

### 2.7 adaptation_report

`adaptation_report` 是改编报告。

字段：

- `scene_count`：场景数。
- `character_count`：角色数。
- `dialogue_count`：对白数。
- `action_count`：动作数。
- `validation_status`：校验状态。
- `repair_rounds`：自动修复轮数，最多 2。
- `compression_notes`：剧情压缩或合并说明。

设计原因：

题目强调要降低改编门槛、提升效率。报告可以给作者一个量化反馈：原文被拆成多少场戏、保留了多少角色、是否通过结构校验。它也是 demo 中展示工程完整度的重要部分。

## 3. ID 设计

Schema 使用固定前缀 ID：

- 章节：`chapter_001`
- 角色：`char_001`
- 地点：`loc_001`
- 场景：`scene_001`

设计原因：

稳定 ID 比自然语言名称更适合程序处理。角色可能有别名，地点可能有简称，但 ID 不会变化，方便场景引用、校验和后续编辑。

## 4. 为什么使用 YAML

选择 YAML 的原因：

- 比 JSON 更适合人类阅读和编辑。
- 可以表达层级结构。
- 适合保存剧本这种半结构化内容。
- 可以被程序解析后使用 JSON Schema 校验。

本项目会把 YAML 解析为对象，再使用 `schema/screenplay.schema.json` 校验结构，兼顾作者可读性和工程可靠性。

## 5. 为什么需要 Schema 校验

AI 生成结果存在不稳定性：

- 可能漏字段。
- 可能多输出解释文字。
- 可能把对白和动作混在一起。
- 可能生成不符合预期的 ID。

Schema 校验可以让系统自动发现问题，并在后续阶段触发自动修复流程。这样工具不是“生成完就结束”，而是形成“生成、校验、修复、再校验”的闭环。

## 6. 示例

完整示例见：

```text
samples/sample-output.yaml
```

对应 Schema 文件见：

```text
schema/screenplay.schema.json
```

