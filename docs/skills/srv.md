---
name: 后端
description: 当需要生成后端代码时触发，仅生成后端代码
---

## 分别读取下面四个技能，生成对应的后端文件

```
docs/skills/db_design.md ← 生成数据库脚本
docs/skills/srv-dao.md ← 生成后端dao
docs/skills/srv-service.md ← 生成后端service代码
docs/skills/srv-controller.md ← 生成后端controller代码
```

## 执行规则

严格按照顺序逐阶段执行，每个阶段只读取当前阶段所需的技能文件，禁止提前读取后续阶段的技能文件。完成当前阶段并输出文件后，再进入下一阶段。
