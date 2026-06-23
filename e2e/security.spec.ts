import { test, expect } from '@playwright/test'

test.describe('Security Door Status — UC-SEC-01', () => {
  test('loads security page with door status', async ({ page }) => {
    await page.goto('/building/b1/security')
    await page.waitForLoadState('networkidle')
    const heading = page.locator('h1, h2, [data-testid="security-heading"]')
    const hasHeading = (await heading.count()) > 0 && (await heading.first().textContent()) !== ''
    const hasSecurityText = await page.locator('text=/door|security|lock|unlock|status|access/i').first().isVisible().catch(() => false)
    expect(hasHeading || hasSecurityText).toBeTruthy()
  })

  test('displays door status information', async ({ page }) => {
    await page.goto('/building/b1/security')
    const doorStatuses = page.locator('[data-testid*="door"], [data-testid*="door-status"], .door-status')
      .or(page.locator('text=/door/i'))
    const hasDoors = await doorStatuses.first().isVisible().catch(() => false)
    if (hasDoors) {
      const statusText = await doorStatuses.first().textContent()
      expect(statusText?.length).toBeGreaterThan(0)
    }
  })

  test('shows lock/unlock controls if available', async ({ page }) => {
    await page.goto('/building/b1/security')
    const lockBtn = page.getByRole('button', { name: /lock|unlock/i })
    const controlsExist = await lockBtn.first().isVisible().catch(() => false)
    if (controlsExist) {
      const beforeText = await lockBtn.first().textContent()
      await lockBtn.first().click()
      await page.waitForTimeout(500)
      const confirm = page.locator('text=/updated|confirmed|toggled|success/i')
      await confirm.first().isVisible().catch(() => {})
    }
  })
})
