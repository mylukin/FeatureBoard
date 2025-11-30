import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001/api/features';

test.describe('FeatureBoard E2E Tests', () => {
  // Reset database before each test by clearing all features
  test.beforeEach(async ({ request }) => {
    // Get all existing features and delete them
    const response = await request.get(API_BASE);
    const features = await response.json();
    for (const feature of features) {
      await request.delete(`${API_BASE}/${feature.id}`);
    }
  });

  test('Scenario 1: Shows empty state when no features exist', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for empty state message
    await expect(page.getByText('No features found')).toBeVisible();
  });

  test('Scenario 2: Create a new feature and see it in the list', async ({ page }) => {
    await page.goto('/');

    // Click "New Feature" button
    await page.click('text=New Feature');

    // Fill the form
    await page.fill('input#title', 'Test Feature');
    await page.fill('textarea#description', 'This is a test feature description');
    await page.fill('input#module', 'test');
    await page.selectOption('select#status', 'todo');
    await page.selectOption('select#priority', '3');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation back to home
    await page.waitForURL('/');

    // Verify feature appears in the list
    await expect(page.getByText('Test Feature')).toBeVisible();
    await expect(page.getByText('Module: test')).toBeVisible();
  });

  test('Scenario 3: Change feature status via inline control', async ({ page, request }) => {
    // Create a feature via API first
    await request.post(API_BASE, {
      data: {
        title: 'Status Test Feature',
        module: 'test',
        status: 'todo',
        priority: 3,
      },
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find the status select for our feature
    const featureCard = page.locator('.bg-white', { hasText: 'Status Test Feature' });
    const statusSelect = featureCard.locator('select');

    // Change status to "doing"
    await statusSelect.selectOption('doing');

    // Wait for the update
    await page.waitForTimeout(500);

    // Verify the select now shows "doing" (blue background class)
    await expect(statusSelect).toHaveClass(/bg-blue-100/);

    // Refresh and verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    const updatedStatusSelect = page.locator('.bg-white', { hasText: 'Status Test Feature' }).locator('select');
    await expect(updatedStatusSelect).toHaveValue('doing');
  });

  test('Scenario 4: Filter features by status', async ({ page, request }) => {
    // Create features with different statuses
    await request.post(API_BASE, {
      data: { title: 'Todo Feature', module: 'test', status: 'todo', priority: 3 },
    });
    await request.post(API_BASE, {
      data: { title: 'Doing Feature', module: 'test', status: 'doing', priority: 3 },
    });
    await request.post(API_BASE, {
      data: { title: 'Done Feature', module: 'test', status: 'done', priority: 3 },
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // All features should be visible initially
    await expect(page.getByText('Todo Feature')).toBeVisible();
    await expect(page.getByText('Doing Feature')).toBeVisible();
    await expect(page.getByText('Done Feature')).toBeVisible();

    // Filter by "todo" status
    await page.selectOption('select#status-filter', 'todo');
    await page.waitForLoadState('networkidle');

    // Only Todo Feature should be visible
    await expect(page.getByText('Todo Feature')).toBeVisible();
    await expect(page.getByText('Doing Feature')).not.toBeVisible();
    await expect(page.getByText('Done Feature')).not.toBeVisible();

    // Verify URL updated
    expect(page.url()).toContain('status=todo');
  });

  test('Scenario 5: Delete feature and verify stats update', async ({ page, request }) => {
    // Create a feature
    const createResponse = await request.post(API_BASE, {
      data: { title: 'Feature to Delete', module: 'delete-test', status: 'todo', priority: 3 },
    });
    const feature = await createResponse.json();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify feature exists
    await expect(page.getByText('Feature to Delete')).toBeVisible();

    // Delete via API (since there's no delete button in UI yet)
    await request.delete(`${API_BASE}/${feature.id}`);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Feature should no longer be visible
    await expect(page.getByText('Feature to Delete')).not.toBeVisible();

    // Stats should show empty state or updated count
    await expect(page.getByText('No features found')).toBeVisible();
  });

  test('Scenario 6: Edit a feature', async ({ page, request }) => {
    // Create a feature via API
    const createResponse = await request.post(API_BASE, {
      data: { title: 'Original Title', module: 'edit-test', status: 'todo', priority: 3 },
    });
    const feature = await createResponse.json();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click edit link
    const editLink = page.locator('.bg-white', { hasText: 'Original Title' }).getByText('Edit');
    await editLink.click();

    // Wait for edit page to load
    await page.waitForURL(`/edit/${feature.id}`);

    // Verify form is prefilled
    await expect(page.locator('input#title')).toHaveValue('Original Title');

    // Change the title
    await page.fill('input#title', 'Updated Title');
    await page.click('button[type="submit"]');

    // Wait for navigation back to home
    await page.waitForURL('/');

    // Verify updated title appears
    await expect(page.getByText('Updated Title')).toBeVisible();
    await expect(page.getByText('Original Title')).not.toBeVisible();
  });
});
