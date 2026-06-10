---
name: srv-dao
description: 当生成DAO、Mapper、POJO、VO、Query、Form代码时触发
---

## 执行前必读文件

```
docs/conventions/backend/structure.md  ← 后端目录结构，确定文件路径
docs/api/<对应模块>.yaml          ← 接口契约，提取字段和数据结构
docs/db/<对应表名>.sql               ← 数据库结构，用于生成实体类
docs/conventions/backend/cacp-code-check.md  ← 后端代码扫描规则
docs/conventions/backend/cacp-code-rule.md  ← 后端代码规范
docs/conventions/backend/yp-project-code-rule.md  ← 后端代码规范
```

---

## 执行步骤

### Step 1 — 提取信息

从以下文件中提取必要信息：
- `docs/api/<对应模块>.yaml`：提取请求/响应字段、参数类型、是否必填
- `docs/db/<对应表名>.sql`：提取表结构、字段名、类型、约束

### Step 2 — 生成POJO类

- **路径**：`backend-server/service/src/main/java/cn/exam/pojo/`
- **命名规范**：表名去掉前缀后首字母大写，驼峰命名，如 `zhhg_exam_rank` → `Rank.java`
- **主键命名规范**：直接使用固定字段`id` 来表示主键，如 `PK_ZHHG_EXAM_RANK` → `id`
- **日期类型规范**：使用Java 8的LocalDateTime类型，避免使用Date类型。

**代码格式**：
```java
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 排行榜表实体类
 */
@Data
@TableName("zhhg_exam_rank")
public class Rank implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "PK_ZHHG_EXAM_RANK", type = IdType.ASSIGN_ID)
    private String id;

    /**
     * 排行榜名称
     */
    private String name;

    /**
     * 排行榜图标
     */
    private String icon;

    /**
     * 最低分数
     */
    private BigDecimal minScore;

    /**
     * 最高分数
     */
    private BigDecimal maxScore;

    /**
     * 版本号
     */
    private Integer recVersion;

    /**
     * 创建时间
     */
    private LocalDateTime recCreateTime;

    /**
     * 更新时间
     */
    private LocalDateTime recLastUpdateTime;

    /**
     * 删除标志
     */
    private Integer deleteFlag;
}
```

### Step 3 — 生成Mapper接口

- **路径**：`backend-server/service/src/main/java/cn/exam/dao/`
- **命名规范**：POJO类名 + Mapper，如 `RankMapper.java`
- **注解要求**：Mapper接口必须使用`@Mapper`注解

**代码格式**：
```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import cn.exam.pojo.Rank;
import org.apache.ibatis.annotations.Mapper;

/**
 * 排行榜表Mapper接口
 */
@Mapper
public interface RankMapper extends BaseMapper<Rank> {
}
```

### Step 4 — 生成Mapper XML文件

- **路径**：`backend-server/service/src/main/resources/mapper/`
- **命名规范**：Mapper接口名 + .xml，如 `RankMapper.xml`
- **主键命名规范**：直接使用固定字段`id` 来表示主键，如 `PK_ZHHG_EXAM_RANK` → `id`

**代码格式**：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="cn.exam.dao.RankMapper">
    <!-- 通用查询映射结果 -->
    <resultMap id="BaseResultMap" type="cn.exam.pojo.Rank">
        <id column="PK_ZHHG_EXAM_RANK" property="id"/>
        <result column="NAME" property="name"/>
        <result column="ICON" property="icon"/>
        <result column="MIN_SCORE" property="minScore"/>
        <result column="MAX_SCORE" property="maxScore"/>
        <result column="REC_VERSION" property="recVersion"/>
        <result column="REC_CREATE_TIME" property="recCreateTime"/>
        <result column="REC_LAST_UPDATE_TIME" property="recLastUpdateTime"/>
        <result column="DELETE_FLAG" property="deleteFlag"/>
    </resultMap>

    <!-- 通用查询结果列 -->
    <sql id="Base_Column_List">
        PK_ZHHG_EXAM_RANK, NAME, ICON, MIN_SCORE, MAX_SCORE, REC_VERSION, REC_CREATE_TIME, REC_LAST_UPDATE_TIME, DELETE_FLAG
    </sql>
