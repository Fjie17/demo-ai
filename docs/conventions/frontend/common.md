#### **技术栈**

本项目采用以下核心技术栈进行开发：

- **框架**: Vue 3
- **UI 组件库**: Element Plus
- **语言**: TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 请求**: Axios
- **样式**: Less

#### **目录与文件规范**

**功能模块目录 (`views`)**

- 所有的功能模块页面文件均需在 `frontend-client/web/src/views` 目录下创建。

**示例文件目录 (`frontend-client/web/src/views/demo`)**

- `frontend-client/web/src/views/demo` 目录下的文件仅为示例参考。
- **禁止**在该目录下创建任何新文件。
- **禁止**修改该目录下已有的任何文件。

#### **接口管理**

**接口目录**

- 前端接口统一在 `frontend-client/web/src/api` 目录下进行管理和维护。
- 所有模块生成的接口文件需在 `/docs/api/<模块>.yaml` 中定义对应的接口文档,格式参考`/docs/api/demo.yaml`。

**请求与响应处理**

- 接口请求后，需根据 `res.code` 的值判断请求结果。
- 当 `res.code` 等于 `SuccessResultCode` 时，表示请求成功，可处理返回数据。
- 否则，应根据错误码处理相应的错误信息。
- 具体实现请严格参考 `demo` 中的接口请求示例进行修改。

#### **路由管理**

- 所有新增的路由必须在 `frontend-client/web/src/router/app-routers.ts` 中进行配置。并且在页面左侧导航栏中添加对应的路由项。
