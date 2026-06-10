---
name: srv-controller
description: 当生成Controller代码时触发
---

## 执行前必读文件

```
docs/conventions/backend/structure.md  ← 后端目录结构，确定文件路径
docs/api/<对应模块>.yaml          ← 接口契约，提取接口定义
backend-server/service/src/main/java/cn/exam/service  ← Service层接口
docs/conventions/backend/cacp-code-check.md  ← 后端代码扫描规则
docs/conventions/backend/cacp-code-rule.md  ← 后端代码规范
docs/conventions/backend/yp-project-code-rule.md  ← 后端代码规范
docs/conventions/error-codes.md  ← 全局错误码
```

---

## 执行步骤

### Step 1 — 提取接口定义

从 `docs/api/<对应模块>.yaml` 中提取：
- 接口路径（path）
- HTTP方法（get/post/put/delete）
- 具体方法上的路径使用 operationId 作为路径,如果是驼峰需要转成连字符,如 `getRankPage` → `/get-rank-page`
- 请求参数（query/path/body）
- 响应结构

### Step 2 — 生成Controller类

**路径**：`backend-server/service/src/main/java/cn/exam/controller/`
**命名规范**：功能名 + Controller，如 `RankController.java`
**方法名**：与YAML中的operationId保持一致，如 `getRankPage`
**方法路径名**：与YAML中的path保持一致,如 `/query`
**分页返回实体规范**：需要使用github里的分页插件(路径：`com.github.pagehelper.PageInfo`),PageInfo<功能模块Vo> ，如 `PageInfo<RankVo>`
**返回规范**：需要使用Result (路径：`cn.cacp.sdks.core.result`)，分页是 `Result<PageInfo<RankVo>>`，其他是 `Result<RankVo>`,如果不需要返回具体对象,则直接返回 `Result<String>`,内容为操作结果描述,如 `Result.success("操作成功")`
**异常处理**：需要在Controller中捕获所有异常,并返回统一的错误码和错误信息,如 `Result.fail(CacpResultCodeMessage.WARNING, "错误描述")`
**方法入参校验**: 所有 Controller 方法入参必须加 `@Valid` 注解：如 `@Valid @RequestBody RankQuery query`
**方法入参规范**: 所有 Controller 方法入参必须使用具体的对象参数,禁止用 Map 类型参数或者List<Map>,如 `@RequestBody Map<String, Object> map`,如果没有合适的对象参数,则自行创建,如 `RankDeleteForm`

**代码格式**：
```java
import cn.exam.parameter.RankQuery;
import cn.exam.parameter.RankForm;
import cn.exam.service.RankService;
import cn.exam.viewobject.RankVo;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.web.bind.annotation.*;

/**
 * 排行榜控制器
 */
@RestController
@RequestMapping("/api/v1/rank")
@RequiredArgsConstructor
public class RankController {

    private final RankService rankService;

    /**
     * 分页获取排行榜列表
     * @param query 查询参数
     * @return 分页结果
     */
    @PostMapping("/query")
    public Result<PageInfo<RankVo>> getRankPage(@Valid @RequestBody RankQuery query) {
        PageInfo<RankVo> pageInfo = rankService.getRankPage(query);
        return Result.success(pageInfo);
    }

    /**
     * 创建排行榜
     * @param form 创建参数
     * @return 操作结果
     */
    @PostMapping("/create")
    public Map<String, Object> createRank(@Valid @RequestBody RankForm form) {
        boolean success = rankService.createRank(form);
        return success ? Result.success("创建成功") : Result.fail(CacpResultCodeMessage.WARNING, "创建失败");
    }

    /**
     * 更新排行榜
     * @param form 更新参数
     * @return 操作结果
     */
    @PostMapping("/update")
    public Map<String, Object> updateRank(@Valid @RequestBody RankForm form) {
        boolean success = rankService.updateRank(form);
        return success ? Result.success("更新成功") : Result.fail(CacpResultCodeMessage.WARNING, "更新失败");
    }

    /**
     * 删除排行榜
     * @param form 删除参数
     * @return 操作结果
     */
    @PostMapping("/delete")
    public Map<String, Object> deleteRank(@Valid @RequestBody RankDeleteForm form) {
        boolean success = rankService.deleteRank(form.getRankId());
        return success ? Result.success("删除成功") : Result.fail(CacpResultCodeMessage.WARNING, "删除失败");
    }
}
```

---

## 命名与格式规范

**包路径**：必须严格使用 `cn.exam.controller`

**命名规则**：
- Controller类：功能名 + Controller，如 `RankController.java`
- 方法名：与YAML中的operationId保持一致，如 `getRankPage`
- 路径名：与YAML中的path保持一致,如果是驼峰需要转成连字符,如 `/get-rank-page`

**注解要求**：
- 类必须使用 `@RestController` 注解
- 类必须使用 `@RequestMapping` 注解指定基础路径
- 方法必须使用对应的HTTP方法注解（`@GetMapping`/`@PostMapping`/`@PutMapping`/`@DeleteMapping`）
- 路径参数使用 `@PathVariable` 注解
- 请求参数使用 `@RequestParam` 注解
- 请求体使用 `@RequestBody` 注解
- 注入使用 `@RequiredArgsConstructor` 注解
- 如需获取当前登录用户信息,可以使用 `@LogonUser` 注解

**响应格式**：
- 必须返回统一的Result格式：`Result<数据类型>`
- 状态码使用全局错误码规范
- 响应结构必须与YAML中的定义一致

---

## 禁止事项

- 禁止修改现有文件，只允许新增
- 禁止生成不符合规范的命名
- 禁止忽略参数校验
- 禁止在Controller中处理业务逻辑（必须通过Service层）
- 禁止返回不符合规范的响应格式
- 禁止使用硬编码的错误信息
- 禁止 Controller 方法入参缺少 `@Valid` 注解，缺少会导致参数校验不生效，空参数请求返回 500
- 禁止 Request 的必填字段裸写无注解，必须根据 YAML required 字段逐一添加对应校验注解
- 禁止 Controller 方法入参使用 Map 类型参数或者List<Map>,必须使用具体的对象参数

---

## 完成后自查

- [ ] 所有文件路径正确
- [ ] 所有文件都要包含正确包路径 `package cn.exam.xxx;`
- [ ] 命名符合规范
- [ ] 注解使用正确
- [ ] 所有方法都有中文注释
- [ ] 接口路径与YAML中的定义一致
- [ ] HTTP方法与YAML中的定义一致
- [ ] 方法名与YAML中的operationId一致
- [ ] 参数绑定正确
- [ ] 依赖注入正确
- [ ] 响应格式符合规范
- [ ] 没有生成多余的代码
- [ ] 所有 Controller 方法入参已加 `@Valid`
- [ ] 所有 Request 的必填字段已根据 YAML required 添加校验注解
- [ ] 所有 Controller 方法入参已使用具体的对象参数