</mapper>
```

### Step 5 — 生成Parameter类

**Query类（查询参数）**
- **路径**：`backend-server/service/src/main/java/cn/exam/parameter/`
- **命名规范**：功能名 + Query，如 `RankQuery.java`
- **主键命名规范**：直接使用固定字段`id` 来表示主键，如 `PK_ZHHG_EXAM_RANK` → `id`
- **代码格式**：继承 `BasePageQuery`
- **字段注解校验**: 必填字段必须加校验注解，禁止裸字段：如 `@NotBlank`、`@NotNull`、`@Size` 等


**Form类（新增/编辑参数）**
- **路径**：`backend-server/service/src/main/java/cn/exam/parameter/`
- **命名规范**：功能名 + Form，如 `RankForm.java`
- **主键命名规范**：直接使用固定字段`id` 来表示主键，如 `PK_ZHHG_EXAM_RANK` → `id`
- **字段注解校验**: 必填字段必须加校验注解，禁止裸字段：如 `@NotBlank`、`@NotNull`、`@Size` 等

常用校验注解对应规则：

| 场景 | 注解 |
|------|------|
| 不能为 null | `@NotNull` |
| 字符串不能为空 | `@NotBlank` |
| 数字最小值 | `@Min(1)` |
| 数字最大值 | `@Max(100)` |
| 字符串长度 | `@Size(min=1, max=50)` |
| 正则格式 | `@Pattern(regexp="...")` |

必填字段的判断依据：YAML 中 `required` 列表里的字段全部加校验注解。

### Step 6 — 生成VO类

**路径**：`backend-server/service/src/main/java/cn/exam/viewobject/`
- **命名规范**：功能名 + Vo，如 `RankVo.java`
- **主键命名规范**：直接使用固定字段`id` 来表示主键，如 `PK_ZHHG_EXAM_RANK` → `id`
- **日期类型规范**：使用Java 8的LocalDateTime类型，避免使用Date类型。

**代码格式**：
```java
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 排行榜视图对象
 */
@Data
public class RankVo {
    /**
     * 排行榜ID
     */
    private String id;

    /**
     * 排行榜名称
     */
    private String name;

    /**
     * 排行榜图标
     */
    private String icon;

    /**
     * 最低分数
     */
    private BigDecimal minScore;

    /**
     * 最高分数
     */
    private BigDecimal maxScore;

    /**
     * 版本号
     */
    private Integer recVersion;

    /**
     * 创建时间
     */
    private LocalDateTime recCreateTime;

    /**
     * 更新时间
     */
    private LocalDateTime recLastUpdateTime;

    /**
     * 删除标志
     */
    private Integer deleteFlag;
}
```

---

## 命名与格式规范

**包路径**：必须严格使用 `cn.exam.xxx`

**命名转换规则**：
- 主键命名规范**：直接使用固定字段`id` 来表示主键，如 `PK_ZHHG_EXAM_RANK` → `id`
- 其他数据库字段 → Java属性：下划线转驼峰，如 `MIN_SCORE` → `minScore`
- 表名 → 类名：去掉前缀 `zhhg_exam_`，首字母大写驼峰，如 `zhhg_exam_rank` → `Rank`

**注解要求**：
- POJO类必须使用 `@Data`、`@TableName` 注解
- 主键字段必须使用 `@TableId` 注解
- 所有类和字段必须有中文注释

---

## 禁止事项

- 禁止修改现有文件，只允许新增
- 禁止生成不符合规范的命名
- 禁止省略必要的注解
- 禁止忽略字段的可空性
- 禁止在POJO中添加业务逻辑
- 禁止使用Date类型，必须使用LocalDateTime类型
- 禁止使用Double,Float等类型，必须使用BigDecimal类型
- 禁止请求的Form类的必填字段裸写无注解，必须根据 YAML required 字段逐一添加对应校验注解



---

## 完成后自查

- [ ] 所有文件路径正确
- [ ] 所有文件都要包含正确包路径 `package cn.exam.xxx;`
- [ ] 命名符合规范,主键的命名规范要进行单独检查
- [ ] 主键的命名规范要进行单独检查,直接使用固定字段`id` 来表示主键，如 `PK_ZHHG_EXAM_RANK` → `id`,vo,form.query类也需要符合这个规范
- [ ] 注解使用正确
- [ ] 所有类和字段都有中文注释
- [ ] POJO与数据库表字段对应
- [ ] Query类继承BasePageQuery
- [ ] VO类与YAML响应结构一致
- [ ] 没有生成多余的代码
- [ ] 所有日期类型都使用LocalDateTime
- [ ] 所有浮点类型都使用BigDecimal,避免使用Double,Float等类型
- [ ] 所有请求的Form类的必填字段已根据 YAML required 添加校验注解
