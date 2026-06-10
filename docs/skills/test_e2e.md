---
name: E2E页面测试
description: 当需要生成 E2E 浏览器测试代码时触发，前端页面已完成开发并添加好 data-qa 属性
---

## 执行前必读文件

```
frontend-client/web/src/views/<模块>/   ← 扫描已有的 data-qa 属性
docs/requirements/story/<模块名>.md
docs/api/<模块名>.yaml
docs/conventions/error-codes.md
docs/conventions/testing/e2e-test-rules.md   ← 详细规范在这里
```

---

## 执行步骤

1. 扫描前端页面源码，提取已存在的 `data-qa` 属性值，以实际存在的为准
2. 读取用户故事，了解页面功能和路由路径
3. 读取 YAML，提取接口路径（用于 route 拦截）
4. 以 `e2e-test-rules.md` 为规范，生成：
   - `tests/e2e/<模块名>.e2e.spec.ts`

---

## 完成后自查

- [ ] 文件顶部注释列出了实际使用的 data-qa 属性
- [ ] 所有选择器均来自页面真实存在的 data-qa，无假设值
- [ ] 覆盖四类场景（渲染 / 正常流程 / 异常流程 / 路由守卫）
- [ ] 选择器全部使用 `getByTestId`，无 CSS 选择器
- [ ] 无硬编码完整 URL
