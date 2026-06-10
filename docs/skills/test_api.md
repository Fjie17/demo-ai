<!--
name: API接口测试
description: 当需要生成接口测试代码和测试文档时触发
-->

# API接口测试技能

## 执行前必读文件

```text
docs/api/<模块名>.yaml
docs/conventions/error-codes.md
docs/conventions/glossary.md
docs/conventions/testing/api-test-rules.md   ← 详细规范在这里
frontend-client/src/views/<模块标识>/
docs/requirements/modules.md
docs/requirements/story/user-story-<模块标识>.md ← 必读，提取字段长度、格式等业务约束
```
---

## 执行步骤

1. 读取上述文件，以 `api-test-rules.md` 为执行标准
2. 从 YAML 提取所有 operationId、请求/响应 schema、认证要求
3. **从用户故事中提取字段长度、格式等业务约束，并确保测试数据符合这些约束**
4. 按规范生成以下两个文件：
   <!-- - `tests/docs/<模块名>-test-plan.md` -->
   - `tests/api/<模块名>.api.spec.ts`

---

## 完成后自查

- [ ] 每个 operationId 至少有 1 个正常用例 + 2 个异常用例
- [ ] 存在完整业务链路串联用例
- [ ] 错误码来自 `error-codes.md`，无自造错误码
- [ ] 无 `any` 类型，无硬编码账号密码
- [ ] **测试数据符合用户故事中的业务约束（字段长度、格式、范围等）**
