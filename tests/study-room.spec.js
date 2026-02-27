const { test, expect } = require("@playwright/test");
const { Router } = require("express");
const updateFeedbackStates = require('../src/models/updateFeedbackStates.model');
const prisma = require("../src/models/prismaClient");

const apiUrl = "."; // Adjust this if your API is hosted elsewhere
const USER_ID = "20"; // Mock userId for logged-in user

test.describe("Study Room Features", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and reset mocks before each test
    await page.goto("http://localhost:3001");
    await page.evaluate(() => localStorage.clear());

    console.log("Logging in as a user...");
    await page.goto("http://localhost:3001/login.html");
    await page.fill("#email", "leo.23@ichat.sp.edu.sg");
    await page.fill("#password", "1234");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("http://localhost:3001/profile/profile.html");
    const userId = await page.evaluate(() => localStorage.getItem("userId"));
    console.log("userId retrieved from localStorage:", userId);
    expect(userId).toBe(USER_ID);
  });

  test("Should populate filter dropdown with room types", async ({ page }) => {
    await page.goto("http://localhost:3001/studyRoom/studyRoom.html");
    
    await page.waitForTimeout(3000);
    // Wait for the dropdown to be populated
    const options = await page.locator("#roomTypeFilter option");

    const optionCount = await options.count();
    console.log("option count: ", optionCount);
    // Check that at least one option exists (and the default "All" option)
    expect(optionCount).toBe(6);

    // Check that the first option is "All"
    const firstOption = await options.nth(0).textContent();
    expect(firstOption).toBe("All");
  });

  test('Should display all rooms when "All" is selected', async ({ page }) => {
    await page.goto("http://localhost:3001/studyRoom/studyRoom.html");
  
    await page.waitForTimeout(10000);
  
    // Trigger the filtering by selecting the "All" option
    await page.selectOption("#roomTypeFilter", "all");
  
    // Wait for the rooms to be populated
    await page.waitForSelector("#studyRoomContainer tr", { timeout: 15000 });
  
    // Get the rows inside the studyRoomContainer
    const rows = await page.locator("#studyRoomContainer tr");
    const rowCount = await rows.count();
    console.log("Row count:", rowCount);
  
    // Assert that the rooms are displayed
    expect(rowCount).toBe(20); // Ensure rooms are shown
  });
  
  test("Should display filtered rooms when a specific room type is selected", async ({
    page,
  }) => {
    await page.goto("http://localhost:3001/studyRoom/studyRoom.html");
  
    await page.waitForTimeout(10000);
  
    // Trigger the filtering by selecting a specific room type
    const roomType = "2-person"; // Example room type
    await page.selectOption("#roomTypeFilter", roomType);
  
    // Wait for the rooms to be populated
    await page.waitForSelector("#studyRoomContainer tr", { timeout: 15000 });
  
    // Get the rows inside the studyRoomContainer
    const rows = await page.locator("#studyRoomContainer tr");
    const rowCount = await rows.count();
    console.log("Row count:", rowCount);
  
    expect(rowCount).toBe(4);
  
    // Check that all displayed rooms have the correct room type
    const rooms = await rows.allTextContents();
    rooms.forEach((room) => {
      expect(room).toContain(roomType);
    });
  
    // Optionally check if no rooms are shown for an invalid filter
    if (rowCount === 0) {
      expect(await page.locator("td").textContent()).toBe(
        "No rooms available for the selected type."
      );
    }
  });
  

  test('Should redirect to the calendar page and store roomId in localStorage when "View Slots" is clicked', async ({
    page,
  }) => {
    // Navigate to the study room page
    await page.goto("http://localhost:3001/studyRoom/studyRoom.html");

    // Get a specific roomId for the test (you can use the first room in the list, for example)
    const roomId = await page
      .locator('button:has-text("View Slots")')
      .first()
      .evaluate((button) => {
        // Extract the roomId from the button's onclick attribute
        const onclick = button.getAttribute("onclick");
        const roomIdMatch = onclick.match(/viewRoomDetails\((\d+)\)/);
        return roomIdMatch ? roomIdMatch[1] : null;
      });

    console.log("roomId clicked:", roomId);

    // Click the "View Slots" button for the first room (this will use the roomId dynamically)
    const viewSlotsButton = await page.locator(
      `button[onclick="viewRoomDetails(${roomId})"]`
    );
    await viewSlotsButton.click();

    // Wait for the page to redirect to the calendar page
    await expect(page).toHaveURL(
      "http://localhost:3001/studyRoom/studyRoomSlots.html"
    );

    // Check if roomId is stored in localStorage
    const storedRoomId = await page.evaluate(() =>
      localStorage.getItem("roomId")
    );
    console.log("roomId retrieved from localStorage:", storedRoomId);

    // Validate that roomId is stored in localStorage
    expect(storedRoomId).toBe(roomId);

    // Wait for the calendar to render
    await page.waitForSelector("#calendar", { timeout: 5000 });

    // Check if the calendar element exists on the page
    const calendarExists = await page.locator("#calendar").isVisible();
    expect(calendarExists).toBe(true);
  });

  test("Should open the modal for future dates", async ({ page }) => {
    // Navigate to the study room page
    await page.goto("http://localhost:3001/studyRoom/studyRoom.html");

    // Get a specific roomId for the test (you can use the first room in the list, for example)
    const roomId = await page
      .locator('button:has-text("View Slots")')
      .first()
      .evaluate((button) => {
        // Extract the roomId from the button's onclick attribute
        const onclick = button.getAttribute("onclick");
        const roomIdMatch = onclick.match(/viewRoomDetails\((\d+)\)/);
        return roomIdMatch ? roomIdMatch[1] : null;
      });

    console.log("roomId clicked:", roomId);

    // Click the "View Slots" button for the first room (this will use the roomId dynamically)
    const viewSlotsButton = await page.locator(
      `button[onclick="viewRoomDetails(${roomId})"]`
    );
    await viewSlotsButton.click();

    // Wait for the page to redirect to the calendar page
    await expect(page).toHaveURL(
      "http://localhost:3001/studyRoom/studyRoomSlots.html"
    );

    // Click on a future date (ensure the date is in the future)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2); // Move two days ahead
    const futureDateStr = futureDate.toISOString().split("T")[0]; // Format to YYYY-MM-DD

    const futureDateElement = await page.locator(
      `[data-date="${futureDateStr}"]`
    );
    console.log("element: ", futureDateElement);
    await futureDateElement.click();

    // Check if the modal appears for future dates
    const modal = await page.locator("#roomModal");
    await expect(modal).toBeVisible();

    // Check that the selected date is displayed in the modal
    const selectedDate = await page.locator("#roomsContainer h5").textContent();
    expect(selectedDate).toContain(futureDateStr);
  });

  test("Should show an error alert for past dates", async ({ page }) => {
    await page.goto("http://localhost:3001/studyRoom/studyRoom.html");

    const roomId = await page
      .locator('button:has-text("View Slots")')
      .first()
      .evaluate((button) => {
        const onclick = button.getAttribute("onclick");
        const roomIdMatch = onclick.match(/viewRoomDetails\((\d+)\)/);
        return roomIdMatch ? roomIdMatch[1] : null;
      });

    console.log("roomId clicked:", roomId);

    const viewSlotsButton = await page.locator(
      `button[onclick="viewRoomDetails(${roomId})"]`
    );
    await viewSlotsButton.click();

    await expect(page).toHaveURL(
      "http://localhost:3001/studyRoom/studyRoomSlots.html"
    );

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    const pastDateStr = pastDate.toISOString().split("T")[0];
    console.log("past date: ", pastDateStr);
    const pastDateElement = await page.locator(`[data-date="${pastDateStr}"]`);
    await page.evaluate(() => {
      document.querySelectorAll(".fc-day-past").forEach((pastDateElement) => {
        pastDateElement.style.pointerEvents = "auto";
      });
    });

    await page.waitForTimeout(2000); // Debugging delay
    await pastDateElement.scrollIntoViewIfNeeded();
    
    const isVisible = await pastDateElement.isVisible();
    console.log("Is the past date element visible now? ", isVisible);
    const isEnabled = await pastDateElement.isEnabled();

    if (!isVisible) {
      throw new Error("Past date element is not visible, test is invalid.");
    }

    if (!isEnabled) {
      throw new Error("Past date element is not enabled, test is invalid.");
    }

    const dialogPromise = new Promise((resolve) => {
        page.on("dialog", (dialog) => {
          console.log("Dialog message:", dialog.message());
          resolve(dialog);
        });
    });
    await pastDateElement.scrollIntoViewIfNeeded();
    const pastDateHandle = await pastDateElement.elementHandle();
    await page.evaluate(el => el.style.pointerEvents = "auto", pastDateHandle);
    console.log("Clicking the past date element");
    await pastDateElement.click({ force: true, noWaitAfter: true });
    console.log("Click action completed!");
    
    const alertText = await dialogPromise;
    expect(alertText.message()).toBe("You cannot book past dates.");
    await alertText.dismiss();
  });
});

