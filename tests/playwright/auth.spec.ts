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

    // Fill Student ID (Matches STUDENT role in seed.ts). IC number is no longer required.
    await page.getByPlaceholder('BCSXXXX-XXX').fill('S1230');
    
    // Click Login button
    await page.getByRole('button', { name: /login/i }).click();

    const response = await apiCall;
    expect(response.status()).toBe(201); // NestJS default for POST
    
    // Check redirect to student dashboard
    await page.waitForURL('**/dashboard/student');
    expect(page.url()).toContain('/dashboard/student');
  });

  /**
   * 2. Self-Registration on First Login
   */
  test('should self-register a new student on first login', async ({ page }) => {
    const apiCall = page.waitForResponse('**/auth/student/login');

    // A brand-new student ID is accepted and registered on the fly (no IC number).
    await page.getByPlaceholder('BCSXXXX-XXX').fill(`SELFR${Date.now()}`);
    
    await page.getByRole('button', { name: /login/i }).click();

    const response = await apiCall;
    // 201 = logged in & registered; 403 = registered but outside the active session window
    expect([200, 201, 403]).toContain(response.status());
  });

  /**
   * 3. Role Switching
   */
  test('should switch roles and update form fields', async ({ page }) => {
    // Initial state: Student (Student ID field only - no IC number anymore)
    await expect(page.getByPlaceholder('BCSXXXX-XXX')).toBeVisible();
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

    // Fill Admin credentials (Matches ADMIN role in seed.ts)
    await page.getByPlaceholder('username@university.edu').fill('dummy_admin@system.edu.my');
    await page.getByPlaceholder('••••••••••••').fill('password123');
    
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
