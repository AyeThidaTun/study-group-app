const { test, expect } = require('@playwright/test');

const NEW_RESOURCE = { title: 'Test Resource' };

test.describe('Resource Management Features', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Logging in as a user...');
    // Navigate to the login page
    await page.goto('http://localhost:3001/login.html');

    // Fill in the login credentials
    await page.fill('input[name="email"]', 'leo.23@ichat.sp.edu.sg');
    await page.fill('input[name="password"]', '1234');

    // Submit the login form and wait for navigation
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3001/profile/profile.html');

    console.log('Navigating to the resources page...');
    // Navigate to the resources page
    await page.click('nav a[href="/resources/resources.html"]');
    await expect(page).toHaveURL('http://localhost:3001/resources/resources.html');
  });
  

  test('Should create a resource and display it in the resource list', async ({ page }) => {
    console.log('Opening the Create Resource modal...');
    
    // Open the Create Resource modal
    await page.click('#createResourceBtn');
  
    // Wait for the modal to appear
    await expect(page.locator('#createResourceModal')).toBeVisible();
  
    console.log('Filling in the resource form...');
    // Fill in the resource form
    await page.fill('#title', NEW_RESOURCE.title);
  
    console.log('Submitting the form...');
    // Submit the form
    await page.click('#createResourceForm button[type="submit"]');
  
    console.log('Handling the alert dialog...');
    // Handle and dismiss the alert dialog
    page.on('dialog', async (dialog) => {
      console.log(`Alert message: ${dialog.message()}`);
      await dialog.dismiss();
    });
  
    console.log('Waiting for the modal to close...');
    await page.waitForSelector('#createResourceModal', { state: 'hidden' });
  
    console.log('Verifying the new resource appears in the resource list...');
    // Verify the new resource appears in the resource list
    const resourceList = page.locator('#resources');
    await expect(resourceList).toContainText(NEW_RESOURCE.title);
  
    console.log('Test passed: Resource is successfully created.');
  });
  

  test('Should navigate to the Manage Resources page', async ({ page }) => {
    console.log('Clicking on "Manage Your Resources" link...');
    await page.click('nav a[href="/resources/manageResources.html"]');

    console.log('Verifying navigation to Manage Resources page...');
    await expect(page).toHaveURL('http://localhost:3001/resources/manageResources.html');
  });

  test('Previous and Next buttons should be clickable in carousel', async ({ page }) => {
    console.log('Verifying carousel control buttons...');
    const prevButton = page.locator('.carousel-control-prev');
    const nextButton = page.locator('.carousel-control-next');

    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();

    console.log('Clicking Next button...');
    await nextButton.click();
    await expect(page.locator('.carousel-item.active')).toHaveCount(1);
    await expect(page.locator('.carousel-item.active').first()).toHaveClass(/active/);

    console.log('Clicking Previous button...');
    await prevButton.click();
    await expect(page.locator('.carousel-item.active')).toHaveCount(1);
    await expect(page.locator('.carousel-item.active').first()).toHaveClass(/active/);
  });

  test('Should show correct number of items per slide in carousel', async ({ page }) => {
    console.log('Verifying the number of items per slide in the carousel...');
    const firstCarouselItem = page.locator('#popular-resources-container .carousel-item').first();
    const resourceCards = firstCarouselItem.locator('.resource-card');

    await expect(resourceCards).toHaveCount(3);
  });

  test('Should display all resources when "All Resources" is clicked', async ({ page }) => {
    console.log('Clicking "All Resources" link...');
    const allResourcesLink = page.locator('#anchor-links a:has-text("All Resources")');
    await allResourcesLink.click();

    const resourcesContainer = page.locator('#resources');
    await expect(resourcesContainer).toBeVisible();

    const resourceCards = resourcesContainer.locator('.resource-card1');
    await resourceCards.first().waitFor();

    const count = await resourceCards.count();
    console.log(`Number of resource cards: ${count}`);
    expect(count).toBeGreaterThan(0);
  });

  test('Should show tag-specific resources when a tag is clicked', async ({ page }) => {
    const tagLink = page.locator('#anchor-links a').nth(1);
    const tagName = await tagLink.textContent();
    console.log(`Tag selected: ${tagName}`);

    await tagLink.click();

    const resourcesContainer = page.locator('#resources');
    await expect(resourcesContainer).toBeVisible();

    const resourceCards = resourcesContainer.locator('.resource-card1');
    await resourceCards.first().waitFor();

    const count = await resourceCards.count();
    console.log(`Number of resources for tag "${tagName}": ${count}`);
    expect(count).toBeGreaterThan(0);
  });

  test('Should show "No resources found" for tags with no resources', async ({ page }) => {
    const tagLink = page.locator('#anchor-links a').nth(6); // Adjust index as needed
    const tagName = await tagLink.textContent();
    console.log(`Tag selected: ${tagName}`);

    await tagLink.click();

    const resourcesContainer = page.locator('#resources');
    await expect(resourcesContainer).toBeVisible();

    const containerContent = await resourcesContainer.innerHTML();
    console.log('Resources container HTML:', containerContent);

    await expect(resourcesContainer).toContainText('No resources found');
  });

  test('Should not create a resource if title is missing', async ({ page }) => {
    console.log('Opening the Create Resource modal...');
    
    // Open the Create Resource modal
    await page.click('#createResourceBtn');

    // Wait for the modal to appear
    await expect(page.locator('#createResourceModal')).toBeVisible();

    console.log('Submitting the form without a title...');
    
    // Try submitting the form without filling the title field
    await page.click('#createResourceForm button[type="submit"]');

    console.log('Checking if the modal is still open...');
    
    // The modal should still be visible since the title is required
    await expect(page.locator('#createResourceModal')).toBeVisible();

    console.log('Verifying that no new resource appears in the resource list...');
    
    // Verify the resource was not added to the list
    const resourceList = page.locator('#resources');
    await expect(resourceList).not.toContainText(NEW_RESOURCE.title);

    console.log('Test passed: Resource was not created without a title.');
});
});
