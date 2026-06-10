# Cacp项目后端代码规范

## 概述

本文档为 Cacp项目后端代码重构规范，共 50 条检查项，涵盖开发架构、代码结构、异常处理、安全性、日志输出、接口定义、数据库、配置工具等方面。

---

# 一、开发架构（HDA）约束

## 1.1 依赖规范

| 序号 | 规范要求 |
|------|----------|
| **1** | 项目父依赖应为 `cacp-spring-boot-parent` 或基于该依赖的自定义项目 |
| **2** | 项目核心依赖为 `cacp-service-spring-boot-starter` 或 `cacp-job-spring-boot-starter` 两者之一 |
| **3** | 项目如果使用数据源，则**必须**依赖 `cacp-datasource-spring-boot-starter` |

## 1.2 项目结构规范

| 序号 | 规范要求 |
|------|----------|
| **4** | 项目包/目录结构符合脚手架生成项目的基本结构，包路径匹配 `cn.*` |
| **5** | 项目命名应用按照 **"应用编码-功能描述-service/job"** 规则，且 `spring.application.name` 跟项目名保持一致 |

### 目录结构规范

```
├─java
│  └─cn
│                  └─{应用包名}
│                      │  Application.java  # 程序启动类
│                      ├─config   # 配置类
│                      ├─constant # 常量类
│                      │      DemoExceptionCodeMessage.java
│                      │      DemoResultCodeMessage.java
│                      ├─controller # 接口层（对外API）
│                      ├─dao        # 数据库Mapper接口
│                      ├─parameter # 接口上行参数实体，表单提交Form结尾、查询请求Query结尾
│                      ├─pojo     # 实体类
│                      ├─proxy    # 调用服务（远程接口代理）
│                      ├─service  # 业务逻辑层
│                      │  └─impl     # 业务逻辑层实现类
│                      └─viewobject # 接口下行实体 vo结尾│
└─resources
    │  application.yml  // 配置文件
    ├─mapper
    │  ├─common        // 数据库xml配置。 common 适配所有数据源的sql
    │  └─mysql         // mysql 适配mysql语法的sql 语句，后续可以根据实际数据库类型进行扩展
```

---

# 二、代码结构

| 序号 | 规范要求 |
|------|----------|
| **6** | 代码中不应存在复杂的 if-else 和 for 循环嵌套（**嵌套层数 > 3**、**语句块逻辑除注释外 > 20行**） |
| **7** | 判断逻辑应简洁清晰（尽量使用工具类判断，**组合判断逻辑运算符不超过 3 个**） |
| **8** | 类和方法功能应单一，多个功能需要拆分（类按面向对象定义设计、方法保证职责单一） |
| **9** | 代码保持统一格式化，方法行数过多应简化或拆分（**行数应控制在 30 行以内**） |
| **10** | 重复或类似代码，要抽出独立的方法或类（**两处相同即为重复**） |
| **11** | 同一个接口功能不应太多，具体逻辑应该由具体类的具体方法实现（接口指对外提供的api接口，逻辑应尽量简单，业务逻辑下放到具体类的具体方法） |
| **12** | 尽量避免 switch 使用，可使用多态代替 switch，**如使用 switch 则必须包含 default** |
| **13** | 消除**魔数**，多处相同字符串或数字，应抽取为常量 |
| **14** | **代码中禁止使用 Date 类**，应使用 LocalDateTime 替换 |
| **15** | **严禁使用循环方式操作数据库**，必要时使用批量操作 |
| **16** | 避免在同一个 service 中，一个方法内部调用另一个带事务的方法（事务不生效） |
| **17** | 类名、变量名、方法名等命名要规范（采用驼峰命名，见名知意） |
| **18** | 应准确编写注释内容，删除无用代码 |
| **19** | 避免一行代码过长（**不要超过 120 字符**） |
| **20** | 应去掉多余的 import 引用 |
| **21** | **不使用 hutool 工具类包**，建议使用 `common-lang3`、`guava` 工具集 |
| **22** | 字符串拼接，尤其是循环拼接，**应使用 StringBuilder** |
| **23** | 响应信息尽量避免包含前端代码，或使用 **ESAPI 库**进行输出编码以防止 XSS 攻击 |

