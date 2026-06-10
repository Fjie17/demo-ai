# 前端目录结构规范

> 所有前端技能执行前必须读取本文件，以此为准确定文件生成路径。

---

## 目录结构

```
frontend-client/
└── web/
    ├── mock/                        # mock 数据
    │   └── <模块名>.ts
    ├── public/
    └── src/
        ├── apis/                    # 接口调用层（函数名 = YAML operationId）
        │   └── <模块名>.ts
        ├── assets/                  # 静态资源
        ├── components/              # 全局复用组件
        │   └── <ComponentName>/
        │       └── index.vue
        ├── directives/              # 自定义指令
        ├── hooks/                   # 组合式函数
        │   └── use<Name>.ts
        ├── plugins/                 # 插件
        ├── router/                  # 路由
        │   └── index.ts             # 新增页面时在此追加路由
        ├── stores/                  # Pinia 状态管理
        │   └── <模块名>.ts
        ├── types/                   # TypeScript 类型定义
        │   └── <模块名>.ts
        ├── utils/                   # 工具函数
        └── views/                   # 页面组件
            └── <模块名>/
                └── <PageName>.vue
```

---

## 目录职责说明

| 目录 | 职责 | 命名规范 |
|------|------|----------|
| `views/` | 页面级组件，与路由一一对应 | 模块目录 kebab-case，文件 PascalCase |
| `apis/` | 接口调用，函数名 = YAML operationId | camelCase |
| `types/` | 请求/响应类型，从 YAML schema 生成 | PascalCase interface |
| `stores/` | 跨页面共享状态，按模块拆分 | camelCase，以 `use` 开头的函数 |
| `components/` | 复用组件，每个组件独立目录 | PascalCase 目录名 + index.vue |
| `hooks/` | 组合式函数，抽取页面内可复用逻辑 | `use` 前缀，camelCase |
| `mock/` | 本地 mock 数据，文件名与 apis/ 对应 | 同 apis/ |

---

## 文件命名规则

| 类型 | 规则 | 示例 |
|------|------|------|
| 页面组件 | PascalCase | `UserList.vue`、`OrderDetail.vue` |
| 复用组件 | PascalCase 目录 + index.vue | `components/SearchBar/index.vue` |
| 接口文件 | kebab-case 或模块名 | `apis/user.ts`、`apis/order.ts` |
| 类型文件 | 与 apis/ 同名 | `types/user.ts` |
| store 文件 | 与模块名对应 | `stores/user.ts` |
| hook 文件 | use 前缀 | `hooks/useTable.ts` |

---

## 新增页面的完整文件清单

每次新增一个功能页面，需同步生成/修改以下文件：

| # | 文件 | 操作 |
|---|------|------|
| 1 | `src/views/<模块>/<PageName>.vue` | 新建 |
| 2 | `src/apis/<模块>.ts` | 新建或追加 |
| 3 | `src/types/<模块>.ts` | 新建或追加 |
| 4 | `mock/<模块>.ts` | 新建或追加 |
| 5 | `src/router/index.ts` | 追加路由配置 |

如涉及跨页面状态共享，额外生成：
| 6 | `src/stores/<模块>.ts` | 新建或追加 |
