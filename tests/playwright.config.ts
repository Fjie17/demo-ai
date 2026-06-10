import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })
dotenv.config({ path: '.env.test.local', override: true })

export default defineConfig({
  testDir: '.',
  testMatch: ['**/*.spec.ts'],

  timeout: 30_000,
  expect: { timeout: 8_000 },

  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  use: {
    testIdAttribute: 'data-qa',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // ── 接口测试 ──────────────────────────────────────
    {
      name: 'api-tests',
      testMatch: '**/api/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    // ── E2E：登录态准备（其他 e2e project 的前置依赖）──
    {
      name: 'e2e-setup',
      testMatch: '**/e2e/auth.setup.ts',   // 登录并保存 storageState 的脚本
    },

    // ── E2E：需要登录的页面 ────────────────────────────
    {
      name: 'e2e-auth',
      testMatch: '**/e2e/**/*.e2e.spec.ts',
      dependencies: ['e2e-setup'],          // 先跑 setup 再跑用例
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.APP_URL ?? 'http://localhost:8080/qyz',
        storageState: 'tests/.auth/user.json',  // setup 保存的登录态
        video: 'retain-on-failure',
      },
    },

    // ── E2E：不需要登录的页面（登录页、公开页）─────────
    {
      name: 'e2e-public',
      testMatch: '**/e2e/**/*.e2e.spec.ts',  // 文件名加 .public 区分
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.APP_URL ?? 'http://localhost:8080/qyz',
        video: 'retain-on-failure',
      },
    },
  ],
})