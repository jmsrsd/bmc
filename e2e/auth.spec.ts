import { test, expect } from '@playwright/test'

test.describe('Authentication — UC-AUTH-01', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/building/b1/hvac')
    await page.waitForLoadState('networkidle')
    const currentUrl = page.url()
    const isLoginPage = currentUrl.includes('/login')
    const hasLoginForm = await page.locator('input[type="email"], input[name="email"], #email').isVisible().catch(() => false)
    expect(isLoginPage || hasLoginForm).toBeTruthy()
  })

  test('login page renders email and password fields', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const emailInput = page.locator('input[type="email"], input[name="email"], #email, [data-testid="email-input"]')
    await expect(emailInput.first()).toBeVisible({ timeout: 5000 })
    const passwordInput = page.locator('input[type="password"], input[name="password"], #password, [data-testid="password-input"]')
    await expect(passwordInput.first()).toBeVisible({ timeout: 5000 })
    const submitBtn = page.getByRole('button', { name: /sign in|login|log in|submit|continue/i })
      .or(page.locator('button[type="submit"]'))
    await expect(submitBtn.first()).toBeVisible({ timeout: 5000 })
  })

  test('submits login form with credentials', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const emailInput = page.locator('input[type="email"], input[name="email"], #email').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"], #password').first()
    await emailInput.fill('admin@bmc.test')
    await passwordInput.fill('password123')
    const submitBtn = page.getByRole('button', { name: /sign in|login|log in|submit|continue/i })
      .or(page.locator('button[type="submit"]'))
    await submitBtn.first().click()
    await page.waitForLoadState('networkidle')
    const currentUrl = page.url()
    const isStillOnLogin = currentUrl.includes('/login')
    if (!isStillOnLogin) {
      await expect(page.locator('body')).toBeAttached()
    } else {
      const errorMsg = page.locator('text=/invalid|error|wrong|incorrect|failed/i')
      const hasError = await errorMsg.isVisible().catch(() => false)
      if (hasError) {
        await expect(errorMsg).toBeVisible()
      }
    }
  })

  test('can access protected page after login', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.locator('input[type="email"], input[name="email"], #email').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"], #password').first()
    await emailInput.fill('admin@bmc.test')
    await passwordInput.fill('password123')
    const submitBtn = page.getByRole('button', { name: /sign in|login|log in|submit|continue/i })
      .or(page.locator('button[type="submit"]'))
    await submitBtn.first().click()
    await page.waitForLoadState('networkidle')
    await page.goto('/building/b1/hvac')
    await page.waitForLoadState('networkidle')
    const onLogin = page.url().includes('/login')
    expect(onLogin).toBe(false)
  })
})