---

# 三、异常处理

| 序号 | 规范要求 |
|------|----------|
| **24** | 异常捕获后需处理为自定义封装（`BizException`），使用统一错误标识（实现 `ExceptionCodeMessage` 的异常编码枚举类） |
| **25** | try-catch 异常后**禁止使用 `e.printStackTrace()`** 方式输出且没有其他处理（防止异常日志丢失） |
| **26** | 异常捕获后如需重新抛出自定义业务异常，则不必额外使用 `log.error` 记录，直接 `throw new BizException(...)` 即可；如不再抛出则应使用 `log.error` 记录 |

### 异常处理规范

```java
// ✅ 正确示例：重新抛出自定义异常，无需额外log
try {
    // 业务逻辑
} catch (Exception e) {
    throw new BizException(CommonExceptionCodeMessage.XXX_ERROR, e.getMessage());
}

// ✅ 正确示例：不重新抛出，需要log记录
try {
    // 业务逻辑
} catch (Exception e) {
    log.error("操作失败，具体原因：{}", e.getMessage(), e);
    // 其他处理逻辑
}

// ❌ 错误示例：禁止使用
try {
    // 业务逻辑
} catch (Exception e) {
    e.printStackTrace(); // 禁止！
}
```

---

# 四、安全性

| 序号 | 规范要求 |
|------|----------|
| **27** | 避免空指针风险，方法尽量**不返回 null** |
| **28** | 字符串比对应注意 NPE 问题，可使用 `ObjectUtils` 提供的比对方法，如：`ObjectUtils.equals(str1, str2)` |
| **29** | 应使用 `SecureRandom` 替代 `Random` 生成安全敏感的随机数，`Random` 仅可用于非安全场景如内部分组 |
| **30** | 对用户提供数据，敏感信息需加密或脱敏展示（如：**手机号、身份证、银行卡号**等） |
| **31** | Redis 缓存数据需配置**有效期** |
| **32** | **禁止缓存 MB 级以上数据** |
| **33** | 避免缓存 key 重复，应带有独有的命名标识，如 `"业务模块:对象类型:ID"` |

### 安全编码规范

```java
// ✅ 字符串比较使用 ObjectUtils
ObjectUtils.equals(str1, str2);

// ✅ 脱敏示例
phone.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2");  // 手机号
idCard.replaceAll("(\\d{6})\\d{8}(\\d{4})", "$1********$2");  // 身份证

// ✅ 缓存Key规范
"user:info:12345"
"order:detail:ABC123"
```

---

# 五、日志输出

| 序号 | 规范要求 |
|------|----------|
| **34** | 注意日志输出级别，区分 `INFO` / `WARN` / `DEBUG` / `ERROR` |
| **35** | 日志输出信息要**准确、精简**，方便定位，避免输出过多无用内容 |
| **36** | 复杂业务逻辑处理要为排查问题补充 **debug 级别日志** |

### 日志级别使用场景

| 级别 | 使用场景 |
|------|----------|
| `DEBUG` | 复杂业务逻辑排查、详细执行路径 |
| `INFO` | 正常业务流程关键节点 |
| `WARN` | 潜在问题但不影响流程（如：重试、边界值处理） |
| `ERROR` | 影响业务的异常（如：远程调用失败、核心流程中断） |

---

# 六、接口定义

| 序号 | 规范要求 |
|------|----------|
| **37** | URL 路径名称要求：**全小写、不使用驼峰、使用 "-" 连接**（如 `/get-user`、`/query-order-list`） |
| **38** | Controller 接口中推荐使用 **GET 和 POST** 请求方式，尽量不用 PUT 和 DELETE |
| **39** | 接口请求参数只定义业务所需的字段，**避免冗余参数** |
| **40** | 删除或其它对数据库数据有操作的接口，应使用 **Post 请求**，执行语句**带 `rec_version`（版本号）条件** |

