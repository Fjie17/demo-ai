---
name: web_page
description: 当需要生成前端页面、新增功能模块时触发，根据需求生成页面组件、接口调用层、类型定义、mock数据和路由配置
---

## 执行前必读文件

```
docs/requirements/story/<模块名>.md  ← 需求来源，最优先读
docs/conventions/frontend/structure.md  ← 目录结构，确定文件路径
docs/conventions/frontend/common.md     ← 通用规范
docs/conventions/frontend/layout.md    ← 布局规范
docs/conventions/frontend/loading.md   ← 加载状态规范
docs/conventions/frontend/api.md       ← 接口调用规范
docs/conventions/glossary.md           ← 字段命名
docs/conventions/error-codes.md        ← 错误码映射
docs/conventions/testing/e2e-test-rules.md  ← data-qa 命名规范
docs/requirements/prototype/qyz.html  ← 原型文件，提取对应模块的页面结构和交互方式
```

按需读取（根据页面类型）：

```
docs/conventions/frontend/form.md      ← 含表单时
docs/conventions/frontend/table.md     ← 含列表时
docs/conventions/frontend/dialog.md    ← 含弹窗时
```

---

## 执行步骤

1. 读取 `docs/requirements/modules.md` 确认模块标识
2. 读取用户故事，分析页面类型（列表 / 表单 / 详情 / 混合）和所有交互操作
3. 读取 `docs/requirements/prototype/qyz.html`，在文件中定位与当前模块对应的功能区域，提取：
   - 页面布局结构（几栏、有无侧边栏、搜索区位置等，不读取左侧菜单栏）
   - 表单字段和顺序
   - 表格列定义和操作按钮
   - 弹窗内容和交互
   - 特殊交互逻辑（如原型中有的联动、校验提示等）
4. 以原型为视觉和交互基准，用户故事为业务逻辑基准，两者结合生成页面
5. 按 `structure.md` 确定所有文件的输出路径
6. 依次生成以下文件：

### ① `src/types/<模块名>.ts`

根据页面交互和字段需求定义类型，优先生成供后续引用。
字段命名严格引用 `glossary.md`，禁止使用 `any`。

### ② `src/apis/<模块名>.ts`

函数名对应页面操作语义，参考 `api.md` 规范：

```typescript
import request from '@/utils/request'
import type { LoginRequest, LoginData } from '@/types/<模块名>'

export const loginUser = (data: LoginRequest) => request.post<LoginData>('/api/v1/auth/login', data)
```

### ③ `mock/<模块名>.ts`

根据页面需要的数据结构生成 mock，字段与 types 保持一致。
必须使用 `vite-plugin-mock` 支持的数组格式，禁止使用 Express 风格（`req, res`）：

```typescript
// ✅ 正确格式
export default [
  {
    url: '/mock/api/v1/',
    method: 'get',
    response: ({ query }: any) => {
      return {
        code: '0',          // code 必须是字符串 '0'，不能是数字 0
        message: 'success',
        data: { ... }
      }
    },
  },
]

// ❌ 禁止使用 Express 风格
export default {
  'GET /mock/api/v1/': (req: any, res: any) => {
    res.send({ ... })
  }
}

```

**返回结构规范：**

- `code` 必须是字符串 `'0'`，不能是数字 `0`
- 分页结构固定包含：`list`、`total`、`pageNum`、`pageSize`、`size`、`pages`
- `size` = 当前页实际条数，`pages` = `Math.ceil(total / pageSize)`
- 如果存在创建时间和更新时间字段，创建时间字段必须是 `recCreateTime`，更新时间字段必须是 `recLastUpdateTime`

### ④ `docs/api/<模块名>.yaml`

一定要读取docs/skills/web_yaml.md中的内容，生成接口文档 / 生成YAML。

### ⑤ `src/views/<模块名>/<PageName>.vue`

页面顶部注释标注用户故事编号：

```vue
<!-- US-01: 用户登录 -->
```

**data-qa 属性规则（必须添加）**

参考 `e2e-test-rules.md` 中的命名规范，为所有可交互元素添加 `data-qa` 属性：

| 元素类型 | 添加规则              | 示例                        |
| -------- | --------------------- | --------------------------- |
| 输入框   | 所有 input / el-input | `data-qa="input-username"`  |
| 按钮     | 所有操作按钮          | `data-qa="btn-login"`       |
| 表单     | 表单容器              | `data-qa="form-login"`      |
| 表格     | 表格容器              | `data-qa="table-user"`      |
| 列表项   | 可点击的列表项        | `data-qa="item-order"`      |
| 弹窗     | 弹窗容器              | `data-qa="modal-confirm"`   |
| 错误提示 | 错误文案区域          | `data-qa="error-message"`   |
| 用户信息 | 展示用户数据的区域    | `data-qa="user-nickname"`   |
| 分页     | 分页组件              | `data-qa="pagination-user"` |
| 搜索栏   | 搜索容器              | `data-qa="search-user"`     |

```vue
<!-- 示例 -->
<el-form data-qa="form-login">
  <el-input data-qa="input-username" v-model="form.username" />
  <el-input data-qa="input-password" v-model="form.password" type="password" />
  <div data-qa="error-message" v-if="errorMsg">{{ errorMsg }}</div>
  <el-button data-qa="btn-login" @click="handleLogin">登录</el-button>
</el-form>
```

