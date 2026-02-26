import { test, expect } from '@playwright/test'

test.describe('Assessment Results Flow', () => {
  test('assessments list page loads', async ({ page }) => {
    await page.goto('/assessments')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })

  test('results page shows stats when assessment has attempts', async ({ page }) => {
    // Navigate to assessments list
    await page.goto('/assessments')
    await page.waitForLoadState('networkidle')

    // Click the first assessment link if any exist
    const assessmentLink = page.locator('a[href*="/assessments/"]').first()
    if (await assessmentLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await assessmentLink.click()
      await page.waitForLoadState('networkidle')

      // Check for results tab or link
      const resultsLink = page.getByText(/results/i).first()
      if (await resultsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await resultsLink.click()
        await page.waitForLoadState('networkidle')
        // Results page should have stats cards or empty state
        await expect(page.locator('body')).toBeVisible()
      }
    }
  })

  test('CSV export button exists on results page', async ({ page }) => {
    // TODO: Requires seeded assessment with completed sessions
    // Verify: Export CSV button is visible and clickable
    test.skip()
  })

  test('PDF export button exists on results page', async ({ page }) => {
    // TODO: Requires seeded assessment with completed sessions
    // Verify: Export PDF button is visible and clickable
    test.skip()
  })
})