### RESTful 接口规范

```java
// ✅ 正确示例
@GetMapping("/get-user")
@PostMapping("/save-order")
@PostMapping("/delete-record")  // 删除操作也用POST

// ❌ 错误示例
@DeleteMapping("/delete-record")
@PutMapping("/updateData")
```

---

# 七、数据库

| 序号 | 规范要求 |
|------|----------|
| **41** | 数据库表要包含以下**三个必备字段**：`REC_VERSION`（版本号）、`REC_CREATE_TIME`（创建时间）、`REC_LAST_UPDATE_TIME`（最后更新时间） |
| **42** | service 中多次操作数据库要开启事务，且考虑抛出异常时数据库回滚问题 |
| **43** | 数据库表设计时主键列名要有业务含义（如 `USER_ID`） |
| **44** | mybatis 的 mapper.xml 中编写 sql，**没有条件时不要留下 where 关键字** |

### 必备字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `REC_VERSION` | INT | 版本号，更新时+1 |
| `REC_CREATE_TIME` | DATETIME | 创建时间 |
| `REC_LAST_UPDATE_TIME` | DATETIME | 最后更新时间 |

### mapper.xml 规范

```xml
<!-- ✅ 正确示例：有WHERE条件 -->
<select id="selectById" resultType="User">
    SELECT * FROM user WHERE user_id = #{userId}
</select>

<!-- ✅ 正确示例：无条件，不用WHERE -->
<select id="selectAll" resultType="User">
    SELECT * FROM user
</select>

<!-- ❌ 错误示例：无条件但留了WHERE -->
<select id="selectAll" resultType="User">
    SELECT * FROM user WHERE 1=1  <!-- 不推荐 -->
</select>
```

---

# 八、配置与工具

| 序号 | 规范要求 |
|------|----------|
| **45** | 读取配置文件中的配置，尽量使用 `@ConfigurationProperties` 注解类接收，**减少 `@Value` 注解的使用** |
| **46** | 在处理 stream 流时要有流关闭逻辑，推荐使用 **try-with-resources** 方式，或添加 `@Cleanup` 注解 |
| **47** | 推荐使用**构造器注入**替换 `@Resource`、`@Autowired` 注入，可以使用 `@RequiredArgsConstructor` 注解简化（构造器注入指定 bean 时，需要手动添加构造方式并使用 `@Qualifier` 注解指定 Bean） |

### 配置注入规范

```java
// ✅ 推荐：@ConfigurationProperties
@ConfigurationProperties(prefix = "app.file")
public class FileProperties {
    private String uploadPath;
    private int maxSize;
}

// ✅ 推荐：构造器注入 + @RequiredArgsConstructor
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserDao userDao;
    private final RedisTemplate redisTemplate;
}

// ✅ 手动指定Bean的构造器注入
@Service
public class UserService {
    private final UserDao userDao;
    @Autowired
    public UserService(@Qualifier("primaryRedisTemplate") RedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
}

// ❌ 不推荐：@Value注入复杂配置
@Value("${app.file.upload-path}")
private String uploadPath;
```

### Stream 资源关闭

```java
// ✅ 推荐：try-with-resources
try (Stream<String> lines = Files.lines(path)) {
    List<String> result = lines.collect(Collectors.toList());
}

// ✅ 推荐：@Cleanup注解
@Cleanup InputStream in = new FileInputStream("file.txt");
```

---

# 九、其他

| 序号 | 规范要求 |
|------|----------|
| **48** | 状态（如：未审批、已审批）**不建议使用数字**，建议使用有意义的字符串 |
| **49** | 审计日志记录和调用时机要合理，如**用户登录、敏感操作、数据修改**等关键节点 |
| **50** | git 上传避免非代码相关内容，使用 `.gitignore` |

### 状态值规范

```java
// ✅ 推荐：使用有意义的字符串
private static final String STATUS_PENDING = "PENDING";
private static final String STATUS_APPROVED = "APPROVED";
private static final String STATUS_REJECTED = "REJECTED";

// ❌ 不推荐：使用数字
private static final int STATUS_PENDING = 0;
private static final int STATUS_APPROVED = 1;
```

