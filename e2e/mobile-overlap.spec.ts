import { test, expect } from '@playwright/test'

test.describe('mobile chrome overlap prevention', () => {
  test('burger button does not overlap main content heading', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/building')
    await page.waitForLoadState('networkidle')

    const burger = page.locator('button[aria-label="Open navigation menu"]')
    const heading = page.locator('main h1, main h2').first()

    await expect(burger).toBeVisible()
    await expect(heading).toBeVisible()

    const bBox = await burger.boundingBox()
    const hBox = await heading.boundingBox()

    expect(bBox).not.toBeNull()
    expect(hBox).not.toBeNull()

    if (bBox && hBox) {
      // Check 2D overlap: burger's visible rect must NOT intersect heading's visible rect
      const noOverlapX = bBox.x + bBox.width <= hBox.x || hBox.x + hBox.width <= bBox.x
      const noOverlapY = bBox.y + bBox.height <= hBox.y || hBox.y + hBox.height <= bBox.y
      expect(noOverlapX || noOverlapY).toBeTruthy()
    }
  })

  test('burger is inside mobile top bar, not floating separately', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/building')
    await page.waitForLoadState('networkidle')

    const burger = page.locator('button[aria-label="Open navigation menu"]')
    // The top bar has "BMC" text — find its parent
    const topBar = page.locator('div:has(> button[aria-label="Open navigation menu"]):not(:has(> nav))').first()

    await expect(burger).toBeVisible()
    await expect(topBar).toBeVisible()

    const bBox = await burger.boundingBox()
    const tBox = await topBar.boundingBox()

    expect(bBox).not.toBeNull()
    expect(tBox).not.toBeNull()

    if (bBox && tBox) {
      // Burger must be fully contained within the top bar
      expect(bBox.x).toBeGreaterThanOrEqual(tBox.x)
      expect(bBox.y).toBeGreaterThanOrEqual(tBox.y)
      expect(bBox.x + bBox.width).toBeLessThanOrEqual(tBox.x + tBox.width)
      expect(bBox.y + bBox.height).toBeLessThanOrEqual(tBox.y + tBox.height)
    }
  })

  test('content area starts below the mobile top bar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/building')
    await page.waitForLoadState('networkidle')

    const topBar = page.locator('div:has(> button[aria-label="Open navigation menu"]):not(:has(> nav))').first()
    const content = page.locator('main > div:last-child').first()

    await expect(topBar).toBeVisible()
    await expect(content).toBeVisible()

    const tBox = await topBar.boundingBox()
    const cBox = await content.boundingBox()

    expect(tBox).not.toBeNull()
    expect(cBox).not.toBeNull()

    if (tBox && cBox) {
      // Content area must start below the top bar (no vertical overlap)
      expect(cBox.y).toBeGreaterThanOrEqual(tBox.y + tBox.height - 4) // allow 4px fudge
    }
  })

  test('mobile drawer opens with visible overlay', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/building')
    await page.waitForLoadState('networkidle')

    // Open the mobile menu
    await page.locator('button[aria-label="Open navigation menu"]').click()

    // Overlay: the div.bg-black/50 — select by role=none or the fixed inset-0
    const overlay = page.locator('div.fixed.inset-0').first()
    await expect(overlay).toBeVisible()

    // Drawer links should be visible — target the fixed (off-canvas) aside
    const drawerLink = page.locator('aside.fixed a:has-text("Building")').first()
    await expect(drawerLink).toBeVisible()
  })
})
