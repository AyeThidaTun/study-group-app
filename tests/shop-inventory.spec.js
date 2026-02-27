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
    // Navigate to Shop Page
    await page.goto(`${API_URL}/shop/shop.html`);
    await expect(page).toHaveTitle(/SP Shop/);
});

// // Test sorting items by price (low to high)
// test('Sort items by price (low to high)', async ({ page }) => {
//     await page.check('input[value="price_asc"]');
//     await page.waitForSelector('#shop-container .card'); // Wait for products to update

//     const productCards = await page.locator('#shop-container .card').all();
//     const prices = await Promise.all(
//         productCards.map(async (card) => {
//             const priceText = await card.locator('text=/Price: (\\d+)/').innerText();
//             return parseInt(priceText.match(/\d+/)?.[0] || '0', 10);
//         })
//     );

//     expect(prices).toEqual([...prices].sort((a, b) => a - b));
// });

// Test filtering by category
test('Filter items by category Merchandise', async ({ page }) => {
    await page.check('input[value="Merchandise"]');
    await page.waitForSelector('#shop-container .card'); // Ensure filtered products appear

    const products = await page.locator('#shop-container .card').count();
    expect(products).toBeGreaterThan(0);
});

// Test filtering by stock status
test('Filter items that are In Stock', async ({ page }) => {
    await page.check('input[value="IN_STOCK"]');
    await page.waitForSelector('#shop-container .card');

    const outOfStockItems = await page.locator('#shop-container .card:has-text("Sold Out")').count();
    expect(outOfStockItems).toBe(0);
});

// Test purchasing an item
test('Complete a purchase', async ({ page }) => {
    await page.locator('#shop-container .buy-btn').first().click();
    await page.fill('#quantityInput', '2');
    const totalBefore = await page.locator('#modalTotalPoints').innerText();
    await page.click('#confirmPurchaseBtn');

    await expect(page.locator('#alertModal')).toBeVisible();
    await expect(page.locator('#alertModalBody')).toContainText('Successfully purchased 2 x DCDF x Gryphons Totebag!');
    await page.click('button[data-bs-dismiss="modal"]');

    // Navigate to Inventory Page
    await page.goto(`${API_URL}/shop/inventory.html`);

    // Ensure the inventory page is loaded
    await page.reload();

    // Wait for 1000ms (1 second) to ensure all elements load
    await page.waitForTimeout(1000);

    // Wait for inventory items to load
    await page.waitForSelector('#unredeemed-container .card');

    // Locate the card containing "DCDF x Gryphons Totebag"
    const productCard = page.locator('#unredeemed-container .card:has-text("DCDF x Gryphons Totebag")');

    // Ensure the card is visible
    await expect(productCard).toBeVisible();

    // Check if the product description is correct
    await expect(productCard.locator('.card-text').nth(0)).toContainText("Limited edition tote bag featuring a collaboration between DCDF and Gryphons.");

    // Ensure the correct quantity is displayed
    await expect(productCard.locator('.card-text').nth(1)).toContainText("Quantity:");

    // Ensure a valid purchase date is displayed
    await expect(productCard.locator('.card-text').nth(2)).toContainText("Purchased At:");

    // Ensure the "Redeem" button is present
    const redeemButton = productCard.locator('.redeem-btn');
    await expect(redeemButton).toBeVisible();
});

// Test to ensure user cannot purchase item if insufficient points
test('Error handling if points insufficient', async ({ page }) => {
    await page.locator('#shop-container .buy-btn').first().click();
    await page.fill('#quantityInput', '90');
    const totalBefore = await page.locator('#modalTotalPoints').innerText();
    await page.click('#confirmPurchaseBtn');

    await expect(page.locator('#alertModal')).toBeVisible();
    await expect(page.locator('#alertModalBody')).toContainText('You do not have enough points!');
    await page.click('button[data-bs-dismiss="modal"]');
});


test('Redeem a purchased item using QR code', async ({ page }) => {
    // Navigate to Inventory Page
    await page.goto(`${API_URL}/shop/inventory.html`);

    // Ensure the inventory page is loaded
    await page.reload();

    // Wait for 1000ms (1 second) to ensure all elements load
    await page.waitForTimeout(1000);

    // Ensure inventory items are loaded
    await page.waitForSelector('#unredeemed-container .card');

    // Locate the product card for "DCDF x Gryphons Totebag"
    const productCard = page.locator('#unredeemed-container .card:has-text("DCDF x Gryphons Totebag")');

    // Ensure the card is visible
    await expect(productCard).toBeVisible();

    // Click the "Redeem" button
    await productCard.locator('.redeem-btn').click();

    // Wait for QR code modal to appear
    await page.waitForSelector('#qrCodeModal', { state: 'visible' });

    // Extract the QR Code URL from the `data-url` attribute
    const qrCodeUrl = await page.locator('#qrcode').getAttribute('data-url');

    // Ensure QR code URL exists
    expect(qrCodeUrl).not.toBeNull();

    // Simulate scanning the QR code by navigating to the extracted URL
    if (qrCodeUrl) {
        await page.goto(qrCodeUrl);
    } else {
        throw new Error('QR code URL is null');
    }

    // Ensure user is redirected back to the inventory page
    await expect(page).toHaveURL(`${API_URL}/shop/inventory.html`);

    // Ensure the item is now in the redeemed section
    const redeemedCard = page.locator('#redeemed-container .card:has-text("DCDF x Gryphons Totebag")');
    await expect(redeemedCard).toBeVisible();
});