---

# 十、规范速查表

## 10.1 数字约束

| 项目 | 限制值 |
|------|--------|
| 方法行数 | ≤ 30 行 |
| if-else/for 嵌套层数 | ≤ 3 层 |
| 语句块行数 | ≤ 20 行（除注释外） |
| 一行代码字符数 | ≤ 120 |
| 组合判断运算符 | ≤ 3 个 |

## 10.2 禁止使用

| 类别 | 禁止项 | 替代方案 |
|------|--------|----------|
| 日期时间 | `Date` 类 | `LocalDateTime` |
| 字符串拼接 | `+` 在循环中 | `StringBuilder` |
| 异常输出 | `e.printStackTrace()` | `log.error(...)` |
| 工具类 | `hutool` | `common-lang3`、`guava` |
| 随机数 | `Random`（安全场景） | `SecureRandom` |

## 10.3 推荐使用

| 场景 | 推荐 |
|------|------|
| 字符串比较 | `ObjectUtils.equals()` |
| 配置注入 | `@ConfigurationProperties` |
| 依赖注入 | `@RequiredArgsConstructor` + 构造器注入 |
| Stream关闭 | try-with-resources / `@Cleanup` |
| 循环查库 | 批量操作 |
| XSS防护 | ESAPI 编码 |

---

# 十一、重构检查清单

## 开发架构
- [ ] 父依赖使用 `cacp-spring-boot-parent`
- [ ] 核心依赖使用 `cacp-service-spring-boot-starter` 或 `cacp-job-spring-boot-starter`
- [ ] 使用数据源时依赖 `cacp-datasource-spring-boot-starter`
- [ ] 包路径匹配 `cn.*`
- [ ] 项目名符合 "应用编码-功能描述-service/job" 规则

## 代码结构
- [ ] 无 if-else/for 嵌套超过 3 层
- [ ] 语句块不超过 20 行
- [ ] 方法行数 ≤ 30 行
- [ ] 无重复代码（两处相同即需抽取）
- [ ] 无 switch 或 switch 有 default
- [ ] 无魔数（使用常量）
- [ ] 不使用 Date（使用 LocalDateTime）
- [ ] 无循环操作数据库
- [ ] 不在同类方法间调用事务方法
- [ ] 命名规范（驼峰、见名知意）
- [ ] 无无用代码和多余 import
- [ ] 不使用 hutool
- [ ] 循环拼接用 StringBuilder
- [ ] 响应信息做 XSS 防护

## 异常处理
- [ ] 使用 BizException 统一封装
- [ ] 无 e.printStackTrace()
- [ ] 异常重抛不额外 log

## 安全性
- [ ] 方法不返回 null
- [ ] 字符串比较用 ObjectUtils
- [ ] 安全场景用 SecureRandom
- [ ] 敏感信息加密或脱敏
- [ ] Redis 缓存配置有效期
- [ ] 禁止缓存 > 1MB 数据
- [ ] 缓存 Key 有唯一标识

## 日志输出
- [ ] 日志级别正确
- [ ] 日志信息准确精简
- [ ] 复杂业务有 debug 日志

## 接口定义
- [ ] URL 全小写、用 `-` 连接
- [ ] 使用 GET/POST
- [ ] 参数无冗余
- [ ] 删除/修改操作带 rec_version

## 数据库
- [ ] 表有 REC_VERSION、REC_CREATE_TIME、REC_LAST_UPDATE_TIME
- [ ] 多操作开启事务
- [ ] 主键有业务含义
- [ ] mapper.xml 无条件不留 where

## 配置工具
- [ ] 使用 @ConfigurationProperties
- [ ] Stream 有关闭逻辑
- [ ] 使用构造器注入

## 其他
- [ ] 状态用字符串不用数字
- [ ] 关键节点有审计日志
- [ ] .gitignore 正确配置

---

> **版本**: v1.0
> **更新日期**: 2026-04-13
> **规则总数**: 50 条
