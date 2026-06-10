#### **接口管理**

**接口目录**

- 前端接口统一在 `frontend-client/web/src/api` 目录下进行管理和维护。
- 所有模块生成的接口文件需在 `/docs/api/<模块>.yaml` 中定义对应的接口文档,格式参考`/docs/api/demo.yaml`。

### **示例rank.ts**
```typescript
import http from '@/utils/http'
import type { Rank, RankForm } from '@/types/rank'
import type { PageInfo, Result } from '@cacp/ui'
import type { AxiosResponse } from 'axios'

const { DEV } = import.meta.env
const contextPath = DEV ? '/mock/api/v1' : '/api/v1'

export async function getRankPage(params: { pageIndex: number; pageSize: number }) {
  const res: AxiosResponse<Result<PageInfo<Rank>>> = await http.get(`${contextPath}/rank`, { params })
  return res.data
}

export async function createRank(data: RankForm) {
  const res: AxiosResponse<Result<void>> = await http.post(`${contextPath}/rank`, data)
  return res.data
}

export async function updateRank(id: string, data: RankForm) {
  const res: AxiosResponse<Result<void>> = await http.put(`${contextPath}/rank/${id}`, data)
  return res.data
}

export async function deleteRank(id: string) {
  const res: AxiosResponse<Result<void>> = await http.delete(`${contextPath}/rank/${id}`)
  return res.data
}
```