test.describe("Booking and Feedback Tests", () => {
  // Cleanup before each test case
  test.beforeEach(async () => {
    // Cleanup any previous bookings before each test run
    await prisma.booking.deleteMany({});
    // You can also clean up any other relevant data here
  });

  test("Should successfully book a room and give feedback", async ({ page }) => {
  // Navigate to the study room page
  await page.goto("http://localhost:3001/studyRoom/studyRoom.html");
  console.log('useid fetched: ', USER_ID);
  // Get a specific roomId for the test
  const roomId = await page
    .locator('button:has-text("View Slots")')
    .first()
    .evaluate((button) => {
      const onclick = button.getAttribute("onclick");
      const roomIdMatch = onclick.match(/viewRoomDetails\((\d+)\)/);
      return roomIdMatch ? roomIdMatch[1] : null;
    });

  // console.log("roomId clicked:", roomId);

  // Click the "View Slots" button for the selected room
  const viewSlotsButton = await page.locator(
    `button[onclick="viewRoomDetails(${roomId})"]`
  );
  await viewSlotsButton.click();

  // Wait for the page to redirect to the slots page
  await expect(page).toHaveURL("http://localhost:3001/studyRoom/studyRoomSlots.html");

  /* 
  ////////////////////////////////////////
  Booking a study room Stage
  ///////////////////////////////////////
  */

  // Select a future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 3);
  console.log('date: ', futureDate);
  const futureDateStr = futureDate.toISOString().split("T")[0];

  const futureDateElement = await page.locator(`[data-date="${futureDateStr}"]`);
  await futureDateElement.click();

  // Wait for the modal to appear
  const modal = await page.locator("#roomModal");
  await expect(modal).toBeVisible();

  // Select a time slot
  const timeSlotRadio = await page.locator('input[name="slotSelection"]:not([disabled])').first();
  await timeSlotRadio.click();

  // Click the book button
  const bookButton = await page.locator("#bookRoomButton");
  await bookButton.click();

  /* 
  ////////////////////////////////////////
  Confirm Booking Stage
  ///////////////////////////////////////
  */

  // Wait for the study group selection page to load
  await expect(page).toHaveURL("http://localhost:3001/studyRoom/studyRoomBooking.html");

  await page.evaluate(() => {
    localStorage.setItem("userId", "20");
  });
  await page.reload();

  // Wait for study groups to load in the UI
  await page.waitForSelector("#studyGroupContainer .card", { timeout: 100000 });

  // Select the first available study group card's "Select" button
  const selectGroupButton = await page.locator("#studyGroupContainer .btn").first();
  await selectGroupButton.click();

  // Wait for the confirmation modal to appear
  const confirmationModal = await page.locator('#confirmationModal');
  await expect(confirmationModal).toBeVisible();

  // Click the confirm button
  const confirmButton = await page.locator('#confirmBookingBtn');
  await confirmButton.click();

  // Wait for the notification to appear
  const notification = await page.locator("#bookingNotification");
  await expect(notification).toBeVisible();

  console.log('Study room successfully booked!');

  // Click on the "Confirm booking here" link
  const confirmBookingLink = await page.locator('#bookingNotification a');
  await confirmBookingLink.click();

  await expect(page).toHaveURL("http://localhost:3001/booking/bookedStudyRooms.html");

  // Click the confirm button
  const confirmBookingBtn = await page.locator('.confirm-booking').first();
  await confirmBookingBtn.click();

  // Wait for the confirmation modal to appear
  const confirmBookingModal = await page.locator('#confirmBookingModal');
  await expect(confirmBookingModal).toBeVisible();

  // Step 2: Fill in the confirmation form
  await page.fill('input#userName', 'John Doe');  
  await page.fill('input#userPhone', '1234567890'); 
  
  const dialogPromise = new Promise((resolve) => {
    page.on("dialog", (dialog) => {
      console.log("Dialog message:", dialog.message());
      resolve(dialog);
    });
  });

  // Click the confirm booking button
  const confirmBookingButton = await page.locator('#confirmBookingButton');
  await confirmBookingButton.click(); 
  
  const alertText = await dialogPromise;
  expect(alertText.message()).toBe("Booking confirmed successfully!");
  await alertText.dismiss();
  
  console.log('Booking confirmed successfully!')

  /* 
  ////////////////////////////////////////
  Filling feedback form stage
  ///////////////////////////////////////
  */

  // Step 1: Store Original Date Constructor
  const originalDate = global.Date;

  // Step 2: Override Date to Simulate Future Date
  const testFutureDate = new Date();
  testFutureDate.setDate(testFutureDate.getDate() + 4);
  console.log('test future date: ', testFutureDate);

  global.Date = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        return new originalDate(testFutureDate);
      }
      return new originalDate(...args);
    }
  };

  // Step 3: Run Cron Job to Update Feedback State
  await updateFeedbackStates();

  // Step 4: Navigate to the Feedback Page
  await page.goto("http://localhost:3001/feedback/feedback.html");

  await expect(page).toHaveURL("http://localhost:3001/feedback/feedback.html");


  // Step 5: Click on the "Pending Feedback" tab
  console.log("Waiting for #pending-tab to be visible");
  await page.waitForSelector("#pending-tab", { timeout: 10000 });
  const pendingFeedbackTab = await page.locator("#pending-tab");
  console.log("Element #pending-tab is visible, clicking now...");
  await pendingFeedbackTab.click();


  // Wait for pending feedbacks to load
  await page.waitForSelector("#pendingFeedbackList .btn", { timeout: 10000 });

  // Step 6: Click "Give Feedback" on the first pending feedback
  const giveFeedbackButton = await page.locator("#pendingFeedbackList .btn").first();
  await giveFeedbackButton.click();

  // Step 7: Verify Feedback Form Opens
  await expect(page).toHaveURL("http://localhost:3001/feedback/feedbackForm.html");

  console.log("Navigated to feedback form successfully!");

  // Wait for the group name to be loaded
  await page.waitForSelector('#groupName', { timeout: 5000 });
  const groupName = await page.locator('#groupName').innerText();
  expect(groupName).not.toBe(''); // Ensure group name is populated

  // Wait for at least one comment field to appear before proceeding
  await page.waitForSelector('textarea[id^="comments_"]', { timeout: 5000 });

  // Get all comment fields
  const members = await page.locator('textarea[id^="comments_"]').all();

  for (const member of members) {
    const memberId = await member.getAttribute("id"); // e.g., "comments_3"
    const userId = memberId.split("_")[1]; // Extract userId (e.g., "3")

    // Fill in comments
    await page.locator(`textarea#comments_${userId}`).fill("Great teamwork!");

    // Ensure the rating fields exist before interacting with them
    await page.waitForSelector(`input[name="ratings_${userId}_contributions"][value="5"]`);
    await page.waitForSelector(`input[name="ratings_${userId}_teamwork"][value="4"]`);
    await page.waitForSelector(`input[name="ratings_${userId}_knowledge"][value="3"]`);

    // Select ratings for contributions, teamwork, and knowledge
    await page.locator(`input[name="ratings_${userId}_contributions"][value="5"]`).check();
    await page.locator(`input[name="ratings_${userId}_teamwork"][value="4"]`).check();
    // Wait for the element to be visible
    const knowledgeRadio = page.locator(`input[name="ratings_${userId}_knowledge"][value="3"]`);
    await knowledgeRadio.waitFor({ state: 'visible', timeout: 60000 });

    // Check if the element is enabled before clicking
    const isEnabled = await knowledgeRadio.isEnabled();
    if (isEnabled) {
      await knowledgeRadio.check({ timeout: 60000 });
    } else {
      console.log('Radio button is not enabled yet');
    }
  }


  const dialogPromise2 = new Promise((resolve) => {
    page.on("dialog", (dialog) => {
      // console.log("Dialog message:", dialog.message());
      resolve(dialog);
    });
  });

  // Submit the form
  await page.click('button[type="submit"]');

  const alertConfimationText = await dialogPromise2;
  expect(alertConfimationText.message()).toBe("Feedback submitted successfully!");
  await alertConfimationText.dismiss();

  // Ensure redirection after submission
  await page.waitForURL('http://localhost:3001/feedback/feedback.html');
  expect(page.url()).toBe('http://localhost:3001/feedback/feedback.html');

  console.log('Feedback form submitted successfully!');
});
});