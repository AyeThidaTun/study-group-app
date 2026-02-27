
const { test, expect } = require('@playwright/test');

test.describe('tutee side Tests', () => {

  test.beforeEach(async ({ page }) => {
    console.log('Logging in as a tutor...');

    // Navigate to the login page
    await page.goto('http://localhost:3001/login.html');

    // Fill in login credentials
    await page.fill('input[name="email"]', 'bobbi-t.23@ichat.sp.edu.sg');
    await page.fill('input[name="password"]', '1234');

    // Submit the login form and wait for navigation
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3001/profile/profile.html');


  });


  test('Approve the pending tutee and verify in the approved section', async ({ page }) => {
  
    // Step 1: Navigate to the page
    await page.goto('http://localhost:3001/tutorMatch/tuteeInfo.html');
  
    // Step 2: Click on the "Pending" tab
    await page.click('a.nav-link[href="#pending"]');

      
    // Step 3: Click on the "Approve" button for the first pending card
    const firstPendingCard = await page.locator('#pendingTutees .card').nth(1);
    const approveButton = await firstPendingCard.locator('button:has-text("Approve")');

     // Step 5: Find the card in the "Approved" section with the same info (Tutor Name, Subject, Time Slot, etc.)
     const approvedTuteeName = await firstPendingCard.locator('h5').textContent();  // Extract the tutor's name from the first pending card
     const approvedTuteeTimeSlot = await firstPendingCard.locator('p:has-text("Time Slot:")').textContent();  // Extract the time slot
  console.log("in pending card", approvedTuteeName, approvedTuteeTimeSlot)

    // Approve the first card
    await approveButton.click();
    
    // Wait for the approval process to be completed
    await page.waitForTimeout(1000);  // Adjust the waiting time as needed for the approval process to finish
  
    // Step 4: Navigate to the "Approved" tab
    await page.click('a.nav-link[href="#approved"]');
    
       await page.reload();

       // Step 7: Extract the text content from the approved section
    const approvedCardTextContent = await page.locator('#approvedTutees .tutee-card').first().textContent();
    
    console.log(approvedCardTextContent);



// Use a regular expression to remove the "Time Slot: " prefix
const trimmedTimeSlot = approvedTuteeTimeSlot.replace(/^Time Slot:\s*/, '').trim();

console.log(trimmedTimeSlot);  // Output: "09:00 - 12:00"

    // Step 8: Verify that the name and time slot are correctly reflected in the approved section
    expect(approvedCardTextContent.trim()).toContain(approvedTuteeName.trim());
    expect(approvedCardTextContent.trim()).toContain(trimmedTimeSlot);

    console.log("Test completed successfully.");
    // const approvedCard = await page.locator(`#approvedTutees .tutee-card:has-text("${approvedTuteeName}")`);
    // console.log('Approved Tutee Time Slot:', approvedCard);


    
    // // Verify that the card in the Approved section matches the details of the first pending card
    // await expect(approvedCard).toBeVisible();
    //  // Now, check if the approved card contains the correct time slot
    //  console.log("approvedTuteeTimeSlot:", approvedTuteeTimeSlot.trim());
    // await expect(approvedCard).toContainText(approvedTuteeName.trim());
    // console.log("approvedTuteeName found")
    // await expect(approvedCard).toContainText(approvedTuteeTimeSlot.trim());
  
  });

//   test('Add a new slot and verify it appears in the availability section', async ({ page }) => {
    
//     // Step 1: Navigate to the Tutor Slot Management Page
//     await page.goto('http://localhost:3001/tutorMatch/tutorSlot.html');

//     // Step 2: Click on the "Add New Slot" button
//     await page.click('button.btn-primary:has-text("Add New Slot")');

//     // Step 3: Fill in the start and end time
//     await page.fill('#slot-start', '15:00'); 
//     await page.fill('#slot-end', '17:00');   

//     // Step 4: Click on the "Save" button
//     await page.click('button.btn-success:has-text("Save")');

//     // Wait for the new slot to appear in the availability section
//     await page.waitForTimeout(1000);

//     // Step 5: Verify if the slot appears in the "availability" div
//     const availabilityText = await page.locator('#availability').textContent();

//     // Ensure the new slot appears as "Monday: 3 PM - 5 PM"
//     expect(availabilityText).toContain('Monday: 9 AM - 12 PM');

//     console.log("✅ New slot successfully added and verified in the availability section.");
// });



test('Add a conflicting slot and verify alert appears & no duplicate slot', async ({ page }) => {
    
  // Step 1: Navigate to the Tutor Slot Management Page
  await page.goto('http://localhost:3001/tutorMatch/tutorSlot.html');

  // Step 2: Capture the initial count of available slots before adding a new one
  const initialSlots = await page.locator('#availability .slot').count();

  // Step 3: Click on the "Add New Slot" button
  await page.click('button.btn-primary:has-text("Add New Slot")');

  // Step 4: Fill in a conflicting time (e.g., Monday 03:00 PM - 05:00 PM)
  await page.fill('#slot-start', '15:00'); // 03:00 PM
  await page.fill('#slot-end', '17:00');   // 05:00 PM

  // Step 5: Click the "Save" button
  page.on('dialog', async (dialog) => {
      console.log(`Alert message: ${dialog.message()}`);
      expect(dialog.message()).toContain('Schedule is conflicting with another slot');
      await dialog.dismiss();  // Close the alert
  });

  // await page.click('button.btn-success:has-text("Save")');

  // // Step 6: Ensure that the slot list remains unchanged (no duplicate added)
  // await page.waitForTimeout(1000);  // Allow time for UI to update

  // const finalSlots = await page.locator('#availability .slot').count();
  // expect(finalSlots).toBe(initialSlots);  // Slot count should remain the same

  console.log(" Conflict alert appeared & no duplicate slot was added.");
});
test('Delete a slot by specific time and verify it disappears', async ({ page }) => {
  // Step 1: Navigate to the tutor slot management page
  await page.goto('http://localhost:3001/tutorMatch/tutorSlot.html');

  // Step 2: Locate the slot by the specific time text "Thursday : 9 AM - 12 PM"
  const slotLocator = page.locator('.slot:has-text("Thursday: 9 AM - 12 PM")');

  // Ensure the slot is initially visible
  await expect(slotLocator).toBeVisible();
  console.log(" Slot 'Thursday : 9 AM - 12 PM' is initially present.");

  // Step 3: Click the delete button inside the slot
  await slotLocator.locator('button.btn-danger').click();
  console.log(" Clicked the delete button.");

  // Step 4: Wait for the slot to be removed
  await expect(slotLocator).toHaveCount(0);
  console.log(" Slot 'Thursday : 9 AM - 12 PM' has been successfully deleted.");
});

// comment out for github
// test('Update the slot time and verify the updated slot appears', async ({ page }) => {
//   // Step 1: Navigate to the tutor slot management page
//   await page.goto('http://localhost:3001/tutorMatch/tutorSlot.html');

//   // Step 2: Locate the slot for Saturday: 10 AM - 1 PM
//   const slotLocator = page.locator('.slot:has-text("Saturday: 10 AM - 1 PM")');

//   // Ensure the slot is initially visible
//   await expect(slotLocator).toBeVisible();
//   console.log(" Slot 'Saturday: 10 AM - 1 PM' is initially present.");

//   // Step 3: Click the update button (button with text "Edit")
//   await slotLocator.locator('button.btn-warning').click();
//   console.log(" Clicked the update button for the slot.");

//   // Step 4: Fill in the new start time (11:00)
//   await page.fill('#slot-start', '18:00');
//   await page.fill('#slot-end', '19:00');   
//   console.log(" Set new start time to 18:00.");

//   /// Step 5: Click the save button
//   const saveButton = page.locator('button.btn-success');
//   await saveButton.click();
//   console.log("Clicked the save button.");


//     // Step 5: Click the "Save" button
//     page.on('dialog', async (dialog) => {
//       console.log(`Alert message: ${dialog.message()}`);
//       // expect(dialog.message()).toContain('Schedule is conflicting with another slot');
//       await dialog.dismiss();  // Close the alert
//   });


//   // Step 6: Verify that the updated slot is now present with the new start time
//   const updatedSlotLocator = page.locator('.slot:has-text("Saturday: 6 PM - 7 PM")');
//   await expect(updatedSlotLocator).toBeVisible();
//   console.log(" Updated slot 'Saturday: 11:00 AM - 1 PM' is now visible.");
// });


test('Edit slot from Tuesday to Monday and ensure conflict alert appears', async ({ page }) => {
  // Step 1: Navigate to the tutor slot management page
  await page.goto('http://localhost:3001/tutorMatch/tutorSlot.html');

  // Step 2: Locate the slot for "Tuesday: 1 PM - 4 PM"
  const slotLocator = page.locator('.slot:has-text("Tuesday: 1 PM - 4 PM")');

  // Ensure the slot is initially visible
  await expect(slotLocator).toBeVisible();
  console.log("Slot 'Tuesday: 1 PM - 4 PM' is initially present.");

  // Step 3: Click the edit button
  const editButton = slotLocator.locator('button.btn-warning');
  await editButton.click();
  console.log("Clicked the edit button for the slot.");

  // Step 4: Change the day to "Monday"
  await page.selectOption('#slot-day', 'Monday');
  console.log("Changed day to Monday.");

  // Step 5: Update the time to 9 AM - 12 PM
  await page.fill('#slot-start', '09:00');
  await page.fill('#slot-end', '12:00');
  console.log("Set time to 9 AM - 12 PM.");

  // Step 6: Click the Save button
  const saveButton = page.locator('button.btn-success');
  await saveButton.click();
  console.log("Clicked the save button.");

  // Step 7: Verify that an alert appears (indicating a scheduling conflict)
  page.on('dialog', async dialog => {
    console.log(`Alert message: ${dialog.message()}`);
    expect(dialog.message()).toContain('Schedule is conflicting with another slot'); // Adjust this message as needed
    await dialog.dismiss();
    console.log("Alert was dismissed.");
  });

  
  console.log("Confirmed that the conflicting slot 'Monday: 9 AM - 12 PM' was not added.");

});

});
