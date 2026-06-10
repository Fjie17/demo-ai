# E2E 页面测试规范

**生成前完整阅读，输出前逐条过自查清单，全部通过才可输出。**

---

## 一、禁止项

| # | 禁止 | 正确做法 |
|---|------|---------|
| 1 | 未扫描源码就生成测试 | 先运行发现脚本或扫描 Vue 源码，再生成 |
| 2 | 以 Vue 源码文案作为断言依据 | `data-qa` 从源码取；按钮文案、列头、提示语、弹窗标题等可见文字以**需求文档/用户故事**为准，源码文案可能有误 |
| 3 | 用 CSS 类名、层级路径做选择器 | 业务元素只用 `getByTestId(qaId)` |
| 4 | 硬编码完整 URL | `PAGE_URL = APP_URL + '#/<路由>'`，`APP_URL` 从 helpers 导入 |
| 5 | 只写正常流程 | 每个页面至少 2 个异常用例 |
| 6 | 生成登录/登出/路由守卫用例 | 登录态由 `storageState` 管理，spec 不处理 |
| 7 | 用例内内联重复操作 | 重复操作提取到 helpers |
| 8 | `waitForTimeout` 超过 500ms | 改用 `waitForLoadState` / `waitForSelector` |
| 9 | 在 spec 中重新定义 helpers 已有函数 | `fillInput` / `clickButton` / `selectOption` / `clickTableAction` / `safeTestName` / `safeRange` 只 import，不重写 |
| 10 | 从其他 spec 文件 import | 所有公共内容只从 `'../helpers'` 导入 |
| 11 | 用 `getByRole('button')` 或 `getByRole('link')` 定位表格操作列 | 用 `clickTableAction(page, row, '编辑')`，见坑③ |
| 12 | 用 `getByRole('table')` 断言 el-table | el-table 内有两个 `<table>`，改用 `locator('.el-table')`，见坑① |
| 13 | 用 `getByText(文案)` 断言弹窗标题 | 按钮和弹窗标题文案相同会冲突，改用 `locator('.el-dialog__title')`，见坑② |
| 14 | 假设页面已有数据直接操作编辑/删除 | `beforeAll` 中先 API 创建专用数据 |
| 15 | 对封装通用分页组件编写分页测试 | 无法获取内部源码时跳过，注释说明原因 |
| 16 | 对 `safeTestName()` 返回值拼接后缀 | 传不同 `base` 参数区分语义，禁止外部拼接 |
| 17 | 分段/省略输出 | 必须一次性输出完整文件，无 `// ...省略` |

---

## 二、helpers 导出清单

所有 spec 文件只从 `'../helpers'` 导入，禁止重复定义。

| 导出项 | 用途 |
|--------|------|
| `BASE_URL` | 后端 API 根路径 |
| `APP_URL` | 前端应用根路径 |
| `BaseResponse<T>` | API 响应类型（`code: string`） |
| `assertSuccess` / `assertPagedSuccess` / `assertError` | API 断言 |
| `logRequest` / `logResponse` | API 日志 |
| `safeTestName(base?)` | 唯一安全名称（≤10字符，前缀 `__t`） |
| `safeRange()` | 高位安全积分区间，返回 `{ scoreMin, scoreMax }` |
| `fillInput(page, qaId, value)` | 填写输入框（自动处理原生 input / El 组件） |
| `clickButton(page, qaId)` | 点击按钮（自动处理原生 button / El 组件） |
| `selectOption(page, qaId, option)` | 选择 el-select 下拉选项 |
| `clickTableAction(page, rowLocator, actionName)` | 点击表格行内操作链接（el-link） |

---

## 三、生成前必做：扫描页面结构

**方式一（优先）：运行发现脚本**

```bash
npx ts-node tests/e2e/discover.ts <页面hash路径>
# 示例：npx ts-node tests/e2e/discover.ts rank-manage
```

脚本位于 `tests/e2e/discover.ts`，输出所有 `data-qa` 元素、分页组件 HTML、表格操作链接文本。

