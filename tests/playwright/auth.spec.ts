import { test, expect } from '@playwright/test';

test.describe('MPP Voting System - Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming the frontend runs on http://localhost:3000
    await page.goto('http://localhost:3000/login');
  });

  /**
   * 1. Successful Student Login
   */
  test('should successfully login as a student', async ({ page }) => {
    // Intercept the API call to wait for it
    const apiCall = page.waitForResponse('**/auth/student/login');

    // Fill Student ID and IC Number
    await page.getByPlaceholder('BCSXXXX-XXX').fill('BCS2024-001');
    await page.getByPlaceholder('000000-00-0000').fill('000101-01-0001');
    
    // Click Login button
    await page.getByRole('button', { name: /login/i }).click();

    const response = await apiCall;
    expect(response.status()).toBe(201); // NestJS default for POST

    // Check redirect to student dashboard
    await page.waitForURL('**/dashboard/student');
    expect(page.url()).toContain('/dashboard/student');

    // Verify accessToken cookie (Playwright can see httpOnly cookies)
    const cookies = await page.context().cookies();
    const tokenCookie = cookies.find((c) => c.name === 'accessToken');
    expect(tokenCookie).toBeDefined();
  });

  /**
   * 2. Failed Student Login (Invalid Credentials)
   */
  test('should fail login with invalid student credentials', async ({ page }) => {
    const apiCall = page.waitForResponse('**/auth/student/login');

    await page.getByPlaceholder('BCSXXXX-XXX').fill('INVALID-ID');
    await page.getByPlaceholder('000000-00-0000').fill('999999-99-9999');
    
    await page.getByRole('button', { name: /login/i }).click();

    const response = await apiCall;
    expect(response.status()).toBeGreaterThanOrEqual(400);

    // Verify error message is displayed
    const errorMessage = page.locator('text=/invalid credentials|error/i');
    await expect(errorMessage).toBeVisible();
    
    // Ensure we are still on the login page
    expect(page.url()).toContain('/login');
  });

  /**
   * 3. Role Switching
   */
  test('should switch roles and update form fields', async ({ page }) => {
    // Initial state: Student (Student ID & IC Number fields)
    await expect(page.getByPlaceholder('BCSXXXX-XXX')).toBeVisible();
    await expect(page.getByPlaceholder('000000-00-0000')).toBeVisible();
    await expect(page.getByPlaceholder('username@university.edu')).toBeHidden();

    // Switch to ADMIN role
    // Based on the code, roles are buttons with icons and labels
    await page.getByRole('button', { name: 'ADMIN' }).click();

    // Verify fields updated to Staff (Email & Password)
    await expect(page.getByPlaceholder('BCSXXXX-XXX')).toBeHidden();
    await expect(page.getByPlaceholder('username@university.edu')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••••••')).toBeVisible();

    // Switch back to STUDENT
    await page.getByRole('button', { name: 'STUDENT' }).click();
    await expect(page.getByPlaceholder('BCSXXXX-XXX')).toBeVisible();
    await expect(page.getByPlaceholder('username@university.edu')).toBeHidden();
  });

  /**
   * 4. Successful Staff (Admin) Login
   */
  test('should successfully login as an admin', async ({ page }) => {
    // Switch to ADMIN role
    await page.getByRole('button', { name: 'ADMIN' }).click();

    const apiCall = page.waitForResponse('**/auth/staff/login');

    // Fill Admin credentials
    await page.getByPlaceholder('username@university.edu').fill('admin@university.edu');
    await page.getByPlaceholder('••••••••••••').fill('AdminPassword123');
    
    await page.getByRole('button', { name: /login/i }).click();

    const response = await apiCall;
    expect(response.status()).toBe(201);

    // Check redirect to admin dashboard
    // Role 'ADMIN' normalizes to 'admin' in the code: router.push(`/dashboard/${folderName}`)
    await page.waitForURL('**/dashboard/admin');
    expect(page.url()).toContain('/dashboard/admin');

    const cookies = await page.context().cookies();
    const tokenCookie = cookies.find((c) => c.name === 'accessToken');
    expect(tokenCookie).toBeDefined();
  });
});
