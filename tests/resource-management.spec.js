const { test, expect } = require('@playwright/test');

const NEW_RESOURCE = { title: 'Test Resource', description: 'This is a test description.' };
// const UPDATED_RESOURCE = { title: 'Updated Resource', description: 'This is an updated description.' };

// const NEW_RESOURCE = {
//     title: 'Test Resource',
//     description: 'This is a test',
//     tag: 'JavaScript'
//   };
  
  const UPDATED_RESOURCE = {
    title: 'Updated Resource',
    description: 'Updated description'
  };

// Test Suite for Resource Management Features
test.describe('Resource Management Features', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Logging in as a user...');
    await page.goto('http://localhost:3001/login.html');
    await page.fill('input[name="email"]', 'leo.23@ichat.sp.edu.sg');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3001/profile/profile.html');

    console.log('Navigating to the resources page...');
    await page.goto('http://localhost:3001/resources/manageResources.html');
    // await page.click('nav a[href="/resources/resources.html"]');
    // await expect(page).toHaveURL('http://localhost:3001/resources/resources.html');
  });

  test('Should create a resource and display it in the resource list', async ({ page }) => {
    console.log('Opening the Create Resource modal...');
    await page.click('#create-btn');
    await expect(page.locator('#createResourceModal')).toBeVisible();

    console.log('Filling in the resource form...');
    await page.fill('#title', NEW_RESOURCE.title);
    await page.fill('#description', NEW_RESOURCE.description);

    console.log('Submitting the form...');
    await page.click('#createResourceForm button[type="submit"]');

    page.on('dialog', async (dialog) => {
      console.log(`Alert message: ${dialog.message()}`);
      await dialog.dismiss();
    });

    await page.waitForSelector('#createResourceModal', { state: 'hidden' });
    console.log('Verifying the new resource appears in the resource list...');
    const resourceList = page.locator('#user-resources');
    await expect(resourceList).toContainText(NEW_RESOURCE.title);
  });

  test('Should update an existing resource', async ({ page }) => {
    console.log('Locating the resource to update...');
    const resourceCard = page.locator(`.resource-card:has-text("${NEW_RESOURCE.title}")`);
    await expect(resourceCard).toBeVisible();

    console.log('Opening the Update Resource modal...');
    await resourceCard.locator('#btn-update').click();
    await expect(page.locator('#updateResourceModal')).toBeVisible();

    console.log('Updating the resource details...');
    await page.fill('#updateTitle', UPDATED_RESOURCE.title);
    await page.fill('#updateDescription', UPDATED_RESOURCE.description);
    await page.click('#updateResourceForm button.btn-primary');

    console.log('Verifying the resource was updated...');
    await expect(page.locator('#updateResourceModal')).toBeHidden();
    // await expect(resourceCard).toContainText(UPDATED_RESOURCE.description);
  });

  test('Should delete an existing resource', async ({ page }) => {
    console.log('Locating the resource to delete...');
    const resourceCard = page.locator(`.resource-card:has-text("${UPDATED_RESOURCE.title}")`);
    await expect(resourceCard).toBeVisible();

    console.log('Clicking the delete button...');
    page.on('dialog', async (dialog) => {
      console.log(`Alert message: ${dialog.message()}`);
      await dialog.accept();
    });

    await resourceCard.locator('#btn-del').click();

    console.log('Verifying the resource has been deleted...');
    await expect(resourceCard).toBeHidden();
  });

  test('Should add tags to an existing resource', async ({ page }) => {
    console.log('Creating a resource for tag assignment...');
    await page.click('#create-btn');
    await page.fill('#title', 'Tag Test Resource');
    await page.fill('#description', 'Testing tag assignment.');
    await page.click('#createResourceForm button[type="submit"]');
    await page.waitForSelector('#createResourceModal', { state: 'hidden' });

    const resourceCard = page.locator(`.resource-card:has-text("Tag Test Resource")`);
    await expect(resourceCard).toBeVisible();

    console.log('Opening Add Tag modal...');
    await resourceCard.locator('#btn-add').click();
    await expect(page.locator('#addTagModal')).toBeVisible();

    console.log('Selecting a tag...');
    const firstCheckbox = page.locator('#categoriesContainer .form-check-input').first();
    await firstCheckbox.check();

    console.log('Submitting the tag addition form...');
    await page.click('#addTagForm button.btn-primary');

    console.log('Verifying the tag is displayed with the resource...');
    await page.waitForSelector('#addTagModal', { state: 'hidden' });
    await expect(resourceCard).toContainText(await firstCheckbox.evaluate(el => el.nextElementSibling.textContent.trim()));
  });
});
