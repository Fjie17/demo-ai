# yq项目后端代码规范
---

# 分页
查询实体继承BasePageQuery，使用自定义MyPageMethod进行分页
'''
// private Integer pageNum; 页码
// private Integer pageSize; 每页条数
// private String order; "排序asc desc" 支持多字段排序，多字段用逗号分割
// private String orderField; 排序字段，支持多字段排序，多字段用逗号分割

@Data
class UserQuery extends BasePageQuery {
}

@PostMapping("/get-user-list")
@ApiOperation("getList")
public Result<PageInfo> getList(@RequestBody UserQuery userQuery) {
    Page<User> userInfos = MyPageMethod.startPage(userQuery).doSelectPage(() -> userMapper.selectList(null));
    PageInfo<UserVo> pageInfo = userInfos.toPageInfo(user -> BeanCopyUtils.cloneFrom(user, UserVo.class));

    return Result.success(pageInfo);
}
'''

# 登录用户
可以通过方法中添加注解@YqLogonUser LogonIdentity logonIdentity获取登录用户信息
也可以通过LogonIdentityContextHolder.currentLogonIdentity()进行获取。
建议在Controller方法中获取@YqLogonUser LogonIdentity logonIdentity 向下透传。
'''
// 登录用户
 @ApiOperation("查询yq用户信息")
@GetMapping(value = "/get-yq-logon-info")
public Result<LogonIdentity> getLogonYq(@YqLogonUser LogonIdentity logonIdentity) {
    // 登录用户guid
    return Result.success(logonIdentity);
}

@ApiOperation("查询cacp用户信息")
@GetMapping(value = "/get-cacp-logon-info")
public Result<CacpLogonUser> getLogonYq(@LogonUser CacpLogonUser cacpLogonUser) {
    return Result.success(cacpLogonUser);
}
'''

# 内部接口调用
'''
@FeignClient(name = "yq-datamanager-service", path = "/datamanager")
public interface DatamanagerProxy {

    @PostMapping("/api/manager/datasource/pager-list")
    Result<PageInfo<DatasourceVo>> pagerList(@RequestBody DatasourceQuery query);

    @PostMapping(value = "/api/manager/table/get-unadded-table-list")
    Result<PageInfo<DatagroupTableVo>> getUnaddedTableList(@RequestBody DatagroupTableQuery datagroupTableQuery);

    @PostMapping(value = "/api/manager/table/config-datagroup-table")
    Result<String> configDatagroupTable(@RequestBody DatagroupTableConfigForm datagroupTableConfigForm);


    @PostMapping(value = "/api/manager/field/get-data-tables")
    Result<PageInfo<DatagroupTableFieldVo>> getDataTables(@RequestBody DatagroupTableFieldsQuery datagroupTableConfigForm);
}
'''

# 数据表
## 身份用户记录字段说明
大部分业务都是按照登录身份进行数据查询，部分业务需要按照用户进行查询，数据表在设计时使用USER_ID记录。
'''
`USER_ID` varchar(36)  DEFAULT NULL COMMENT '创建用户ID',
`CREATER_ID` varchar(36)  DEFAULT NULL COMMENT '创建操作员身份ID',
`CREATER_NAME` varchar(512)  DEFAULT NULL COMMENT '创建操作员名称',
`MODIFIER_ID` varchar(36)  DEFAULT NULL COMMENT '修改操作员身份ID',
`MODIFIER_NAME` varchar(512)  DEFAULT NULL COMMENT '修改操作员名称',
'''

## 主键声明
'''
// 不建议❌
@TableId(value = "PK_YQ_CCUP_ACCOUNT_BLACKLIST", type = IdType.AUTO)
private Long pkYqCcupAccountBlacklist;

// 建议
@TableId(value = "PK_YQ_CCUP_ACCOUNT_BLACKLIST", type = IdType.AUTO)
private Long accountBlacklistId;
'''

## 数据表和实体类对应关系
去掉公共部分
```
数据表：YQ_CCUP_ACCOUNT_BLACKLIST
实体类：AccountBlacklist
```

## 字符集
新版使用 utf8mb4_0900_ai_ci

# 类实例获取工具
'''
cn.cacp.sdks.core.context.SpringContextHolder

TablePermissionService tablePermissionService = SpringContextHolder.getBean(TablePermissionService.class);
'''

# 多线程问题
多线程存在用户信息透传失效问题。需要重新给并行线程绑定用户信息
'''
public List<TopicVo> topicListWithCount(Boolean isShow, String stationId){ // todo 有
	final List<TopicVo> topics = this.topicList(isShow, stationId);
	if(CollectionUtils.isNotEmpty(topics)) {
		// 1. 先获取主线程的 LogonIdentity
		LogonIdentity currentUser = LogonIdentityContextHolder.currentLogonIdentity();
		topics.parallelStream().forEach(topic -> {

			try {
				// 2. 并行流中手动传递上下文， 如果不重新绑定LogonIdentityContextHolder.currentLogonIdentity() 获取的用户信息为空。
				LogonIdentityContextHolder.set(currentUser);

				if (StringUtils.isNotEmpty(topic.getPid())) {
					Tuple3<String, Long, String> t = indexDocCountService.topicDocCount(topic.getPkYqSearchClass(), stationId);
					topic.setPrimaryTableId(t.v1());
					topic.setTotal(t.v2());
					topic.setDbId(t.v3());
				}
			} finally {
				// 3. 用完后清除，避免内存泄漏
				LogonIdentityContextHolder.shutdown();
			}
		});
	}

	return topics;
}
'''