**方式二：扫描 Vue 源码**（脚本无法运行时）

路径：`frontend-client/zzhg-web/src/views/<模块>/`，**只提取 `data-qa` 及所属标签名**、`el-pagination` 的 `layout` 和 `page-sizes`。按钮文案、列头、提示语等可见文字**不以源码为准，以需求文档/用户故事为准**。

**扫描结果必须写入文件顶部注释：**

```typescript
/**
 * rank E2E 测试
 * data-qa（来自源码扫描）：
 *   input[data-qa="input-rank-name"]      原生 input
 *   div[data-qa="input-rank-score-min"]   el-input-number 外层
 *   button[data-qa="btn-submit"]          原生 button
 * 分页：cacp-complex-table 封装组件，无法获取内部源码 → 跳过分页测试
 * 文案（来自需求文档）："请输入段位名称" / "段位名称不能超过 10 个字符" / "段位创建成功"
 * ⚠️ 可见文字（按钮、列头、提示语）以需求文档为准，不以 Vue 源码为准
 */
```

---

## 四、文件模板

路径：`tests/e2e/<模块>.e2e.spec.ts`　　编号：`TC-<模块大写>-E<两位序号>`

```typescript
/**
 * <模块> E2E 测试
 * data-qa（来自源码扫描）：...
 * 分页：...
 * 文案：...
 */
import { test, expect, Page } from '@playwright/test'
import type { Locator } from '@playwright/test'
import {
  APP_URL, BASE_URL, safeTestName, safeRange,
  fillInput, clickButton, selectOption, clickTableAction,
} from '../helpers'

const PAGE_URL = `${APP_URL}#/<路由路径>`   // 路由路径来自 app-routers

let targetName: string

test.beforeAll(async ({ request }) => {
  targetName = safeTestName('目标')
  const { scoreMin, scoreMax } = safeRange()
  const cr = await request.post(`${BASE_URL}/api/v1/<模块>/create`, {
    data: { name: targetName, scoreMin, scoreMax, icon: 'x' },
  })
  const cb = await cr.json()
  expect(cr.status(), '前置创建失败').toBe(200)
  expect(cb.code, '前置创建失败').toBe('0')
  // E2E 用名称定位行，无需查 ID：
  // page.locator('.el-table__row').filter({ hasText: targetName })
})

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE_URL)
  await page.waitForLoadState('networkidle')
})
```

**必须覆盖的场景：**
- 页面渲染：关键 `data-qa` 元素可见、默认状态正确
- 正常流程：完整操作路径 + 成功提示断言；用请求拦截延迟模拟 Loading 状态
- 异常流程（≥2个）：① 必填为空前端阻止提交（不发请求）② 接口返回业务错误显示提示 ③ 网络中断页面不崩溃
- 分页：仅在能获取 `layout` 和 `page-sizes` 时测试，否则跳过并注释说明

---

## 五、Element Plus 已知坑

### 坑① el-table：用 `locator('.el-table')`，不用 `getByRole('table')`

el-table 内部渲染了 header/body 两个原生 `<table>`，`getByRole('table')` 命中多个元素报错。

```typescript
// ❌  await expect(page.getByRole('table')).toBeVisible()
// ✅
await expect(page.locator('.el-table')).toBeVisible({ timeout: 5000 })
```

### 坑② el-dialog 标题：用 `locator('.el-dialog__title')`，不用 `getByText`

按钮文案与弹窗标题相同（如"新增段位"），`getByText` 同时命中两个元素报错。

```typescript
// ❌  await expect(page.getByText('新增段位')).toBeVisible()
// ✅
await expect(page.locator('.el-dialog__title')).toHaveText('新增段位', { timeout: 5000 })
```

### 坑③ el-link 操作列：用 `clickTableAction`，不用 `getByRole('link')`

el-link 渲染为无 `href` 的 `<a>`，ARIA role 是 `generic` 不是 `link`，`getByRole('link')` 永远超时。`clickTableAction` 内部用 `locator('a').filter({ hasText })` 正确实现。

```typescript
// ❌  await rowLocator.getByRole('link', { name: '编辑' }).click()
// ✅
const row = page.locator('.el-table__row').filter({ hasText: targetName })
await clickTableAction(page, row, '编辑')
```

---

### 坑④ el-message-box 确认按钮：文案以需求为准，不以源码为准

源码里的 `confirmButtonText` 可能与需求不符。**正确做法：以需求文档描述的操作行为来判断按钮文案**，如果需求说"点击确认"则用"确定"，如果需求说"点击确认删除"则用"确认删除"。

```typescript
// ❌ 照抄 Vue 源码里的 confirmButtonText，源码可能是错的
await page.locator('.el-message-box').getByRole('button', { name: '确认删除' }).click()

