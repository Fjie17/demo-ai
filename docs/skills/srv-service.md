---
name: srv-service
description: 当生成Service及其实现类代码时触发
---

## 执行前必读文件

```
docs/conventions/backend/structure.md  ← 后端目录结构，确定文件路径
docs/api/<对应模块>.yaml          ← 接口契约，提取业务逻辑
docs/db/<对应表名>.sql               ← 数据库结构参考
backend-server/service/src/main/java/cn/exam/dao  ← DAO层接口
docs/conventions/backend/cacp-code-check.md  ← 后端代码扫描规则
docs/conventions/backend/cacp-code-rule.md  ← 后端代码规范
docs/conventions/backend/yp-project-code-rule.md  ← 后端代码规范
```

---

## 执行步骤

### Step 1 — 提取业务逻辑

从 `docs/api/<对应模块>.yaml` 中提取：
- 所有接口的operationId
- 请求参数和响应结构
- 业务操作类型（查询、新增、更新、删除）

### Step 2 — 生成Service接口

**路径**：`backend-server/service/src/main/java/cn/exam/service/`
**命名规范**：功能名 + Service，如 `RankService.java`
**分页返回实体规范**：需要使用github里的分页插件(路径：`com.github.pagehelper.PageInfo`),PageInfo<功能模块Vo> ，如 `PageInfo<RankVo>`


**代码格式**：
```java
import cn.exam.parameter.RankQuery;
import cn.exam.parameter.RankForm;
import cn.exam.viewobject.RankVo;
import com.github.pagehelper.PageInfo;

/**
 * 排行榜服务接口
 */
public interface RankService {
    /**
     * 分页获取排行榜列表
     * @param query 查询参数
     * @return 分页结果
     */
    PageInfo<RankVo> getRankPage(RankQuery query);

    /**
     * 创建排行榜
     * @param form 创建参数
     * @return 是否成功
     */
    boolean createRank(RankForm form);

    /**
     * 更新排行榜
     * @param form 更新参数
     * @return 是否成功
     */
    boolean updateRank(RankForm form);

    /**
     * 删除排行榜
     * @param id 排行榜ID
     * @return 是否成功
     */
    boolean deleteRank(String id);
}
```

### Step 3 — 生成Service实现类

**路径**：`backend-server/service/src/main/java/cn/exam/service/impl/`
**命名规范**：Service接口名 + Impl，如 `RankServiceImpl.java`
**分页返回实体规范**：需要使用github里的分页插件(路径：`com.github.pagehelper.PageInfo`),PageInfo<功能模块Vo> ，如 `PageInfo<RankVo>`
**分页逻辑实现规范**：需要使用自定义的分页组件 `MyPageMethod`,并在Service实现类中调用该组件。
**对象属性复制规范**：需要使用自定义的分页组件 `BeanCopyUtils`,并在Service实现类中调用该组件。
**日期类型处理规范**：需要使用Java 8的LocalDateTime类型，避免使用Date类型。
**删除规范**：需要使用逻辑删除，即更新删除标志字段，而不是物理删除。
**抛出异常规范**：使用 throw new BizException 抛出异常,不能允许抛出此类之外的其他异常,详细参考 `docs/conventions/backend/cacp-code-rule.md` 里的 `# 三、异常处理`,第24,25,26条要求



**代码格式**：
```java
import cn.exam.dao.RankPOMapper;
import cn.exam.parameter.RankQuery;
import cn.exam.parameter.RankForm;
import cn.exam.pojo.RankPO;
import cn.exam.service.RankService;
import cn.exam.utils.BeanCopyUtils;
import cn.exam.viewobject.RankVo;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.github.pagehelper.PageInfo;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Date;

/**
 * 排行榜服务实现类
 */
@Service
@RequiredArgsConstructor
public class RankServiceImpl implements RankService {

    private final RankMapper rankMapper;

    @Override
    public PageInfo<RankVo> getRankPage(RankQuery query) {
        LambdaQueryWrapper<Rank> wrapper = new LambdaQueryWrapper<>();
        // 添加查询条件
        wrapper.eq(Rank::getDeleteFlag, 0)
                .like(StringUtils.isNotBlank(query.getName()), Rank::getName, query.getName())
                .orderByDesc(Rank::getRecCreateTime);
        Page<Rank> rankInfos = MyPageMethod.startPage(query).doSelectPage(() -> rankMapper.selectList(wrapper));
        // 转换为VO
        PageInfo<RankVo> pageInfo = rankInfos.toPageInfo(rank -> BeanCopyUtils.cloneFrom(rank, RankVo.class));
        return pageInfo;
    }

    @Override
    public boolean createRank(RankForm form) {
        Rank rank = BeanCopyUtils.cloneFrom(form, Rank.class);
        rank.setRecVersion(0);
        rank.setRecCreateTime(LocalDateTime.now());
        rank.setRecLastUpdateTime(LocalDateTime.now());
        rank.setDeleteFlag(0);
        return rankMapper.insert(rank) > 0;
    }

    @Override
    public boolean updateRank(RankForm form) {
        Rank oldRank = rankMapper.selectById(form.getRankId());
        if (oldRank == null) {
            return false;
        }
        oldRank.setName(form.getName());
        oldRank.setIcon(form.getIcon());
        oldRank.setMinScore(form.getMinScore());
        oldRank.setMaxScore(form.getMaxScore());
        oldRank.setRecVersion(oldRank.getRecVersion() + 1);
        oldRank.setRecLastUpdateTime(LocalDateTime.now());
        return rankMapper.updateById(oldRank) > 0;
    }

    @Override
    public boolean deleteRank(String id) {
        Rank oldRank = rankMapper.selectById(id);
        if (oldRank == null) {
            return false;
        }
        oldRank.setDeleteFlag(1);
        oldRank.setRecLastUpdateTime(LocalDateTime.now());
        return rankMapper.updateById(oldRank) > 0;
    }
}
```

---

## 命名与格式规范

**包路径**：必须严格使用 `cn.exam.service` 和 `cn.exam.service.impl`

**命名规则**：
- Service接口：功能名 + Service，如 `RankService.java`
- Service实现类：Service接口名 + Impl，如 `RankServiceImpl.java`

**注解要求**：
- 实现类必须使用 `@Service` 注解
- 注入在类上面使用 `@RequiredArgsConstructor` 注解
- 所有方法必须有中文注释

**业务逻辑要求**：
- 参数校验在Service层完成
- 异常处理在Service层抛出
- 事务管理使用 `@Transactional` 注解（需要时）

---

## 禁止事项

- 禁止修改现有文件，只允许新增
- 禁止生成不符合规范的命名
- 禁止忽略参数校验
- 禁止在Service中直接操作数据库（必须通过DAO层）
- 禁止在Service中处理HTTP请求/响应`
- 禁止抛出非BizException异常

---

## 完成后自查

- [ ] 所有文件路径正确
- [ ] 所有文件都要包含正确包路径 `package cn.exam.xxx;`
- [ ] 命名符合规范
- [ ] 注解使用正确
- [ ] 所有接口和方法都有中文注释
- [ ] Service接口与YAML中的operationId对应
- [ ] 实现类正确实现了所有接口方法
- [ ] 依赖注入正确
- [ ] 参数校验完整
- [ ] 数据转换正确（PO <-> VO/Form）
- [ ] 没有生成多余的代码
