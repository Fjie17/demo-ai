#### **cacp-search-layout 组件使用**

功能页面的最外层必须使用 `cacp-search-layout` 组件，该组件提供了搜索表单及结果列表的标准布局。

**搜索插槽配置**\
若功能页面包含搜索需求，需在组件中配置 `search` 插槽，插槽内容为搜索表单的具体代码。

**代码示例**

**vue**

编辑

```Vue
<template>
  <cacp-search-layout>
    <template #search>
      <!-- 搜索表单代码 -->
    </template>
  </cacp-search-layout>
</template>
```

#### **详细示例参考**

- **文件路径**：`frontend-client/web/src/views/demo/TypicalOne.vue`
- **说明**：查看该文件以获取 `cacp-search-layout` 的完整使用示例。

#### **cacp-search-panel-layout 组件说明**

表单搜索区域内部使用 `cacp-search-panel-layout` 组件，该组件负责提供搜索表单及结果列表的布局结构。

- **详细示例**：请查看 `frontend-client/web/src/views/demo/TypicalOne.vue` 文件。
