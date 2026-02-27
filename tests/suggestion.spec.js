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
    // Navigate to Suggestions Page
    await page.goto(`${API_URL}/suggestions/suggestions.html`);
    await expect(page).toHaveTitle(/Suggestions/);
});

test('Search functionality works correctly', async ({ page }) => {
    const searchBar = page.locator('#search-bar');

    // Type a search query
    await searchBar.fill('profile pictures');

    // Simulate pressing enter or waiting for results
    await page.keyboard.press('Enter');

    // Verify at least one result appears (assuming the search updates the UI dynamically)
    const suggestions = page.locator('#suggestions-container .card');
    await expect(suggestions).toHaveCount(1);
});

test('Sorting by date updates post order', async ({ page }) => {
    const sortDropdown = page.locator('#sort-view');
    await sortDropdown.selectOption('createdAt');

    // Switch to desc order
    await page.click('#desc');
    await page.click('#asc');

    // Wait for sorting to apply
    await page.waitForTimeout(500); // Give time for UI update (adjust if needed)

    // Verify posts are sorted correctly
    const posts = page.locator('#suggestions-container .card');

    // Get the text content of the first post and log it
    const firstPostText = await posts.first().textContent();
    console.log('First post text:', firstPostText);

    // Adjust expectation to match detected format
    await expect(posts.first()).toContainText('Posted on: 11/20/2024');
});


// does not work in github
// test('Filtering suggestions by tag', async ({ page }) => {
//     // Click on a tag filter
//     await page.click('button:has-text("Feature")');

//     // Ensure only filtered posts appear
//     const suggestions = page.locator('#suggestions-container .card');
    
//     // Await the count before comparing
//     const count = await suggestions.count();
//     await expect(count).toBeGreaterThan(0);

//     // Check if the first suggestion contains "Feature"
//     await expect(suggestions.first()).toContainText('Feature');
// });


// does not work in github
// test('Creating a new suggestion post', async ({ page }) => {
//     await page.click('#new-post-btn');

//     // Ensure modal appears
//     const createPostModal = page.locator('#createPostModal');
//     await expect(createPostModal).toBeVisible();

//     // Fill out post form
//     await page.fill('#post-title', 'Playwright Test Post');
//     await page.fill('#post-description', 'This is a test post created by Playwright.');

//     // Select a tag
//     await page.click('[data-tag="Feature"]');

//     // Submit the form
//     await page.click('#submit-post-btn');

//     await page.locator('#suggestions-container').locator('text=Playwright Test Post');

//     // Verify post appears in the suggestions container
//     const newPost = page.locator('#suggestions-container').locator('text=Playwright Test Post');
//     await expect(newPost).toBeVisible();
// });

// test('Modal validation: Prevent empty post submission', async ({ page }) => {
//     await page.click('#new-post-btn');

//     // Ensure modal appears
//     const createPostModal = page.locator('#createPostModal');
//     await expect(createPostModal).toBeVisible();

//     // Try to submit without filling anything
//     await page.click('#submit-post-btn');

//     // Ensure error alert appears
//     const alertModal = page.locator('#alertModal');
//     await expect(alertModal).toBeVisible();
//     await expect(alertModal.locator('.modal-body')).toContainText('Please fill in the title.');

//     // Close modal
//     // Click the OK button inside the modal
//     await page.click('#alertModal .modal-footer .btn-primary');

//     // Fill out post form Title
//     await page.fill('#post-title', 'Playwright Error Test Post');

//     // Try to submit only title
//     await page.click('#submit-post-btn');

//     // Ensure error alert appears
//     await expect(alertModal).toBeVisible();
//     await expect(alertModal.locator('.modal-body')).toContainText('Please fill in the description.');

//     // Close modal
//     // Click the OK button inside the modal
//     await page.click('#alertModal .modal-footer .btn-primary');

//     // Fill out post form Description
//     await page.fill('#post-description', 'This is a test error post created by Playwright.');

//     // Try to submit only title and description
//     await page.click('#submit-post-btn');

//     // Ensure error alert appears
//     await expect(alertModal).toBeVisible();
//     await expect(alertModal.locator('.modal-body')).toContainText('Please select at least one tag.');

//     // Close modal
//     // Click the OK button inside the modal
//     await page.click('#alertModal .modal-footer .btn-primary');

//     // Select a tag
//     await page.click('[data-tag="UI"]');

//     // Submit the form
//     await page.click('#submit-post-btn');

//     // Verify post appears in the suggestions container
//     const newPost = page.locator('#suggestions-container').locator('text=Playwright Error Test Post');
//     await expect(newPost).toBeVisible();
// });



// test('Admin login, approve suggestion with reason', async ({ page }) => {

//     // Go to login page
//     await page.goto(`${API_URL}/login.html`);

//     // Fill in admin credentials
//     await page.fill('#email', 'lebron_james.23@ichat.sp.edu.sg'); // Admin email
//     await page.fill('#password', '1234'); // Admin password
//     await page.click('button[type="submit"]');

//     // Confirm redirection to admin suggestion management page
//     await expect(page).toHaveURL(`${API_URL}/admin/manageSuggestions.html`);

//     // Wait for the suggestions to load
//     await page.waitForSelector('.btn-primary'); // Assuming "Manage Suggestion" buttons exist

//     // Click the first "Manage Suggestion" button (opens modal)
//     await page.click('.btn-primary');

//     // Ensure modal is visible
//     await page.waitForSelector('#manageSuggestionModal.show');

//     await page.check('.approveRadio');

//     // Fill in the reason
//     await page.fill('#reasonInput', 'This suggestion aligns with our goals.');

//     // Submit the form
//     await page.click('#manageSuggestionForm button[type="submit"]');

//     // Wait for success alert
//     await page.waitForSelector('#alertModal.show');

//     // Ensure success message appears
//     await expect(page.locator('#alertModalBody')).toHaveText('Suggestion successfully updated!');
// });