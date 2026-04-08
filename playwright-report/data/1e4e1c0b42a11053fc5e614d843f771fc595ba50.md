# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> MPP Voting System - Authentication >> should switch roles and update form fields
- Location: tests\playwright\auth.spec.ts:61:7

# Error details

```
Error: page.goto: NS_ERROR_CONNECTION_REFUSED
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - heading "Unable to connect" [level=1] [ref=e5]
    - paragraph [ref=e6]: Firefox can’t establish a connection to the server at localhost:3000.
    - paragraph
    - list [ref=e8]:
      - listitem [ref=e9]: The site could be temporarily unavailable or too busy. Try again in a few moments.
      - listitem [ref=e10]: If you are unable to load any pages, check your computer’s network connection.
      - listitem [ref=e11]: If your computer or network is protected by a firewall or proxy, make sure that Nightly is permitted to access the web.
  - button "Try Again" [active] [ref=e13]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('MPP Voting System - Authentication', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Assuming the frontend runs on http://localhost:3000
> 6   |     await page.goto('http://localhost:3000/login');
      |                ^ Error: page.goto: NS_ERROR_CONNECTION_REFUSED
  7   |   });
  8   | 
  9   |   /**
  10  |    * 1. Successful Student Login
  11  |    */
  12  |   test('should successfully login as a student', async ({ page }) => {
  13  |     // Intercept the API call to wait for it
  14  |     const apiCall = page.waitForResponse('**/auth/student/login');
  15  | 
  16  |     // Fill Student ID and IC Number
  17  |     await page.getByPlaceholder('BCSXXXX-XXX').fill('BCS2024-001');
  18  |     await page.getByPlaceholder('000000-00-0000').fill('000101-01-0001');
  19  |     
  20  |     // Click Login button
  21  |     await page.getByRole('button', { name: /login/i }).click();
  22  | 
  23  |     const response = await apiCall;
  24  |     expect(response.status()).toBe(201); // NestJS default for POST
  25  | 
  26  |     // Check redirect to student dashboard
  27  |     await page.waitForURL('**/dashboard/student');
  28  |     expect(page.url()).toContain('/dashboard/student');
  29  | 
  30  |     // Verify accessToken cookie (Playwright can see httpOnly cookies)
  31  |     const cookies = await page.context().cookies();
  32  |     const tokenCookie = cookies.find((c) => c.name === 'accessToken');
  33  |     expect(tokenCookie).toBeDefined();
  34  |   });
  35  | 
  36  |   /**
  37  |    * 2. Failed Student Login (Invalid Credentials)
  38  |    */
  39  |   test('should fail login with invalid student credentials', async ({ page }) => {
  40  |     const apiCall = page.waitForResponse('**/auth/student/login');
  41  | 
  42  |     await page.getByPlaceholder('BCSXXXX-XXX').fill('INVALID-ID');
  43  |     await page.getByPlaceholder('000000-00-0000').fill('999999-99-9999');
  44  |     
  45  |     await page.getByRole('button', { name: /login/i }).click();
  46  | 
  47  |     const response = await apiCall;
  48  |     expect(response.status()).toBeGreaterThanOrEqual(400);
  49  | 
  50  |     // Verify error message is displayed
  51  |     const errorMessage = page.locator('text=/invalid credentials|error/i');
  52  |     await expect(errorMessage).toBeVisible();
  53  |     
  54  |     // Ensure we are still on the login page
  55  |     expect(page.url()).toContain('/login');
  56  |   });
  57  | 
  58  |   /**
  59  |    * 3. Role Switching
  60  |    */
  61  |   test('should switch roles and update form fields', async ({ page }) => {
  62  |     // Initial state: Student (Student ID & IC Number fields)
  63  |     await expect(page.getByPlaceholder('BCSXXXX-XXX')).toBeVisible();
  64  |     await expect(page.getByPlaceholder('000000-00-0000')).toBeVisible();
  65  |     await expect(page.getByPlaceholder('username@university.edu')).toBeHidden();
  66  | 
  67  |     // Switch to ADMIN role
  68  |     // Based on the code, roles are buttons with icons and labels
  69  |     await page.getByRole('button', { name: 'ADMIN' }).click();
  70  | 
  71  |     // Verify fields updated to Staff (Email & Password)
  72  |     await expect(page.getByPlaceholder('BCSXXXX-XXX')).toBeHidden();
  73  |     await expect(page.getByPlaceholder('username@university.edu')).toBeVisible();
  74  |     await expect(page.getByPlaceholder('••••••••••••')).toBeVisible();
  75  | 
  76  |     // Switch back to STUDENT
  77  |     await page.getByRole('button', { name: 'STUDENT' }).click();
  78  |     await expect(page.getByPlaceholder('BCSXXXX-XXX')).toBeVisible();
  79  |     await expect(page.getByPlaceholder('username@university.edu')).toBeHidden();
  80  |   });
  81  | 
  82  |   /**
  83  |    * 4. Successful Staff (Admin) Login
  84  |    */
  85  |   test('should successfully login as an admin', async ({ page }) => {
  86  |     // Switch to ADMIN role
  87  |     await page.getByRole('button', { name: 'ADMIN' }).click();
  88  | 
  89  |     const apiCall = page.waitForResponse('**/auth/staff/login');
  90  | 
  91  |     // Fill Admin credentials
  92  |     await page.getByPlaceholder('username@university.edu').fill('admin@university.edu');
  93  |     await page.getByPlaceholder('••••••••••••').fill('AdminPassword123');
  94  |     
  95  |     await page.getByRole('button', { name: /login/i }).click();
  96  | 
  97  |     const response = await apiCall;
  98  |     expect(response.status()).toBe(201);
  99  | 
  100 |     // Check redirect to admin dashboard
  101 |     // Role 'ADMIN' normalizes to 'admin' in the code: router.push(`/dashboard/${folderName}`)
  102 |     await page.waitForURL('**/dashboard/admin');
  103 |     expect(page.url()).toContain('/dashboard/admin');
  104 | 
  105 |     const cookies = await page.context().cookies();
  106 |     const tokenCookie = cookies.find((c) => c.name === 'accessToken');
```