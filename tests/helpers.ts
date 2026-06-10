/**
 * 测试公共工具（API + E2E 共用）
 * 包含：环境配置、类型定义、API 断言辅助、日志辅助、测试数据生成、E2E 页面操作封装
 *
 * 所有 spec 文件（API / E2E）只从本文件 import，禁止从其他 spec 文件 import，
 * 禁止在 spec 文件中重复定义本文件已导出的任何内容。
 */
import { test, expect, APIResponse, Page } from '@playwright/test'
import type { Locator } from '@playwright/test'

// ════════════════════════════════════════════════════════
// 环境变量
// ════════════════════════════════════════════════════════

/** 后端 API 根路径，API 测试使用 */
export const BASE_URL = process.env.BASE_URL ?? 'http://localhost:31002/exam'

/** 前端应用根路径，E2E 测试使用 */
export const APP_URL = process.env.APP_URL ?? 'http://localhost:8080/qyz'

// ════════════════════════════════════════════════════════
// 类型定义（API 测试）
// ════════════════════════════════════════════════════════

/**
 * 统一响应结构
 * - code 必须为 string，禁止 number
 * - 业务错误（HTTP 400/500）响应体中无 data 字段
 */
export interface BaseResponse<T = unknown> {
  code: string
  message: string
  data?: T | null
}

// ════════════════════════════════════════════════════════
// API 断言辅助
// ════════════════════════════════════════════════════════

/**
 * 断言接口调用成功
 * - HTTP 状态码必须为 200
 * - code 必须为 '0'，data 不为 null
 */
export function assertSuccess(res: APIResponse, body: BaseResponse<unknown>): void {
  expect(res.status()).toBe(200)
  expect(typeof body.code).toBe('string')
  expect(typeof body.message).toBe('string')
  expect(body).toHaveProperty('data')
  expect(body.code).toBe('0')
  expect(body.data).not.toBeNull()
}

/**
 * 断言分页接口调用成功
 * - 在 assertSuccess 基础上额外断言 list 非空数组
 */
export function assertPagedSuccess(res: APIResponse, body: BaseResponse<{ list: unknown[] }>): void {
  assertSuccess(res, body)
  expect(Array.isArray(body.data?.list)).toBe(true)
  expect(body.data!.list.length).toBeGreaterThan(0)
}

/**
 * 断言接口返回业务异常
 * - HTTP 状态码必须在 [400, 500] 中
 * - code 不为 '0'，message 不为空
 * - 禁止断言 body.data（错误响应体中无此字段）
 */
export function assertError(res: APIResponse, body: BaseResponse<never>): void {
  expect([400, 500]).toContain(res.status())
  expect(typeof body.code).toBe('string')
  expect(typeof body.message).toBe('string')
  expect(body.code).not.toBe('0')
  expect(body.message).toBeTruthy()
}

// ════════════════════════════════════════════════════════
// 日志辅助（API 测试）
// ════════════════════════════════════════════════════════

export function logRequest(tcId: string, data: unknown): void {
  console.log(`[${tcId}] 请求:`, JSON.stringify(data, null, 2))
}

export function logResponse(tcId: string, res: APIResponse, body: unknown): void {
  console.log(`[${tcId}] 状态:`, res.status())
  console.log(`[${tcId}] 响应:`, JSON.stringify(body, null, 2))
  test.info().annotations.push({ type: 'response', description: JSON.stringify(body, null, 2) })
}

// ════════════════════════════════════════════════════════
// 测试数据生成（API + E2E 共用）
// ════════════════════════════════════════════════════════

/**
 * 生成唯一且长度安全（≤10字符）的测试名称
 * - 前缀 __t 用于与业务数据隔离
 * - 禁止在函数外对返回值拼接任何后缀，否则会超出长度限制
 *
 * @example
 * const name = safeTestName('新增')   // "__t新增1234"（≤10字符）
 * // ❌ 错误：safeTestName('链路') + '_更新'  → 超长
 * // ✅ 正确：safeTestName('更新')            → 独立调用，传不同 base
 */
export function safeTestName(base = '测'): string {
  return `__t${base}${Date.now().toString().slice(-4)}`.slice(0, 10)
}

/**
 * 生成不易与存量数据冲突的积分区间
 * - 起点基于当前时间戳，固定在 900000+ 高位区
 * - 返回字段名与数据库字段一致：scoreMin / scoreMax
 *
 * @example
 * const { scoreMin, scoreMax } = safeRange()
 */
export function safeRange(): { scoreMin: number; scoreMax: number } {
  const base = 900000 + (Date.now() % 10000) * 10
  return { scoreMin: base, scoreMax: base + 9 }
}

// ════════════════════════════════════════════════════════
// E2E 页面操作封装
// 使用规则：
//   1. 所有 E2E spec 文件从本文件 import，禁止在 spec 中重复定义
//   2. 用例内只调用封装函数，禁止手写 .locator('input') 等内联操作
// ════════════════════════════════════════════════════════

/**
 * 填写输入框
 * - 自动判断 data-qa 元素是原生 input 还是 El 组件外层 div
 * - 原生 input：直接 fill；El 组件外层 div：找内部 input 再 fill
 */
export async function fillInput(page: Page, qaId: string, value: string): Promise<void> {
  const el = page.getByTestId(qaId)
  const tag = await el.evaluate((n: Element) => n.tagName.toLowerCase())
  tag === 'input' ? await el.fill(value) : await el.locator('input').fill(value)
}

/**
 * 点击按钮
 * - 自动判断 data-qa 元素是原生 button 还是 El 组件外层 div
 * - 原生 button：直接 click；El 组件外层 div：找内部 button 再 click
 */
export async function clickButton(page: Page, qaId: string): Promise<void> {
  const el = page.getByTestId(qaId)
  const tag = await el.evaluate((n: Element) => n.tagName.toLowerCase())
  tag === 'button' ? await el.click() : await el.locator('button').click()
}

/**
 * 选择下拉选项（el-select）
 */
export async function selectOption(page: Page, qaId: string, option: string): Promise<void> {
  await page.getByTestId(qaId).locator('.el-select__wrapper').click()
  await page.getByRole('option', { name: option }).click()
}

/**
 * 点击表格行内的操作链接（<a> 元素）
 *
 * 表格操作列是 <a> 链接，不是 <button>，必须用 getByRole('link')。
 * 必须先定位到具体行再调用本函数，禁止跨行用 nth() 全局查找。
 *
 * @example
 * const row = page.locator('.el-table__row').filter({ hasText: targetName })
 * await clickTableAction(page, row, '编辑')
 */
export async function clickTableAction(page: Page, rowLocator: Locator, actionName: string): Promise<void> {
  // el-link 渲染为无 href 的 <a>，ARIA role 为 generic 而非 link，
  // 因此不能用 getByRole('link')，必须用标签 + 文本过滤定位。
  await rowLocator.locator('a').filter({ hasText: actionName }).click()
}
