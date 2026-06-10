# 全局错误码规范

> 所有接口的错误响应必须使用本文档定义的 code 值。
> 前端根据 code 映射用户可读文案，后端抛出 `BizException` 时引用对应枚举。

---

## 成功或警告

| code | 含义 | HTTP Status |
|------|----|-------------|
| 0    | 成功 | 200 |
| 9    | 警告 | 200 |

---

## 后端成功或警告枚举定义

```java
public enum CacpResultCodeMessage implements ResultCodeMessage {
    SUCCESS("0", "success"),
    WARNING("9", "warning");

    private final String code;
    private final String message;

    private CacpResultCodeMessage(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return this.code;
    }

    public String getMessage() {
        return this.message;
    }
}
```

## 业务异常

| code | 含义         | HTTP Status | 前端文案         |
|------|------------|-------------|--------------|
| NOT_LOGIN | 未登录        | 401         | 未登录，请先登录      |
| BAD_REQUEST | 接口异常       | 401         | 接口异常，请重试       |
| CACP_CORE_NOT_LOG_IN | 用户没有登录     | 500         | 用户没有登录       |
| CACP_CORE_NO_PERMISSION | 用户没有权限使用该功能 | 500         | 用户没有权限使用该功能  |
| CACP_CORE_HTTP_REQUEST_FAILURE | HTTP请求失败   | 500         | HTTP请求失败     |
| CACP_CORE_COMMON_ERROR | 通用异常       | 500         | 通用异常         |
| CACP_CORE_USER_EMPTY_ERROR | 用户信息为空     | 500         | 用户信息为空       |
| CACP_CORE_COMMUNICATION_ERROR | 通讯异常       | 500         | 通讯异常         |
| CACP_CORE_AUDIT_FAIL | 审计日志失败     | 500         | 审计日志失败，{0}   |
| CACP_CORE_SYSTEM_EXCEPTION | 系统异常       | 500         | 系统异常，{0}     |
| CACP_CORE_UNKNOWN_ERROR | 未知异常       | 500         | 未知异常         |
| CACP_CORE_SECURITY_ERROR | 安全处理失败     | 500         | 安全处理失败，{0}   |
| CACP_CORE_COMPRESS_ERROR | 压缩处理失败     | 500         | 压缩处理失败，{0}   |
| CACP_CORE_HGID_ERROR | HGID生成失败   | 500         | HGID生成失败，{0} |
| CACP_CORE_ARGUMENT_ERROR | 参数错误       | 400         | 参数异常，{0}     |


---

## 后端业务异常枚举定义

```java
public enum ResultCodeMessage {
    NOT_LOGIN("NOT_LOGIN", "未登录，请先登录"),
    BAD_REQUEST("BAD_REQUEST", "接口异常，请重试");

    final String code;
    final String message;

    ResultCodeMessage(String code, String message) {
        this.code = code;
        this.message = message;
    }
}

public enum CacpExceptionCodeMessage implements ExceptionCodeMessage {
    NOT_LOG_IN("CACP_CORE_NOT_LOG_IN", "用户没有登录"),
    NO_PERMISSION("CACP_CORE_NO_PERMISSION", "用户没有权限使用该功能"),
    REQUEST_FAILURE("CACP_CORE_HTTP_REQUEST_FAILURE", "HTTP请求失败"),
    COMMON_ERROR("CACP_CORE_COMMON_ERROR", "通用异常"),
    AUTH_EMPTY_ERROR("CACP_CORE_USER_EMPTY_ERROR", "用户信息为空"),
    COMMUNICATION_ERROR("CACP_CORE_COMMUNICATION_ERROR", "通讯异常"),
    AUDIT_FAIL("CACP_CORE_AUDIT_FAIL", "审计日志失败，{0}"),
    SYSTEM_ERROR("CACP_CORE_SYSTEM_EXCEPTION", "系统异常，{0}"),
    UNKNOWN_ERROR("CACP_CORE_UNKNOWN_ERROR", "未知异常"),
    SECURITY_ERROR("CACP_CORE_SECURITY_ERROR", "安全处理失败，{0}"),
    COMPRESS_ERROR("CACP_CORE_COMPRESS_ERROR", "压缩处理失败，{0}"),
    HGID_ERROR("CACP_CORE_HGID_ERROR", "HGID生成失败，{0}"),
    ARGUMENT_ERROR("CACP_CORE_ARGUMENT_ERROR", "参数异常，{0}");

    private final String code;
    private final String message;

    private CacpExceptionCodeMessage(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return this.code;
    }

    public String getMessage() {
        return this.message;
    }
}
```

---

## 前端错误码映射

```typescript
// src/utils/errorMessage.ts
const errorMap: Record<number, string> = {
  20001: '请先登录',
  20002: '登录已过期，请重新登录',
  20003: '身份验证失败，请重新登录',
  20004: '您没有权限执行此操作',
  20005: '账号已被禁用，请联系管理员',
  30001: '请求参数不完整',
  30002: '参数格式不正确',
  40001: '数据不存在或已被删除',
  40002: '数据已存在，请勿重复提交',
  40005: '操作过于频繁，请稍后再试',
  41001: '用户名或密码错误',
  41002: '验证码不正确',
  41003: '验证码已过期，请重新获取',
  41004: '该手机号已注册，请直接登录',
  41005: '用户不存在',
  50001: '短信发送失败，请稍后重试',
  50003: '文件上传失败，请重试',
}

export const getErrorMessage = (code: number): string =>
  errorMap[code] ?? '操作失败，请稍后重试'
```

---

## 新增模块错误码规则

- 新模块按 `41000` 步进分配段位，如：订单 `42000`、商品 `43000`
- 每个模块内部从 `x1001` 开始递增
- 新增后同步更新：本文件 + 后端 `ErrorCode` 枚举 + 前端 `errorMessage.ts`
