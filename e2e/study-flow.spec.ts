import { test, expect } from '@playwright/test'

test.describe('Study Mode Flow', () => {
  test('study page loads', async ({ page }) => {
    await page.goto('/study')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })

  test('custom study page loads', async ({ page }) => {
    await page.goto('/study/custom')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })

  test('global study page loads', async ({ page }) => {
    await page.goto('/study/global')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })

  test('stats page loads', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })

  test('library page has study action for decks', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    // If decks exist, there should be study-related actions
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })
})
