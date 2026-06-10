# API 接口测试规范

## 禁止项

| # | 禁止 |
|---|------|
| 1 | 硬编码账号密码或完整 URL |
| 2 | 使用 `any` 类型 |
| 3 | `BaseResponse.code` 定义为 `number`，必须为 `string` |
| 4 | 用 `if` 包裹核心断言，前置失败必须立即 `expect` 报错 |
| 5 | 每个接口少于 1 正常 + 2 异常用例 |
| 6 | 分页接口只断言 `code='0'`，必须额外断言 `list` 非空 |
| 7 | 推断业务错误的具体 `code` 值，除非 `error-codes.md` 明确列出 |
| 8 | 业务错误用例（400/500）断言 `body.data`，错误响应体中无此字段 |
| 9 | 成功用例状态码包含 400/500，成功只能 `toBe(200)` |
| 10 | 对不存在资源的更新/删除断言 `404`，此类场景是业务异常应断言 `[400,500]` |
| 11 | 断言 `data` 子字段超出 YAML schema 定义（`data:string` 只断 `typeof`，禁推断 `.id` 等） |
| 12 | 用创建接口的 `body.data` 作为更新/删除的目标 ID，创建返回的是消息字符串 |
| 13 | 正常/更新/删除用例数据触发重名、区间重叠等业务冲突 |
| 14 | 使用固定小数值区间（如 `0~100`）作为测试数据，必须用高位安全区间 |
| 15 | `beforeAll` 前置步骤未断言成功就继续执行 |
| 16 | 内联重复写断言或日志，必须调用辅助函数 |
| 17 | 分段/省略输出文件，必须一次性输出完整文件，禁止 `// ...省略` 等占位 |
| 18 | 在 spec 文件中重复定义 helpers 已导出的内容（`BASE_URL`、`BaseResponse`、断言函数、日志函数、数据生成函数） |
| 19 | 对 `safeTestName()` 的返回值手动拼接后缀（如 `safeTestName('更新') + '_后'`），名称长度由函数内部保证，禁止在函数外二次修改 |

---

## helpers 公共模块

所有公共内容统一维护在 `tests/helpers.ts`，**禁止**在 spec 文件中重复定义。

`tests/helpers.ts` 导出内容一览：

| 导出项 | 说明 |
|--------|------|
| `BASE_URL` | 基础 URL，读取 `process.env.BASE_URL`，默认 `http://localhost:31002/exam` |
| `BaseResponse<T>` | 通用响应类型，`code: string`（禁止 `number`） |
| `assertSuccess` | 断言接口成功（HTTP 200、`code='0'`、`data` 非空） |
| `assertPagedSuccess` | 断言分页接口成功（在 `assertSuccess` 基础上额外断言 `list` 非空） |
| `assertError` | 断言业务异常（HTTP `[400,500]`、`code≠'0'`，禁止断言 `body.data`） |
| `logRequest` | 打印请求日志 |
| `logResponse` | 打印响应日志并写入 Playwright Annotation |
| `safeTestName` | 生成带时间戳的安全测试名称（前缀 `__t`，自动截取 ≤10 字符） |
| `safeRange` | 生成高位安全积分区间（起点 900000+，避免与业务数据重叠） |

---

## 文件模板

**路径**：`tests/api/<模块>.api.spec.ts`

每个文件顶部按顺序写以下内容，不得省略：