根据页面类型套用对应规范：

- 列表页 → `table.md`
- 表单页 → `form.md`
- 含弹窗 → `dialog.md`
- 加载状态 → `loading.md`，**Loading / Error / Empty 三态必须处理**

### ⑤ `src/router/app-routers.ts`（追加，不覆盖）

```typescript
{
  path: '/<模块>/<页面>',
  name: '<PageName>',
  component: () => import('@/views/<模块名>/<PageName>.vue'),
  meta: { title: '<页面标题>', keepAlive: false }
}
```

---

## 完成后输出 data-qa 清单

生成完成后，以表格形式列出本次添加的所有 `data-qa` 值，供测试工程师参考：

| data-qa 值       | 元素类型  | 所在页面 | 说明         |
| ---------------- | --------- | -------- | ------------ |
| `form-login`     | el-form   | 登录页   | 登录表单容器 |
| `input-username` | el-input  | 登录页   | 用户名输入框 |
| `input-password` | el-input  | 登录页   | 密码输入框   |
| `btn-login`      | el-button | 登录页   | 登录按钮     |
| `error-message`  | div       | 登录页   | 错误提示区域 |

> 以上为示例，实际内容根据页面元素动态生成。

---

## 禁止事项

- 禁止使用 `any` 类型
- 禁止只写 happy path，三态必须处理
- 禁止覆盖 `router/index.ts` 已有内容
- 禁止覆盖 `router/app-routers.ts` 已有内容
- 禁止内联 style
- 字段命名禁止自造，必须引用 `glossary.md`
- 禁止遗漏任何可交互元素的 `data-qa` 属性
- 禁止使用 Express 风格（`req, res`）编写 mock，必须使用 `vite-plugin-mock` 的数组格式
- 禁止 `code` 返回数字类型，必须是字符串 `'0'`
- 禁止创建时间和更新时间使用其他字段名，必须是 `recCreateTime` 和 `recLastUpdateTime`

---

## 完成后自查

- [ ] types 字段命名与 glossary.md 一致
- [ ] apis 函数名语义清晰，与页面操作对应
- [ ] mock 数据结构与 types 一致
- [ ] 页面处理了 Loading / Error / Empty 三态
- [ ] 路由已追加且未覆盖已有内容
- [ ] 所有可交互元素均有 data-qa 属性
- [ ] 已输出 data-qa 清单
- [ ] 无 TypeScript 类型错误
- [ ] mock 字段名与 types 定义完全一致
- [ ] mock 数据在页面上正确展示（列表有数据、详情无空白、分页正常）
- [ ] Loading / Empty 状态在开发环境下可正常触发

---

## 运行验证（生成后必须执行）

所有文件生成完毕后，按以下顺序逐项验证，**发现问题立即修复，不跳过**。

### 1. TypeScript 类型检查

逐一核查生成文件，确保无类型错误：

- `types/<模块名>.ts` — 所有 interface 字段有明确类型，无 `any`
- `apis/<模块名>.ts` — 泛型参数与 types 中的类型对应，import 路径正确
- `views/<模块名>/<PageName>.vue` — 模板引用的变量均已在 `<script setup>` 中声明

常见错误：

```typescript
// ❌ 类型未导入
const list = ref<UserInfo[]>([]) // UserInfo 未 import

// ✅ 正确
import type { UserInfo } from '@/types/user'
const list = ref<UserInfo[]>([])
```

### 2. mock 数据结构验证

对照 `src/types/<模块名>.ts`，逐字段核对 mock 数据：

- 字段名与 interface 完全一致（大小写、拼写）
- 字段类型与声明匹配（number 不给 string，数组不给对象）
- 必填字段不能为 `null` 或 `undefined`
- 嵌套对象结构完整
- 创建时间和更新时间字段必须是 `recCreateTime` 和 `recLastUpdateTime`

```typescript
// ❌ 字段名不一致，types 定义 accessToken，mock 写了 token
{
  token: 'abc123'
}

// ✅ 正确
{
  accessToken: 'abc123'
}
```

### 3. 接口路径验证

- `src/apis/` 中的路径与 mock 拦截路径完全一致
- 路径格式符合 `/api/v1/<资源>` 规范
- HTTP 方法（POST / GET）与操作语义匹配

### 4. 模板引用验证

- `v-model` 绑定的变量已在 `<script setup>` 中声明
- `v-for` 数据源是数组类型，`:key` 有唯一值
- `v-if` / `v-show` 的条件变量已声明
- `@click` 等事件处理函数已定义
- 用到的组件已正确 import

### 5. mock 数据展示验证

确认 mock 生效后，逐类型检查页面展示：

| 页面类型 | 验证要点                                                       |
| -------- | -------------------------------------------------------------- |
| 列表页   | 表格有数据行，不是空表格；分页 total > 0                       |
| 表单页   | 有默认值的字段正确回显                                         |
| 详情页   | 所有字段有值，无空白区域                                       |
| 通用     | Loading 状态显示正常；mock 返回空数组时显示 Empty 提示而非空白 |

### 6. 接口文档验证

- `docs/api/<模块名>.yaml` — 与 apis/<模块名>.ts 中的函数签名完全一致

```

```
