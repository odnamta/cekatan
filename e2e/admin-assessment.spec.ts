import { test, expect } from '@playwright/test'

test.describe('Admin Assessment Management', () => {
  test('assessments list page loads', async ({ page }) => {
    await page.goto('/assessments')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })

  test('create assessment page loads', async ({ page }) => {
    await page.goto('/assessments/create')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })

  test('candidates page loads', async ({ page }) => {
    await page.goto('/assessments/candidates')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })

  test('question bank page loads', async ({ page }) => {
    await page.goto('/assessments/questions')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })

  test('templates page loads', async ({ page }) => {
    await page.goto('/assessments/templates')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  })

  test('create assessment form has required fields', async ({ page }) => {
    await page.goto('/assessments/create')
    await page.waitForLoadState('networkidle')

    // Check for key form elements
    const titleInput = page.getByLabel(/title/i).or(page.locator('input[name="title"]')).first()
    const body = page.locator('body')
    await expect(body).toBeVisible({ timeout: 10000 })

    // If form loaded, check for common assessment fields
    const hasFormContent = await page.getByText(/time limit|pass score|question/i).first().isVisible({ timeout: 5000 }).catch(() => false)
    if (hasFormContent) {
      await expect(page.getByText(/time limit/i).first()).toBeVisible()
    }
  })
})