```typescript
/**
 * <模块> API 接口测试 | 覆盖：<operationId 列表> | 来源：docs/api/<模块>.yaml
 */
import { test, expect, APIRequestContext } from '@playwright/test'
import {
  BASE_URL,
  BaseResponse,
  assertSuccess,
  assertPagedSuccess,
  assertError,
  logRequest,
  logResponse,
  safeTestName,
  safeRange,
} from '../helpers'

// ── 登录（仅需要 token 的模块才保留此函数）──
async function loginAndGetToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${BASE_URL}/api/v1/<模块>/login`, {
    data: { username: process.env.TEST_USERNAME, password: process.env.TEST_PASSWORD },
  })
  const body: BaseResponse<{ token: string }> = await res.json()
  if (!body.data?.token) throw new Error('登录失败')
  return body.data.token
}
```

> 不需要 token 的模块删去 `loginAndGetToken`，其余 import 保持完整。

---

## 用例结构

**编号**：`TC-<模块大写>-<两位序号>`，如 `TC-RANK-01`

```typescript
test.describe('<operationId> — <METHOD> <path>', () => {
  test('TC-XX-01 正确参数，返回成功', async ({ request }) => {
    const req = { pageNum: 1, pageSize: 10 }
    logRequest('TC-XX-01', req)
    const res = await request.post(`${BASE_URL}/api/v1/xxx`, { data: req })
    const body: BaseResponse<...> = await res.json()
    logResponse('TC-XX-01', res, body)
    assertSuccess(res, body)
    // 按 YAML schema 追加具体字段断言，禁止推断 schema 未定义的字段
  })

  test('TC-XX-02 缺少必填字段，返回错误', async ({ request }) => {
    const req = {}
    logRequest('TC-XX-02', req)
    const res = await request.post(`${BASE_URL}/api/v1/xxx`, { data: req })
    const body: BaseResponse<never> = await res.json()
    logResponse('TC-XX-02', res, body)
    assertError(res, body)
    // 仅在 error-codes.md 明确列出时追加：expect(body.code).toBe('410')
  })
})
```

需要 token 的 `describe` 块用 `test.beforeAll` 统一登录一次。

---

## HTTP 状态码规则

| 场景 | 断言方式 |
|------|---------|
| 接口成功 | `assertSuccess`（内含 `toBe(200)`） |
| 业务异常 | `assertError`（内含 `[400,500].toContain`） |
| 其他（401 等）| 精确断言对应值 |

---

## 更新 / 删除用例规范

目标 ID **必须**通过查询列表接口从已有数据提取，禁止使用创建接口的 `body.data`。

```typescript
test.describe('updateRank / deleteRank', () => {
  let targetId: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/v1/rank/list`, { data: { pageNum: 1, pageSize: 10 } })
    const body: BaseResponse<{ list: Array<{ id: string }> }> = await res.json()
    expect(res.status(), '前置查询失败').toBe(200)
    expect(body.code, '前置查询失败').toBe('0')
    expect(body.data?.list.length, '列表为空').toBeGreaterThan(0)
    targetId = body.data!.list[0].id
  })
})
```

**删除用例**需先创建专用记录再查列表取 ID（因为创建接口不返回 ID）：

```typescript
test.beforeAll(async ({ request }) => {
  const uniqueName = safeTestName()
  const cr = await request.post(`${BASE_URL}/api/v1/rank/create`, {
    data: { name: uniqueName, ...safeRange(), icon: 'x' },
  })
  const cb: BaseResponse<string> = await cr.json()
  expect(cr.status(), '前置创建失败').toBe(200)
  expect(cb.code, '前置创建失败').toBe('0')

  const lr = await request.post(`${BASE_URL}/api/v1/rank/list`, { data: { pageNum: 1, pageSize: 50 } })
  const lb: BaseResponse<{ list: Array<{ id: string; name: string }> }> = await lr.json()
  expect(lb.code, '前置查询失败').toBe('0')
  const record = lb.data!.list.find(r => r.name === uniqueName)
  expect(record, '未找到刚创建的记录').toBeDefined()
  targetId = record!.id
})
```

---

## 测试数据规范

- 名称**必须**直接使用 `safeTestName()` 的返回值，禁止在函数外拼接任何后缀；同一流程中需要多个不同名称时，分别传入不同的 `base` 参数区分语义：
  ```typescript
  // ✅ 正确：每次独立调用，base 语义不同
  const createName = safeTestName('创建')
  const updateName = safeTestName('更新')

  // ❌ 错误：函数外手动拼接，导致长度溢出
  const updateName = safeTestName('链路') + '_更新'
  ```
- 数值区间用 `safeRange()`，起点在 900000+ 高位区，避免与业务数据重叠
- 冲突异常用例（重名/区间重叠）必须在 `beforeAll` 中主动创建基准数据并断言成功，禁止依赖环境中碰巧存在的数据

---

## 完整业务链路（每个模块末尾必须补充）

```typescript
test.describe('完整业务链路', () => {
  test('Login → GetUserInfo → Logout → 验证失效', async ({ request }) => {
    // Step1 登录取 token → Step2 携 token 访问 → Step3 登出 → Step4 验证失效
  })
})
```

---

## 生成后自查清单

- [ ] 文件**完整一次性输出**，无 `// ...省略` 等占位
- [ ] 文件顶部从 `'../helpers'` 导入了全部公共内容，未在 spec 中重复定义
- [ ] 不需要 token 的模块已删去 `loginAndGetToken`，需要 token 的模块保留并正确引用环境变量
- [ ] 每个 operationId：1 正常 + ≥2 异常用例，所有用例调用辅助函数
- [ ] 存在完整业务链路用例
- [ ] 无 `any`，无硬编码账号/URL，`code` 字段为 `string`
- [ ] 错误码来自 `error-codes.md`，无自造
- [ ] 测试数据使用 `safeTestName()` / `safeRange()`
- [ ] 更新/删除目标 ID 来自列表查询，未用创建接口的 `body.data`
- [ ] 删除用例 `beforeAll`：先创建→查列表→按名称匹配取 ID，两步均断言成功
- [ ] 不存在资源的更新/删除异常断言 `[400,500]`，未用 `404`
- [ ] 业务错误用例未断言 `body.data`，响应 `data` 断言未超出 YAML schema
- [ ] 冲突异常用例 `beforeAll` 已主动构造基准数据
