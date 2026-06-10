# 全局 AI 指令

# 作用范围：整个项目根目录，所有子域指令在此基础上叠加

## 项目定位

这是一个 Java 8 + Spring Boot 2.7.18 + Vue 3 的全栈 Web 项目。
采用「契约驱动开发」模式：前端先输出 OpenAPI YAML，后端依据 YAML 实现，禁止任何一方单方面修改已冻结的接口定义。

---

## 上下文文件（每次生成代码前必须读取）

- `docs/requirements/modules.md` — 模块标识的唯一来源，涉及任何模块时必读

---

## 目录与路径规则

以模块标识为基础，按以下规则确定目录职责、路径和文件命名（示例以 `rank` 为例）：

| 类型 | 路径规则 | 示例 | 禁止操作 |
| ---- | -------- | ---- | -------- |
| 任务书 | `docs/requirements/taskbrief/<模块标识>.md` | `docs/requirements/taskbrief/rank.md` | |
| 原型 | `docs/requirements/prototype/<模块标识>.html` | `docs/requirements/prototype/rank.html` | |
| 用户故事 | `docs/requirements/story/user-story-<模块标识>.md` | `docs/requirements/story/user-story-rank.md` | |
| 接口契约 | `docs/api/<模块标识>.yaml` | `docs/api/rank.yaml` | 禁止在代码里定义接口而不同步到 YAML |
| 数据库脚本 | `docs/db/zhhg_exam_<模块标识>_<表名>.sql` | `docs/db/zhhg_exam_rank_info.sql` | 禁止在代码仓库其他位置维护 DDL |
| 后端 Controller | `controller/<模块标识驼峰>Controller.java` | `controller/RankController.java` | |
| 前端页面 | `src/views/<模块标识>/` | `src/views/rank/` | |
| 前端接口层 | `src/api/<模块标识>.ts` | `src/api/rank.ts` | |
| 前端类型定义 | `src/types/<模块标识>.ts` | `src/types/rank.ts` | |
| mock 数据 | `src/mock/<模块标识>.ts` | `src/mock/rank.ts` | |
| 接口路径前缀 | `/api/v1/<模块标识>` | `/api/v1/rank` | |
| 数据库表前缀 | `zhhg_exam_<模块标识>_` | `zhhg_exam_rank_` | |
| 接口测试 | `tests/api/<模块标识>.api.spec.ts` | `tests/api/rank.api.spec.ts` | 禁止耦合具体实现细节 |
| E2E 测试 | `tests/e2e/<模块标识>.e2e.spec.ts` | `tests/e2e/rank.e2e.spec.ts` | 禁止耦合具体实现细节 |
| 后端规范 | `/docs/conventions/backend` | | |
| 前端规范 | `/docs/conventions/frontend` | | |
| 数据库设计规范 | `/docs/conventions/db` | | |
| 测试生成规范 | `/docs/conventions/testing` | | |
| 错误码规范 | `/docs/conventions/error-codes.md` | | 新增错误码必须遵守此规范 |
| 验收文档与模板 | `/docs/acceptance/` | | 模板文件禁止修改 |
| 前端项目 | `/frontend-client/web/` | | |
| 后端示例代码 | `/backend-server/zhhg-demo-service/` | | 禁止AI修改 |
| 后端核心服务 | `/backend-server/service/` | | |
| 网关服务 | `/backend-server/zhhg-gateway-service/` | | 禁止AI修改 |

---

# 读取并执行规范文件

| 用户意图                                                    | 必须调用的技能                                                                                                                                                    |
|---------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 生成原型 / 页面设计                                             | 读取 docs/skills/req_prototype.md                                                                                                                            |
| 生成故事 / 功能故事                                             | 读取 docs/skills/req_story.md                                                                                                                                |
| 生成需求 /  原型和故事                                           | 读取 docs/skills/req.md                                                                                                                                      |
| 生成数据库设计 / 设计项目表结构 / 数据库                                 | 读取 docs/skills/db_design.md                                                                                                                                |
| 生成后端dao代码 / dao层,mapper,pojo实体类,query类,vo类,form类 / 后端代码 | 读取 docs/skills/srv-dao.md                                                                                                                                  |
| 生成后端service代码 / service层,impl类 / 后端代码                   | 读取 docs/skills/srv-service.md                                                                                                                              |
| 生成后端controller代码 / controller层 / 后端代码                   | 读取 docs/skills/srv-controller.md                                                                                                                           |
| 生成后端 /  后端和数据库                                          | 读取 docs/skills/srv.md                                                                                                                                      |
| 生成页面 / 新增功能 / 生成前端代码                                    | 读取 docs/skills/web_page.md                                                                                                                                 |
| 生成接口文档 / 生成YAML                                         | 读取 docs/skills/web_yaml.md                                                                                                                                 |
| 生成前端 /  生成页面和接口                                         | 读取 docs/skills/web.md                                                                                                                                      |
| 生成接口测试 / API测试 / api test                               | 读取 docs/skills/test_api.md                                                                                                                                 |
| 生成E2E测试 / 页面测试 / e2e                                    | 读取 docs/skills/test_e2e.md                                                                                                                                 |
| 生成测试 / 完整测试 / 所有测试                                      | 读取 docs/skills/test.md                                                                                                                                     |
| 生成功能 / 生成项目 / 生成全部                                      | 读取 docs/skills/project.md                                                                                                                                  |
