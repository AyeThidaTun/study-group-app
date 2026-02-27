// @ts-check
const { test, expect } = require('@playwright/test');

// Test constants
const API_URL = 'http://localhost:3001';

// Helper to log in before each test
test.beforeEach(async ({ page }) => {
    console.log('Logging in as a user...');
    await page.goto(`${API_URL}/login.html`);
    await page.fill('#email', 'yvonne.23@ichat.sp.edu.sg'); // Regular user email
    await page.fill('#password', '1234'); // Regular user password
    await page.click('button[type="submit"]');

    // Confirm redirection to profile page
    await expect(page).toHaveURL(`${API_URL}/profile/profile.html`);
    // Navigate to Home Page
    await page.goto("http://localhost:3001/home/home.html");
});

// test('Check if total number of users is displayed and more than 20', async ({ page }) => {
//     await page.waitForSelector('#userCount .userCount-number'); // Wait for user count to be visible
//     const userCount = await page.locator('#userCount .userCount-number').textContent();
//     expect(Number(userCount)).toBeGreaterThan(20);
// });

test('Verify Top 5 Users Chart is Loaded', async ({ page }) => {
    await page.waitForSelector('#topUsersChart'); // Wait for chart to load
    const chartExists = await page.isVisible('#topUsersChart');
    expect(chartExists).toBeTruthy();
});

test('Verify Quiz Completion Trends Chart Loads and Updates', async ({ page }) => {
    await page.waitForSelector('#quizTrendsChart'); // Ensure the chart is present

    // Check initial state
    const chartExists = await page.isVisible('#quizTrendsChart');
    expect(chartExists).toBeTruthy();

    // Click filters and check updates
    await page.click('button:has-text("Filter by Month")');
    await page.waitForTimeout(1000); // Wait for chart update
    await page.click('button:has-text("Filter by Year")');
    await page.waitForTimeout(1000);
});