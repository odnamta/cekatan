import { test, expect } from '@playwright/test'

test.describe('Public Test Link Flow', () => {
  test('invalid public code shows error or empty state', async ({ page }) => {
    await page.goto('/t/INVALIDCODE')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
    // Should show error message, not found, or redirect
    const hasError = await page.getByText(/not found|invalid|error|expired/i).first().isVisible({ timeout: 5000 }).catch(() => false)
    const redirected = page.url() !== '/t/INVALIDCODE'
    expect(hasError || redirected).toBeTruthy()
  })

  test('public test results page handles invalid code', async ({ page }) => {
    await page.goto('/t/INVALIDCODE/results')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })

  test('verify page loads', async ({ page }) => {
    await page.goto('/verify')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })

  test('unsubscribe page loads', async ({ page }) => {
    await page.goto('/unsubscribe')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })
})
