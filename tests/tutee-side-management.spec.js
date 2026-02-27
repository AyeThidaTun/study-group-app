const { test, expect } = require('@playwright/test');

test.describe('tutee side Tests ', () => {

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


  });



test('Book a tutor slot and verify pending status', async ({ page }) => {
    // Step 1: Go to the tutor index page
    await page.goto('http://localhost:3001/tutorMatch/tutorIndex.html');
  
    // Step 2: Find the first tutor named "Oliver" and click "View Details"
    const tutorCard = await page.locator('#recommendedTutors .card-title', { hasText: 'Oliver' }).first();
    await tutorCard.locator('..').locator('button', { hasText: 'View Details' }).click();
  
    // Step 3: Verify redirection to tutor details page
    await expect(page).toHaveURL(/tutorDetails.html\?tutorId=\d+/);
  
    // Step 4: Select the second slot (10:00 AM - 1:00 PM)
    const secondSlot = await page.locator('.slots-row .slot').nth(1);
    await secondSlot.click();
  
    // Step 5: Click "Book Slot"
    await page.locator('button', { hasText: 'Book Slot' }).click();
  
    // Step 6: Handle the alert popup
    page.on('dialog', async (dialog) => {
      await dialog.dismiss(); // Dismiss the alert
    });
  
    // Step 7: Navigate to "Your Tutors" page
    await page.goto('http://localhost:3001/tutorMatch/yourTutors.html');
  
    // Step 8: Verify "Oliver" appears under "Pending" with correct time slot
    const pendingSection = await page.locator('h2', { hasText: 'Pending' }).locator('..');
    await expect(pendingSection).toContainText('Oliver');
    await expect(pendingSection).toContainText('Tuesday');
    await expect(pendingSection).toContainText('10:00 AM - 1:00 PM');
  });



test('Check if the display of username and exactly 6 tutor cards in the recommended section', async ({ page }) => {
  // Go to the page
  await page.goto('http://localhost:3001/tutorMatch/tutorIndex.html');

  // Wait for the recommended tutors section to load
  await page.waitForSelector('#recommendedTutors');

  // Wait for tutor cards to be rendered (ensure API has loaded)
  await page.waitForTimeout(2000); // Wait for tutors to be injected

  // Get the count of tutor cards
  const tutorCards = await page.locator('#recommendedTutors .card').count();

  // Expect exactly 6 cards to be present
  expect(tutorCards).toBe(6);

      // Wait for the username span to be loaded
      await page.waitForSelector('#username');

      // Get the text content of the username span
      const usernameText = await page.locator('#username').textContent();
  
      // Expect the username to be "Leo"
      expect(usernameText.trim()).toBe('Leo');
});

test('Should filter tutors by day, subject, and name', async ({ page }) => {
  console.log('Navigating to the all tutors page...');
  await page.goto('http://localhost:3001/tutorMatch/allTutors.html');

  console.log('Applying filters: Monday, Basketball, Alice...');
  // Select Monday in the day filter
  await page.selectOption('#dayFilter', 'Monday');

  // Select Basketball in the subject filter
  await page.selectOption('#subjectFilter', 'Basketball');

  // Click the "Apply Filters" button
  await page.click('#applyFilters');

  console.log('Checking if at least one tutor card is visible...');
  // Expect at least one tutor card to be present
  const tutorCards = page.locator('.tutor-card');
  // await expect(tutorCards).toBeVisible();
  await expect(tutorCards.first()).toBeVisible();


  console.log('Applying filter: Name - Caroline...');
  // Change name filter to "Caroline"
  await page.fill('#nameSearch', 'Caroline');

  // Click the "Apply Filters" button again
  await page.click('#applyFilters');

  console.log('Verifying that "No tutors found." appears...');
  // Expect "No tutors found." text to be visible
  await expect(page.locator('#tutors-list')).toContainText('No tutors found.');

  console.log('Test passed: Filters work correctly.');
});


test('Approved slot appears in the calendar', async ({ page }) => {

  // Step 2: Navigate to the calendar page
  await page.goto('http://localhost:3001/tutorMatch/yourTutors.html');



   // Step 2: Locate the first "Completed" booking card
   const completedCard = await page.locator('.card:has-text("Approved")').first(); // Get the first "Completed" booking
   await expect(completedCard).toBeVisible()

  // Capture details from the Approved card
  const tutorName = await completedCard.locator('.card-title').textContent();
  const status = await completedCard.locator('.card-text:has-text("Status:")').textContent();
  const day = await completedCard.locator('.card-text:has-text("Day:")').textContent();
  const timeSlot = await completedCard.locator('.card-text:has-text("Time:")').textContent();

  // Log the captured details
  console.log(`Tutor Name: ${tutorName}, Status: ${status}, Day: ${day}, Time: ${timeSlot}`);

  // Step 4: Verify the details in the Approved section
  await expect(completedCard).toContainText('Status: Approved');
  await expect(completedCard.locator('.card-text:has-text("Day:")')).toContainText('Day: Monday');
  await expect(completedCard.locator('.card-text:has-text("Time:")')).toContainText('Time: 10:00 AM - 1:00 PM');


    const calendarBookingCard = await page.locator(`.card:has-text('Sophie'):has-text('Time: 10:00 AM - 1:00 PM')`);
  await expect(calendarBookingCard).toBeVisible();

  console.log('Approved slot appears in the calendar.');
  // Step 5: Check if the booking appears in the calendar
//   const calendarBookingCard = await page.locator('.calendar-container .booking-card', { hasText: tutorName }).first();

//   // Check if the booking card in the calendar contains the correct time range
//   await expect(calendarBookingCard).toBeVisible();
//   // await expect(calendarBookingCard.locator('p')).toContainText('10:00 AM - 1:00 PM');
//   const timeInCalendar = await calendarBookingCard.locator('.card-text:has-text("10:00 AM - 1:00 PM")');
// await expect(timeInCalendar).toBeVisible();

});

});
