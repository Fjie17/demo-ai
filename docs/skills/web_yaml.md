---
name: web_yaml
description: 当需要根据已有前端页面和模拟接口生成接口 YAML 契约文件时触发，输出 OpenAPI 3.0 规范文件供后端实现
---

## 执行前必读文件

```
src/views/<模块>/            ← 已生成的前端页面，提取接口调用
src/apis/<模块名>.ts         ← 前端接口调用层，提取函数名和路径
mock/<模块名>.ts             ← 前端 mock 数据，提取请求/响应数据结构
docs/requirements/story/<模块名>.md  ← 需求，补充业务语义
docs/conventions/glossary.md            ← 字段命名校正
docs/conventions/error-codes.md         ← 错误码，写入 response 示例
```

---

## 执行步骤

### Step 1 — 从前端代码提取接口信息

扫描 `src/apis/<模块名>.ts`，提取：
- 所有函数名 → 作为 `operationId`
- HTTP 方法和路径 → 作为 `method` 和 `path`
- 请求参数类型 → 来自 `src/types/<模块名>.ts`

扫描 `mock/<模块名>.ts`，提取：
- 请求体结构 → 作为 `requestBody schema`
- 响应体结构 → 作为 `response 200 schema`
- mock 数据示例 → 作为 `example`

根据请求参数类型确定 HTTP 方法：
- 请求参数是简单类型（string、number、boolean）或无参数 → 使用 GET
- 请求参数是对象（Object）或包含多个字段的结构体 → 使用 POST
- 更新资源 → PUT
- 删除资源 → DELETE

### Step 2 — 结合需求补充语义

读取用户故事，补充：
- 每个接口的 `summary`（中文描述）
- 必填字段标注（`required`）
- 字段格式约束（`pattern`、`minLength`、`maxLength`）
- 需要认证的接口加 `security`

### Step 3 — 字段命名校正

对照 `glossary.md` 检查所有字段名，将不规范的命名替换为术语表中的标准写法。

### Step 3.5 — 主键字段校正

检查所有 schema 中的主键字段：
- 统一命名为 `id`，禁止使用带模块前缀的主键名
- 禁止使用 `rankId`、`examId`、`userId` 等形式

```yaml
# ❌ 错误
properties:
  rankId:
    type: string

# ✅ 正确
properties:
  id:
    type: string
```

### Step 4 — 写入 YAML 文件

输出到 `docs/api/<模块名>.yaml`，格式规范：

```yaml
openapi: 3.0.0
info:
  title: <模块名> API
  version: 1.0.0
paths:
  /api/v1/<资源>/<动作>:
    post:
      tags: [<模块名>]
      summary: <来自用户故事的描述>
      operationId: <来自 apis/*.ts 的函数名>
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/<操作名>Request'
            example:
              <来自 mock 的请求示例>
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/<操作名>Result'
              example:
                <来自 mock 的响应示例>
components:
  schemas:
    <操作名>Request:
      type: object
      required: [<必填字段列表>]
      properties:
        <字段名>:
          type: <来自 types/*.ts 的类型>
          <pattern/minLength 等约束>
```

### Step 5 — 更新 CHANGELOG

在 `docs/api/CHANGELOG.md` 追加记录，状态标记为`草稿`，等待评审冻结。

---

## 禁止事项

- 禁止凭空设计接口，必须以前端实际调用为准
- 禁止自造字段名，必须对照 glossary.md 校正
- 禁止在 response schema 中包含 password 等敏感字段
- 禁止错误码自造，必须引用 error-codes.md
- 禁止对请求参数为 Object 类型的接口使用 GET 方法，必须改用 POST
- 禁止 `code` 字段类型使用 integer，必须是 string，值固定为 `'0'`
- 禁止将 `example` 嵌套在 `schema` 内部，必须与 `schema` 同级
- 禁止主键字段使用模块前缀命名（如 `rankId`、`examId`），统一使用 `id`

---

## 完成后自查

- [ ] 所有 operationId 来自 `src/apis/` 的实际函数名
- [ ] requestBody schema 与 mock 请求结构一致
- [ ] response schema 与 mock 响应结构一致
- [ ] 字段命名已对照 glossary.md 校正
- [ ] response 中无敏感字段
- [ ] CHANGELOG.md 已追加草稿记录
- [ ] 所有接口的 HTTP 方法符合参数类型规则，Object 类型参数未使用 GET
- [ ] 所有 schema 中主键字段统一为 `id`，无模块前缀命名