// ✅ 以需求文档描述为准（需求说"点击确认"→ 用"确定"）
await page.locator('.el-message-box').getByRole('button', { name: '确定' }).click()
```

> 如果需求文档没有明确说明弹窗按钮文案，才以 el-message-box 组件默认值（"确定"）作为兜底。

---

## 六、常用代码片段

```typescript
// 测试数据
const name = safeTestName('新增')          // ✅ 独立调用
const update = safeTestName('更新')        // ✅ 不同 base
// const bad = safeTestName('x') + '_后'  // ❌ 禁止外部拼接

const { scoreMin, scoreMax } = safeRange() // ✅ 字段名固定为 scoreMin / scoreMax

// 网络拦截
await page.route('**/api/v1/<路径>', async route => {
  await new Promise(r => setTimeout(r, 400))  // Loading，≤500ms
  await route.continue()
})
await page.route('**/api/v1/<路径>', route => route.abort('failed'))  // 网络错误
await page.route('**/api/v1/<路径>', route =>
  route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ code: '500', message: '业务错误', data: null }) })
)  // 业务错误

// 断言
await expect(page).toHaveURL(/\/rank-manage/, { timeout: 8000 })   // URL 用正则
await expect(page.getByTestId('btn-submit')).toBeVisible({ timeout: 5000 })
// 超时：跳转 8000ms，元素可见 5000ms，waitForTimeout ≤500ms
```

---

## 七、生成后自查清单

- [ ] 完整一次性输出，无 `// ...省略`
- [ ] 顶部注释列出扫描到的 `data-qa`、文案、分页信息
- [ ] 只从 `'../helpers'` 和 `'@playwright/test'` 导入，未从其他 spec 导入
- [ ] spec 中无重复定义：`fillInput` / `clickButton` / `selectOption` / `clickTableAction` / `safeTestName` / `safeRange`
- [ ] `PAGE_URL` = `APP_URL`（helpers）+ 路由路径，无硬编码
- [ ] 每个用例有 `TC-<模块>-E<序号>` 编号
- [ ] 无内联 `.locator('input')`，全部通过封装函数操作
- [ ] 无登录/登出/路由守卫用例
- [ ] 编辑/删除的 `beforeAll` 用 API 创建数据并两步断言成功
- [ ] 至少 2 个异常用例
- [ ] `waitForTimeout` ≤500ms
- [ ] 分页：能获取源码则按 `layout` 测试；封装组件则注释跳过
- [ ] 名称用 `safeTestName()` 独立调用，无外部拼接后缀
- [ ] 积分区间用 `safeRange()`，字段名为 `scoreMin` / `scoreMax`
- [ ] 断言表格用 `locator('.el-table')`，未用 `getByRole('table')`
- [ ] 断言弹窗用 `locator('.el-dialog__title')`，未用 `getByText`
- [ ] 表格操作用 `clickTableAction`，未用 `getByRole('link')` 或 `getByRole('button')`
- [ ] 所有可见文字断言（按钮、列头、弹窗标题、提示语）以需求文档/用户故事为准，未照抄 Vue 源码
