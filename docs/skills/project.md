---
name: 项目
description: 当需要生成项目代码时触发
---

## 分别读取下面四个技能，生成对应的项目代码

```
docs/skills/req.md ← 生成原型和故事
docs/skills/web.md ← 生成前端页面和接口契约
docs/skills/srv.md ← 生成后端代码
docs/skills/test.md ← 生成测试代码
```

## 执行规则

严格按照顺序逐阶段执行，每个阶段只读取当前阶段所需的技能文件，禁止提前读取后续阶段的技能文件。完成当前阶段并输出文件后，再进入下一阶段。
