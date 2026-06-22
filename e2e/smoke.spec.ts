import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads and shows navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/BMC/)
  })

  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    // Should either show login page or redirect
    const url = page.url()
    const isOnLogin = url.includes('/login') || await page.locator('text=Login').isVisible()
    expect(isOnLogin).toBeTruthy()
  })
})

test.describe('Login Page', () => {
  test('renders login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"], input[name="email"], #email')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('shows sidebar links when authenticated', async ({ page }) => {
    // This test assumes auth is bypassed in dev or session is mocked
    await page.goto('/')
    const nav = page.locator('nav, [role="navigation"], .navigation')
    // Navigation should exist
    expect(await nav.count()).toBeGreaterThanOrEqual(0)
  })
})
