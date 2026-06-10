---
name: db_design
description: 当需要进行数据库设计、生成数据库表结构时触发
---

## 执行前必读文件

```
docs/api/<对应模块>.yaml          ← 接口契约，提取字段和数据结构
docs/conventions/db/cacp-db-rule.md  ← 数据库设计规范，必须遵循
```

---

## 执行步骤

### Step 1 — 从 YAML 提取字段信息

扫描 `docs/api/<对应模块>.yaml`，提取：
- requestBody 和 response 中的所有字段名、类型、是否必填
- 业务实体关系（从接口语义推断表间关联）

> 注意：`demo.yaml` 仅供格式参考，不需要为其生成表结构。

### Step 2 — 按规范设计表结构

严格遵循 `cacp-db-rule.md` 中的所有规范，同时强制执行以下约束：

**命名规范**
- 所有表名以 `zhhg_exam_` 开头，全部小写
- 字段名全部大写
- 主键字段名统一使用规范命名（不得照搬 YAML 中的 id 字段名）

**字符集**
- 所有表的字符集统一使用 `utf8mb4`
- 排序规则统一使用 `utf8mb4_0900_ai_ci`

**必备公共字段**
每张表都必须包含以下字段（参考 `cacp-db-rule.md` 中的定义）：
- 主键(命名方式需使用PK_表名, 类型为VARCHAR(64),大写)
- 创建时间(REC_CREATE_TIME, 类型为DATETIME, 不可为空)
- 更新时间(REC_LAST_UPDATE_TIME, 类型为DATETIME, 不可为空)
- 版本号(REC_VERSION, 类型为INT, 默认值0)
- 删除标识(DELETE_FLAG, 类型为INT, 默认值0)

### Step 3 — 生成 SQL 脚本文件

- 文件命名格式：`表名称.sql`（日期为当天日期）
- 输出路径：`docs/db/`
- 每张表单独一个 SQL 文件
- **禁止修改或删除 `docs/db/` 下已有的文件和文件夹**

SQL 文件格式：
```sql
-- 表名：zhhg_exam_xxx
-- 描述：xxx
-- 创建时间：yyyy-MM-dd
-- 版本：V1.0

CREATE TABLE `zhhg_exam_xxx` (
  -- 字段定义
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='xxx';
```

---

## 禁止事项

- 禁止为 `demo.yaml` 生成表结构
- 禁止主键使用 YAML 中的字段命名
- 禁止修改或删除 `docs/db/` 下已有文件
- 禁止表名使用大写
- 禁止字段名使用小写
- 禁止使用 `utf8mb4_0900_ai_ci` 以外的排序规则
- 禁止添加 cacp-db-rule.md 中未定义的公共字段（DELETE_FLAG 除外）

---

## 完成后自查

- [ ] 所有表名以 `zhhg_exam_` 开头且全部小写
- [ ] 所有字段名全部大写
- [ ] 字符集为 `utf8mb4`，排序规则为 `utf8mb4_0900_ai_ci`
- [ ] 主键命名未照搬 YAML 字段名,(命名方式需使用PK_表名,大写)
- [ ] 每张表包含公共字段（创建时间(REC_CREATE_TIME)、更新时间(REC_LAST_UPDATE_TIME)、版本号(REC_VERSION)、删除标识(DELETE_FLAG)）
- [ ] SQL 文件命名格式为 `表名称.sql`
- [ ] 未修改或删除 `docs/db/` 下已有内容
- [ ] 设计文档已写入 `docs/db/` 目录
