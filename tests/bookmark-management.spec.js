const { test, expect } = require('@playwright/test');

test.describe('Bookmark Progress Bar Tests 1', () => {

  test.beforeEach(async ({ page }) => {
    console.log('Logging in as a user...');

    // Navigate to the login page
    await page.goto('http://localhost:3001/login.html');

    // Fill in login credentials
    await page.fill('input[name="email"]', 'leo.23@ichat.sp.edu.sg');
    await page.fill('input[name="password"]', '1234');

    // Submit the login form and wait for navigation
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3001/profile/profile.html');

    console.log('Navigating to the Bookmarks page...');
    // console.log('Navigating to the resources page...');
    await page.goto('http://localhost:3001/bookmarks/stateBook2.html');
  });

  test('Unread category should have progress bar at 0%', async ({ page }) => {
    console.log('Checking progress bar for Unread bookmarks...');
    const unreadCards = page.locator('#unread .bookmark-card');

    if (await unreadCards.count() > 0) {
      const progressBar = unreadCards.first().locator('.progress-bar');
      const progressWidth = await progressBar.evaluate(el => parseFloat(el.style.width));  
      expect(progressWidth).toBe(0);  // Progress should be 0%
      console.log('✅ Unread bookmark has 0% progress.');
    } else {
      console.log('ℹ️ No unread bookmarks available to test.');
    }
  });

  test('Reading category should have progress bar between 1% and 99%', async ({ page }) => {
    console.log('Checking progress bar for Reading bookmarks...');
    const readingCards = page.locator('#reading .bookmark-card');

    if (await readingCards.count() > 0) {
      const progressBar = readingCards.first().locator('.progress-bar');
      const progressWidth = await progressBar.evaluate(el => parseFloat(el.style.width));  
      expect(progressWidth).toBeGreaterThan(0);
      expect(progressWidth).toBeLessThan(100);
      console.log(`✅ Reading bookmark has progress at ${progressWidth}%.`);
    } else {
      console.log('ℹ️ No reading bookmarks available to test.');
    }
  });

  test('Finished category should have progress bar at 100%', async ({ page }) => {
    console.log('Checking progress bar for Finished bookmarks...');
    const finishedCards = page.locator('#finished .bookmark-card');

    if (await finishedCards.count() > 0) {
      const progressBar = finishedCards.first().locator('.progress-bar');
      const progressWidth = await progressBar.evaluate(el => parseFloat(el.style.width));  
      expect(progressWidth).toBe(100);  // Progress should be 100%
      console.log('✅ Finished bookmark has 100% progress.');
    } else {
      console.log('ℹ️ No finished bookmarks available to test.');
    }
  });

  // test('Unread bookmark moves to "Pick up where you left off" after reading', async ({ page }) => {
  //   console.log('Finding the "Web Development with React" bookmark in the Unread section...');
    
  //   const unreadSection = page.locator('#unread');
  //   const targetBookmark = unreadSection.locator('.bookmark-card').filter({ hasText: 'Web Development with React' });

  //   await expect(targetBookmark).toBeVisible();

  //   console.log('Clicking "Read" on the target bookmark...');
  //   await targetBookmark.locator('.start-reading-btn').click();
    
  //   await expect(page).toHaveURL(/resourcedetails2.html\?id=\d+&bookmarkId=\d+/);

  //   console.log('Clicking "Read" button to go to the progress page...');
  //   const readButton = page.locator('#start-reading-button');
  //   await expect(readButton).toBeVisible();
  //   await readButton.click();

  //   await expect(page).toHaveURL(/progressBook2.html\?id=\d+&bookmarkId=\d+&progress=\d+/);

  //   console.log('Scrolling to update progress...');
  //   await page.evaluate(() => {
  //     window.scrollBy(0, window.innerHeight / 2);
  //   });

  //   console.log('Clicking the back arrow to return...');
  //   await page.click('#go-back-arrow');

  //   await page.goto('http://localhost:3001/bookmarks/stateBook2.html');

  //   console.log('Verifying "Web Development with React" is no longer in the "Unread" section...');
  //   await expect(unreadSection.locator('.bookmark-card').filter({ hasText: 'Web Development with React' })).toHaveCount(0);

  //   console.log('Verifying "Web Development with React" is now in "Pick up where you left off" section...');
  //   const readingSection = page.locator('#reading');
  //   await expect(readingSection.locator('.bookmark-card').filter({ hasText: 'Web Development with React' })).toBeVisible();
  // });

  // test('Bookmark moves to "Finished" after reading', async ({ page }) => {
  //   console.log('Finding "Machine Learning 101" in "Pick up where you left off" section...');
    
  //   const readingSection = page.locator('#reading');
  //   const targetBookmark = readingSection.locator('.bookmark-card').filter({ hasText: 'Machine Learning 101' });

  //   await expect(targetBookmark).toBeVisible();

  //   console.log('Clicking "Start Reading" on "Machine Learning 101"...');
  //   await targetBookmark.locator('.start-reading-btn').click();
    
  //   // await expect(page).toHaveURL(/resourcedetails2.html\?id=9&bookmarkId=9/);

  //   console.log('Clicking "Read" button to go to the progress page...');
  //   const readButton = page.locator('#start-reading-button');
  //   await expect(readButton).toBeVisible();
  //   await readButton.click();

  //   // await expect(page).toHaveURL(/progressBook2.html\?id=9&bookmarkId=9&progress=20/);

  //   console.log('Scrolling all the way down to trigger 100% progress...');
  //   await page.evaluate(() => {
  //     window.scrollTo(0, document.body.scrollHeight);
  //   });

  //   console.log('Clicking the back arrow to return...');
  //   await page.click('#go-back-arrow');

  //   // await page.goto('http://localhost:3001/bookmarks/stateBook2.html');
  //   await page.goto('http://localhost:3001/bookmarks/stateBook2.html');

  //   console.log('Verifying "Machine Learning 101" is no longer in "Pick up where you left off" section...');
  //   await expect(readingSection.locator('.bookmark-card').filter({ hasText: 'Machine Learning 101' })).toHaveCount(0);

  //   console.log('Verifying "Machine Learning 101" is now in the "Finished" section...');
  //   const finishedSection = page.locator('#finished');
  //   await expect(finishedSection.locator('.bookmark-card').filter({ hasText: 'Machine Learning 101' })).toBeVisible();
  // });

  // test('Reset Finished bookmark moves it back to Unread with progress 0%', async ({ page }) => {
  //   console.log('Finding "Cloud Computing Essentials" in the Finished section...');
    
  //   const finishedSection = page.locator('#finished');
  //   const targetBookmark = finishedSection.locator('.bookmark-card').filter({ hasText: 'Cloud Computing Essentials' });

  //   await expect(targetBookmark).toBeVisible();

  //   console.log('Clicking "Unread" (Reset) button...');
  //   await targetBookmark.locator('.reset-btn').click();

  //   console.log('Verifying "Cloud Computing Essentials" is no longer in the Finished section...');
  //   await expect(finishedSection.locator('.bookmark-card').filter({ hasText: 'Cloud Computing Essentials' })).toHaveCount(0);

  //   console.log('Verifying "Cloud Computing Essentials" is now in the Unread section...');
  //   const unreadSection = page.locator('#unread');
  //   const unreadBookmark = unreadSection.locator('.bookmark-card').filter({ hasText: 'Cloud Computing Essentials' });

  //   await expect(unreadBookmark).toBeVisible();

  //   console.log('Checking that the progress bar is reset to 0%...');
  //   const progressBar = unreadBookmark.locator('.progress-bar');
  //   await expect(progressBar).toHaveAttribute('style', /width:\s*0%/);

  //   console.log('Test completed successfully!');
  // });


  test('Unread bookmark moves to "Pick up where you left off" after reading', async ({ page }) => {
    console.log('Finding the first unread bookmark...');

    const unreadSection = page.locator('#unread');
    const targetBookmark = unreadSection.locator('.bookmark-card').first();
    
    await expect(targetBookmark).toBeVisible();

    // Extract the title dynamically
    // const bookmarkTitle = await targetBookmark.locator('.bookmark-title').innerText();
   // Extract the title dynamically
const bookmarkTitle = await targetBookmark.locator('h3').innerText();

    console.log(`Selected bookmark: ${bookmarkTitle}`);

    console.log('Clicking "Read" on the target bookmark...');
    await targetBookmark.locator('.start-reading-btn').click();

    
    console.log(`Verifying ${bookmarkTitle}" is no longer in the "Unread" section...`);
    await expect(unreadSection.locator('.bookmark-card').filter({ hasText: bookmarkTitle })).toHaveCount(0);

    console.log(`Verifying ${bookmarkTitle} is now in "Pick up where you left off" section...`);
    const readingSection = page.locator('#reading');
    await expect(readingSection.locator('.bookmark-card').filter({ hasText: bookmarkTitle })).toBeVisible();
});

test('Bookmark moves to "Finished" after reading', async ({ page }) => {
    console.log('Finding the first bookmark in "Pick up where you left off" section...');

    const readingSection = page.locator('#reading');
    const targetBookmark = readingSection.locator('.bookmark-card').first();
    
    await expect(targetBookmark).toBeVisible();

    // Extract the title dynamically
    const bookmarkTitle = await targetBookmark.locator('h3').innerText();
    console.log(`Selected bookmark: ${bookmarkTitle}`);


    console.log('Clicking the "Finished" button in the correct bookmark card...');
    const finishedButton = targetBookmark.locator('.finished-btn'); // Locate the finished button within the specific card
    await expect(finishedButton).toBeVisible(); // Ensure the button is visible
    await finishedButton.click(); // Click the button

    

    await page.goto('http://localhost:3001/bookmarks/stateBook2.html');

    console.log(`Verifying ${bookmarkTitle} is no longer in the "Pick up where you left off" section...`);
    await expect(readingSection.locator('.bookmark-card').filter({ hasText: bookmarkTitle })).toHaveCount(0);

    // console.log(`Verifying ${bookmarkTitle} is now in the "Finished" section...`);
    // const finishedSection = page.locator('#finished');
    // await expect(finishedSection.locator('.bookmark-card').filter({ hasText: bookmarkTitle })).toBeVisible();
});

test('Reset Finished bookmark moves it back to Unread with progress 0%', async ({ page }) => {
    console.log('Finding the first bookmark in the "Finished" section...');

    const finishedSection = page.locator('#finished');
    const targetBookmark = finishedSection.locator('.bookmark-card').first();
    
    await expect(targetBookmark).toBeVisible();

    // Extract the title dynamically
    // const bookmarkTitle = await targetBookmark.locator('.bookmark-title').innerText();
    // Extract the title dynamically
const bookmarkTitle = await targetBookmark.locator('h3').innerText();

    console.log(`Selected bookmark: ${bookmarkTitle}`);

    console.log(`Clicking Unread (Reset) button on ${bookmarkTitle}...`);
    await targetBookmark.locator('.reset-btn').click();

    console.log(`Verifying ${bookmarkTitle} is no longer in the "Finished" section...`);
    await expect(finishedSection.locator('.bookmark-card').filter({ hasText: bookmarkTitle })).toHaveCount(0);

    console.log(`Verifying ${bookmarkTitle} is now in the Unread section...`);
    const unreadSection = page.locator('#unread');
    const unreadBookmark = unreadSection.locator('.bookmark-card').filter({ hasText: bookmarkTitle });

    await expect(unreadBookmark).toBeVisible();

    console.log('Checking that the progress bar is reset to 0%...');
    const progressBar = unreadBookmark.locator('.progress-bar');
    await expect(progressBar).toHaveAttribute('style', /width:\s*0%/);

    console.log('Test completed successfully!');
});
});