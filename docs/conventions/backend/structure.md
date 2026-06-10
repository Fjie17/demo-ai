# 后端目录结构规范

> 所有后端技能执行前必须读取本文件，以此为准确定文件生成路径。

---

## 目录结构及职责说明

```
/backend-server/service/
├── sql/              # SQL 脚本目录：存放数据库建表脚本、初始化数据脚本等 SQL 文件
├── src/main/java/cn/exam/
│   ├── bean/         # Bean 属性描述类目录：包含 JavaBean 属性描述相关的工具类
│   ├── config/       # 配置类目录：包含 Spring Boot 配置类，如 MyBatis Plus 配置等
│   ├── constant/     # 常量类目录：包含项目中用到的常量定义（如认证结果码消息等）
│   ├── controller/   # 控制器层：负责处理 HTTP 请求，定义 API 接口路由
│   ├── dao/          # 数据持久层 (Data Access Object)：负责与数据库交互（如 MyBatis Plus Mapper 接口）
│   ├── parameter/    # 参数类目录：定义请求参数类，查询类以 Query 结尾，新增编辑类以 Form 结尾
│   ├── pojo/         # 数据传输类目录：定义数据库表对应的 POJO 实体类
│   ├── proxy/        # 代理层类目录：用于调用其他服务接口
│   ├── query/        # 查询类目录：定义分页查询基类等通用查询对象
│   ├── service/      # 服务接口层：定义业务逻辑的契约/接口
│   │   └── impl/     # 服务实现层：具体的业务逻辑代码实现
│   ├── utils/        # 工具类目录：包含项目中用到的工具类（如 Bean 拷贝、类操作、字段操作、分页方法、URL 匹配等）
│   └── viewobject/   # 视图对象目录：定义响应参数类，以 Vo 结尾，用于响应给前端
└── src/main/resources/
├── mapper/       # MyBatis XML 映射文件目录：存放 DAO 层对应的 SQL 映射 XML 文件
│   └── common/   # 通用 Mapper 目录：存放通用的 MyBatis XML 映射文件
└── application.yml  # 应用配置文件：Spring Boot 应用配置（数据库连接、服务端口等）

```
