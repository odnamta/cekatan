import { test, expect } from '@playwright/test'

test.describe('Assessment Flow', () => {
  test('assessments page loads', async ({ page }) => {
    await page.goto('/assessments')
    await expect(page).toHaveURL(/\/assessments/)
  })

  test('IQ test assessment is visible in list', async ({ page }) => {
    await page.goto('/assessments')
    await expect(
      page.getByText('General Cognitive Ability Test')
    ).toBeVisible({ timeout: 10000 })
  })

  test('can start assessment and see instructions', async ({ page }) => {
    await page.goto('/assessments')

    // Click on the IQ test assessment
    await page.getByText('General Cognitive Ability Test').click()

    // Should see assessment details / instructions
    await expect(page.getByText(/45 minutes/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/40 questions/i)).toBeVisible()
  })

  test('can begin exam and see first question', async ({ page }) => {
    await page.goto('/assessments')
    await page.getByText('General Cognitive Ability Test').click()

    // Start the assessment
    const startButton = page.getByRole('button', { name: /start|begin/i })
    await expect(startButton).toBeVisible({ timeout: 10000 })
    await startButton.click()

    // Should see a question (one of the 40 questions from the seed)
    // Wait for the exam interface to load
    await expect(page.locator('[data-testid="question-stem"], .question-stem, h2, h3').first()).toBeVisible({ timeout: 15000 })

    // Should see answer options (4 options per question)
    const options = page.getByRole('button').or(page.getByRole('radio')).or(page.locator('[data-testid="option"]'))
    await expect(options.first()).toBeVisible({ timeout: 5000 })
  })
})
