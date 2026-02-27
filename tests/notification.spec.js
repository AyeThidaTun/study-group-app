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
    // Navigate to Notifications Page
    await page.goto(`${API_URL}/notification/notification.html`);
    await expect(page).toHaveTitle(/Notifications/);
});


// Test case: Verify modal opens when clicking a notification
test('should open notification modal when clicking a notification', async ({ page }) => {
    const firstNotification = page.locator('#announcementsContainer .card1').first();
    await firstNotification.click();

    await expect(page.locator('#notificationModal')).toBeVisible();
    await expect(page.locator('#modalTitle')).not.toBeEmpty();
    await expect(page.locator('#modalBody')).not.toBeEmpty();
});

// // Test case: Mark a notification as read
// test('should mark a notification as read', async ({ page }) => {
//     const firstNotification = page.locator('#announcementsContainer .card1').first();
//     await firstNotification.click();

//     const markAsReadButton = page.locator('.mark-as-read');
//     await expect(markAsReadButton).toBeVisible();
//     await markAsReadButton.click();

//     // Confirm modal disappears
//     await expect(page.locator('#notificationModal')).not.toBeVisible();

//     // Refresh and verify the notification is now read
//     await page.reload();
//     await expect(firstNotification).not.toHaveClass(/unread/);
// });

// // Test case: Mark a notification as unread
// test('should mark a notification as unread', async ({ page }) => {
//     const firstNotification = page.locator('#announcementsContainer .card1').first();
//     const dropdown = firstNotification.locator('.dropdown'); // Select the correct dropdown container
//     const dropdownMenu = dropdown.locator('.dropdown-menu'); // The menu inside the dropdown

//     // Hover over the dropdown to make the menu visible
//     await dropdown.hover();

//     // Wait for the dropdown menu to be visible
//     await expect(dropdownMenu).toBeVisible();

//     // Click on "Mark as Unread" inside the dropdown
//     await dropdownMenu.locator('.mark-as-unread').first().click();

//     // Refresh the page to ensure the change persists
//     await page.reload();

//     // Verify the notification background color (UNREAD status)
//     await expect(firstNotification).toHaveCSS('background-color', 'rgb(254, 250, 224)'); // Beige color
// });


// // Test case: Filter unread notifications
// test('should filter unread notifications correctly', async ({ page }) => {
//     // Make sure the filter options are visible before interacting
//     await page.click('#applyFilterBtn');

//     await page.check('#filterUnread');
//     await page.uncheck('#filterRead');

//     // Wait for the announcements container to update
//     await page.waitForSelector('#announcementsContainer');

//     // Check if "No announcements made yet" message appears
//     await page.locator('#announcementsContainer').getByText('No announcements made yet');
//     const noAnnouncementsMessage = page.locator('#announcementsContainer').getByText('No announcements made yet');

//     if (await noAnnouncementsMessage.isVisible()) {
//         console.log('No announcements made yet - Test Passed');
//         return; // Exit test early if no announcements exist
//     }


//     // Verify only unread notifications are displayed
//     const notifications = await page.locator('#announcementsContainer .card1').all();
//     for (const notification of notifications) {
//         await expect(notification).toHaveCSS('background-color', 'rgb(254, 250, 224)'); // Beige color
//     }
// });

// Does not work in github 50% of time
// // Test case: Filter read notifications
// test('should filter read notifications correctly', async ({ page }) => {
//     // Make sure the filter options are visible before interacting
//     await page.click('#applyFilterBtn');

//     // Select only read notifications
//     await page.uncheck('#filterUnread');
//     await page.check('#filterRead');


//     // Wait for the announcements container to update
//     await page.waitForSelector('#announcementsContainer');

//     // Check if "No announcements made yet" message appears
//     await page.locator('#announcementsContainer').getByText('No announcements made yet');
//     const noAnnouncementsMessage = page.locator('#announcementsContainer').getByText('No announcements made yet');

//     if (await noAnnouncementsMessage.isVisible()) {
//         console.log('No announcements made yet - Test Passed');
//         return; // Exit test early if no announcements exist
//     }

//     // If announcements exist, check that none are unread (no beige background)
//     const notifications = await page.locator('#announcementsContainer .card1').all();

//     for (const notification of notifications) {
//         await expect(notification).not.toHaveCSS('background-color', 'rgb(254, 250, 224)'); // Beige color for unread
//     }
// });

