const { test, expect } = require('@playwright/test');

test.describe('Q&A Management Features', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login.html');
    await page.fill('#email', 'leo.23@ichat.sp.edu.sg');
    await page.fill('#password', '1234');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3001/profile/profile.html');
    await page.goto('http://localhost:3001/QnA/index.html');
  });

  test.describe('Question Creation', () => {

    test('should display an error if question title is missing', async ({ page }) => {
        await page.goto('http://localhost:3001/QnA/index.html');
        await page.fill('#question-content', 'Test Content');
        await page.selectOption('#school-dropdown', '1');
        await page.selectOption('#module-dropdown', 'ST0510');
        await page.click('button:has-text("Post Question")');
        await expect(page.locator('#question-title:invalid')).toBeVisible();
    });

    test('should display an error if question content is missing', async ({ page }) => {
        await page.goto('http://localhost:3001/QnA/index.html');
        await page.fill('#question-title', 'Test Question');
        await page.selectOption('#school-dropdown', '1');
        await page.selectOption('#module-dropdown', 'ST0510');
        await page.click('button:has-text("Post Question")');
        await expect(page.locator('#question-content:invalid')).toBeVisible();
    });
  
    test('should create a question with special characters in the content', async ({ page }) => {
        const specialChars = '!@#$%^&*()_+=-`~[]\{}|;\':",./<>?';
        await page.fill('#question-title', 'Special Chars');
        await page.fill('#question-content', specialChars);
        await page.selectOption('#school-dropdown', '1');
        await page.selectOption('#module-dropdown', 'ST0510');
        await page.click('button:has-text("Post Question")');
        await expect(page.locator('#questions-container')).toContainText(specialChars);
    });

    test('should handle a question with empty file path', async ({ page }) => {
        await page.fill('#question-title', 'File Question');
        await page.fill('#question-content', 'Test Content');
        await page.selectOption('#school-dropdown', '1');
        await page.selectOption('#module-dropdown', 'ST0510');
        await page.click('button:has-text("Post Question")');
        await expect(page.locator('#questions-container')).toContainText('File Question');
    });

    // comment out for github
    // test('should handle special characters in question content', async ({ page }) => {
    //     await page.goto('http://localhost:3001/QnA/index.html');
    //     const specialCharsContent = 'This is a question with special characters: !@#$%^&*()_+=-`~[]\{}|;\':",./<>?';
    //     await page.fill('#question-title', 'Special Chars');
    //     await page.fill('#question-content', specialCharsContent);
    //     await page.selectOption('#school-dropdown', '1');
    //     await page.selectOption('#module-dropdown', 'ST0510');
    //     await page.click('button:has-text("Post Question")');
    //     await expect(page.locator('#questions-container')).toContainText(specialCharsContent);
    // });
  
  });

  test.describe('Question Filtering and Sorting', () => {

    test('should filter questions by search term in title', async ({ page }) => {
      await page.fill('#search-input', 'Test');
      await page.click('button:has-text("Search")');
      await expect(page.locator('#questions-container')).toContainText('Test');
    });

    test('should filter questions by search term in content', async ({ page }) => {
      await page.fill('#search-input', 'Content');
      await page.click('button:has-text("Search")');
      await expect(page.locator('#questions-container')).toContainText('Content');
    });
  
    test('should filter questions by status (ARCHIVED)', async ({ page }) => {
        await page.goto('http://localhost:3001/QnA/index.html');
        await page.selectOption('#status-filter', 'ARCHIVED');
        await page.click('button:has-text("Search")');
        await expect(page.locator('.badge.bg-secondary')).toContainText('Archived');
    });

    test('should sort questions by most popular (likes)', async ({ page }) => {
        await page.goto('http://localhost:3001/QnA/index.html');
        await page.selectOption('#sort-by', 'most-popular');
        await page.click('button:has-text("Sort")');
         const likes = await page.locator('.question .like-count').allTextContents();
         const numericLikes = likes.map(Number);
         await expect(numericLikes).toEqual([...numericLikes].sort((a, b) => b - a));
    });
  
    test('should sort questions by least popular (likes)', async ({ page }) => {
        await page.goto('http://localhost:3001/QnA/index.html');
        await page.selectOption('#sort-by', 'least-popular');
        await page.click('button:has-text("Sort")');
        const likes = await page.locator('.question .like-count').allTextContents();
        const numericLikes = likes.map(Number);
        await expect(numericLikes).toEqual([...numericLikes].sort((a, b) => a - b));
    });
  

    test('should display all questions when no filters are applied', async ({ page }) => {
      await page.click('button:has-text("Search")'); //Click search without any filter
      await expect(page.locator('#questions-container')).toBeVisible();
    });

    test('should handle no search results gracefully', async ({ page }) => {
      await page.fill('#search-input', 'nonexistentsearchterm');
      await page.click('button:has-text("Search")');
      await expect(page.locator('#questions-container')).toBeEmpty();
    });

    test('should render the filters', async ({ page }) => {
        await expect(page.locator('#module-filter')).toBeVisible();
        await expect(page.locator('#status-filter')).toBeVisible();
    });

    test('should increment like count when liking a question', async ({ page }) => {
        const initialLikes = parseInt(await page.locator('#like-count-1').first().textContent());
        await page.click('#like-btn-1');
        await expect(page.locator('#like-count-1').first()).toContainText((initialLikes + 1).toString());
    });
  });

  test.describe('Accessibility', () => {

    test('should prevent unauthorized question edits', async ({ page }) => {
        await page.goto('http://localhost:3001/login.html');
        await page.fill('#email', 'grace.23@ichat.sp.edu.sg');
        await page.fill('#password', '1234');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('http://localhost:3001/profile/profile.html');
        await page.goto('http://localhost:3001/QnA/index.html');
      await expect(page.locator('button:has-text("Edit")')).toBeHidden();
    });
    
    test('should restrict answer deletion to owner', async ({ page }) => {
        await page.goto('http://localhost:3001/login.html');
        await page.fill('#email', 'grace.23@ichat.sp.edu.sg');
        await page.fill('#password', '1234');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('http://localhost:3001/profile/profile.html');
        await page.goto('http://localhost:3001/QnA/index.html');
      await expect(page.locator('button:has-text("Delete")')).toBeHidden();
    });

    test('should have sufficient color contrast', async ({ page }) => {
        await page.goto('http://localhost:3001/QnA/index.html');
        const postQuestionButton = await page.$('button:has-text("Post Question")');
        const backgroundColor = await postQuestionButton.evaluate((button) => {
          return window.getComputedStyle(button).backgroundColor;
        });
        const color = await postQuestionButton.evaluate((button) => {
          return window.getComputedStyle(button).color;
        });
    });

    test('should prevent XSS in question content', async ({ page }) => {
        const xssPayload = '<script>alert("XSS")</script>';
        await page.fill('#question-content', xssPayload);
        await page.click('button:has-text("Post Question")');
        await expect(page.locator('.question-content').first()).not.toContainText('<script>');
    });

  });

});
