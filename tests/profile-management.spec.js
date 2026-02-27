// @ts-check
const { test, expect } = require('@playwright/test');

// Test constants
const API_URL = 'http://localhost:3001';
const USER_ID = '19'; // Actual test user ID

// Helper to log in before each test
test.beforeEach(async ({ page }) => {
    console.log('Logging in as a user...');
    await page.goto(`${API_URL}/login.html`);
    await page.fill('#email', 'zara.23@ichat.sp.edu.sg'); // Regular user email
    await page.fill('#password', 'Password123!'); // Regular user password
    await page.click('button[type="submit"]');

    // Confirm redirection to profile page
    await expect(page).toHaveURL(`${API_URL}/profile/profile.html`);

    // Verify userId is set in localStorage
    const userId = await page.evaluate(() => localStorage.getItem('userId'));
    console.log('userId retrieved from localStorage:', userId);
    expect(userId).toBe(USER_ID);
});

// Test: Update avatar successfully
test('Update avatar successfully', async ({ page }) => {
    // Open the modal by clicking the avatar image
    await page.click('.profile-image');  // Click the avatar image

    // Close the modal by clicking the close button
    await page.click('.close');  // Close the modal by clicking the close button

    // Open the modal again by clicking the plus icon
    await page.click('.plus-icon');  // Click the plus icon to open the modal again

    // Wait for the modal to be visible
    await expect(page.locator('#avatarModal')).toBeVisible();

    // Select an avatar image from the modal
    await page.click('img[src="../images/avatar_014.png"]');  // Adjust the image source or other selectors as necessary

    // Click the save button to confirm the avatar selection
    await page.click('#save-avatar-btn');

    // Wait for the image to be updated
    const updatedAvatar = page.locator('.profile-image');
    await expect(updatedAvatar).toHaveAttribute('src', '../images/avatar_014.png');  // Ensure the image source is updated
});



// Test: Update user field (name)
test('Update name successfully', async ({ page }) => {
    // Click the "Update" button for the "Name" field using text content
    await page.click('tr:has(td:has-text("Name")) button:has-text("Update")');  // Find the correct row and button by text

    await page.fill('#updateInput', 'New Name'); // Enter the new name
    await page.click('#saveChangesButton'); // Save changes

    // Expect a success message in the alert modal
    await expect(page.locator('#alertModalBody')).toHaveText('Name updated successfully!');
});

// Test: Update user field (name) with various cases
test('Update name with valid and invalid inputs', async ({ page }) => {
    // Click the "Update" button for the "Name" field using text content
    await page.click('tr:has(td:has-text("Name")) button:has-text("Update")'); // Find the correct row and button by text

    // Test Case 1: Enter nothing and submit
    await page.fill('#updateInput', ''); // Leave the input empty
    await page.click('#saveChangesButton'); // Try to save changes
    await expect(page.locator('#alertModalBody')).toHaveText('Please enter a valid name.'); // Verify error message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Hide the alert modal by clicking "OK"

    // Test Case 2: Enter a name with numbers and submit
    await page.fill('#updateInput', 'John123'); // Enter a name with numbers
    await page.click('#saveChangesButton'); // Try to save changes
    await expect(page.locator('#alertModalBody')).toHaveText(
        'Names can only contain alphabets and spaces.'
    ); // Verify error message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Hide the alert modal by clicking "OK"

    // Test Case 3: Enter a name with special characters and submit
    await page.fill('#updateInput', 'John@Doe'); // Enter a name with special characters
    await page.click('#saveChangesButton'); // Try to save changes
    await expect(page.locator('#alertModalBody')).toHaveText(
        'Names can only contain alphabets and spaces.'
    ); // Verify error message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Hide the alert modal by clicking "OK"

    // Test Case 4: Enter a valid name and submit
    await page.fill('#updateInput', 'John Doe'); // Enter a valid name
    await page.click('#saveChangesButton'); // Save changes
    await expect(page.locator('#alertModalBody')).toHaveText('Name updated successfully!'); // Verify success message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Hide the alert modal by clicking "OK"
});


// Test: Update academic level with validation
test('Update academic level with validation', async ({ page }) => {
    // Click the "Update" button for the "Academic Level" field using text content
    await page.click('tr:has(td:has-text("Academic Level")) button:has-text("Update")'); // Find the correct row and button by text

    // Test Case 1: Attempt to submit without selecting an academic level
    await page.click('#saveChangesButton'); // Try saving without selecting an academic level
    await expect(page.locator('#alertModalBody')).toHaveText('Please select an academic level.'); // Verify error message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Close the alert modal

    // Test Case 2: Select an academic level and submit
    await page.check('input[name="academicLevel"][value="PFP"]'); // Select academic level
    await page.click('#saveChangesButton'); // Save changes
    await expect(page.locator('#alertModalBody')).toHaveText('AcademicLevel updated successfully!'); // Verify success message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Close the alert modal
});


// Test: Update bio with validation
test('Update bio with validation', async ({ page }) => {
    // Click the "Update" button for the "Bio" field using text content
    await page.click('tr:has(td:has-text("Bio")) button:has-text("Update")'); // Find the correct row and button by text

    // Test Case 1: Attempt to submit without entering a bio
    await page.fill('#updateInput', ''); // Leave the bio input empty
    await page.click('#saveChangesButton'); // Try saving with an empty bio
    await expect(page.locator('#alertModalBody')).toHaveText('Please enter a valid bio.'); // Verify error message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Close the alert modal

    // Test Case 2: Enter a valid bio and submit
    await page.fill('#updateInput', "I'm just a chill guy ʕ·ᴥ·ʔ"); // Enter the new bio
    await page.click('#saveChangesButton'); // Save changes
    await expect(page.locator('#alertModalBody')).toHaveText('Bio updated successfully!'); // Verify success message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Close the alert modal
});

// Test: Update skills with validation
test('Update skills with validation', async ({ page }) => {
    // Click the "Update" button for the "Skills" field using text content
    await page.click('tr:has(td:has-text("Skills")) button:has-text("Update")'); // Find the correct row and button by text

    // Test Case 1: Attempt to submit without entering skills
    await page.fill('#updateInput', ''); // Leave the skills input empty
    await page.click('#saveChangesButton'); // Try saving with empty input
    await expect(page.locator('#alertModalBody')).toHaveText('Please enter a valid skills.'); // Verify error message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Close the alert modal

    // Test Case 2: Enter valid skills and submit
    await page.fill('#updateInput', 'Javascript, All of the Above, Sleeping'); // Enter new skills
    await page.click('#saveChangesButton'); // Save changes
    await expect(page.locator('#alertModalBody')).toHaveText('Skills updated successfully!'); // Verify success message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Close the alert modal
});


// Test: Verify old password with incorrect and correct attempts
test('Verify old password with incorrect and correct attempts', async ({ page }) => {
    // Click the "Update" button for the "password" field using text content
    await page.click('tr:has(td:has-text("Password")) button:has-text("Update")'); // Find the correct row and button by text

    // Test Case 1: Enter the old password with a lowercase difference
    await page.fill('#oldPasswordInput', 'password123!'); // Incorrect password (lowercase 'P')
    await page.click('#verifyPasswordButton'); // Attempt to verify the password
    await expect(page.locator('#alertModalBody')).toHaveText('Old password is incorrect.'); // Verify error message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Hide the alert modal by clicking "OK"

    // Test Case 2: Enter the old password with an uppercase difference
    await page.fill('#oldPasswordInput', 'PASSWORD123!'); // Incorrect password (uppercase 'PASSWORD')
    await page.click('#verifyPasswordButton'); // Attempt to verify the password
    await expect(page.locator('#alertModalBody')).toHaveText('Old password is incorrect.'); // Verify error message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Hide the alert modal by clicking "OK"

    // Test Case 3: Enter a completely wrong password
    await page.fill('#oldPasswordInput', 'WrongPassword123!'); // Completely incorrect password
    await page.click('#verifyPasswordButton'); // Attempt to verify the password
    await expect(page.locator('#alertModalBody')).toHaveText('Old password is incorrect.'); // Verify error message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Hide the alert modal by clicking "OK"

    // Test Case 4: Enter the correct password
    await page.fill('#oldPasswordInput', 'Password123!'); // Correct password
    await page.click('#verifyPasswordButton'); // Verify the password
    await expect(page.locator('#newPasswordModal')).toBeVisible(); // Verify that the new password modal is displayed
});


// Test: Update password
test('Update password successfully', async ({ page }) => {
    // Click the "Update" button for the "password" field using text content
    await page.click('tr:has(td:has-text("Password")) button:has-text("Update")');  // Find the correct row and button by text
    await page.fill('#oldPasswordInput', 'Password123!'); // Enter the old password
    await page.click('#verifyPasswordButton'); // Verify the old password

    // Expect the new password modal to be visible
    await expect(page.locator('#newPasswordModal')).toBeVisible();

    // Fill in new password and confirmation
    await page.fill('#newPasswordInput', 'Password123!');
    await page.fill('#confirmPasswordInput', 'Password123!');
    await page.click('#updatePasswordButton'); // Save the new password

    // Expect a success message in the alert modal
    await expect(page.locator('#alertModalBody')).toHaveText('Password updated successfully!');
});

// Test: Validation for mismatched and invalid passwords
test('Validate mismatched and invalid passwords', async ({ page }) => {
    // Click the "Update" button for the "password" field using text content
    await page.click('tr:has(td:has-text("Password")) button:has-text("Update")'); // Find the correct row and button by text
    await page.fill('#oldPasswordInput', 'Password123!'); // Enter the old password
    await page.click('#verifyPasswordButton'); // Verify the old password

    // Expect the new password modal to be visible
    await expect(page.locator('#newPasswordModal')).toBeVisible();

    // Test Case 1: Mismatched passwords
    await page.fill('#newPasswordInput', 'NewP@ssword1');
    await page.fill('#confirmPasswordInput', 'Mismatch123');
    await page.click('#updatePasswordButton'); // Save the new password
    await expect(page.locator('#passwordError')).toHaveText('Passwords do not match!');

    // Test Case 2: Both passwords match but lack an uppercase letter
    await page.fill('#newPasswordInput', 'newp@ssword1');
    await page.fill('#confirmPasswordInput', 'newp@ssword1');
    await page.click('#updatePasswordButton');
    await expect(page.locator('#passwordError')).toHaveText(
        'Password must be at least 8 characters long, include a lowercase letter, an uppercase letter, a special character, and a number.'
    );

    // Test Case 3: Both passwords match but lack a lowercase letter
    await page.fill('#newPasswordInput', 'NEWP@SSWORD1');
    await page.fill('#confirmPasswordInput', 'NEWP@SSWORD1');
    await page.click('#updatePasswordButton');
    await expect(page.locator('#passwordError')).toHaveText(
        'Password must be at least 8 characters long, include a lowercase letter, an uppercase letter, a special character, and a number.'
    );

    // Test Case 4: Both passwords match but lack a number
    await page.fill('#newPasswordInput', 'NewP@ssword');
    await page.fill('#confirmPasswordInput', 'NewP@ssword');
    await page.click('#updatePasswordButton');
    await expect(page.locator('#passwordError')).toHaveText(
        'Password must be at least 8 characters long, include a lowercase letter, an uppercase letter, a special character, and a number.'
    );

    // Test Case 5: Both passwords match but lack a special character
    await page.fill('#newPasswordInput', 'NewPassword1');
    await page.fill('#confirmPasswordInput', 'NewPassword1');
    await page.click('#updatePasswordButton');
    await expect(page.locator('#passwordError')).toHaveText(
        'Password must be at least 8 characters long, include a lowercase letter, an uppercase letter, a special character, and a number.'
    );

    // Test Case 6: Both passwords match but are less than 8 characters
    await page.fill('#newPasswordInput', 'P@1s');
    await page.fill('#confirmPasswordInput', 'P@1s');
    await page.click('#updatePasswordButton');
    await expect(page.locator('#passwordError')).toHaveText(
        'Password must be at least 8 characters long, include a lowercase letter, an uppercase letter, a special character, and a number.'
    );

    // Test Case 7: Valid passwords (both match and meet all requirements)
    await page.fill('#newPasswordInput', 'Password123!');
    await page.fill('#confirmPasswordInput', 'Password123!');
    await page.click('#updatePasswordButton');

    // Expect no error message to be displayed
    // Expect a success message in the alert modal
    await expect(page.locator('#alertModalBody')).toHaveText('Password updated successfully!');
});

// Test Case removed as only works locally.
// It is too flaky due to playwright not doing tests in sequential order
// Test: Delete profile with confirmation
test('Delete profile with confirmation', async ({ page }) => {

    // Step 1: Log out
    await page.click('a.nav-link.logout-btn'); // Click the logout button
    await page.goto(`${API_URL}/login.html`);

    // Step 1: Log back in with user meant to be deleted
    await page.fill('#email', 'delete.23@ichat.sp.edu.sg'); // Regular user email
    await page.fill('#password', '1234'); // Regular user password
    await page.click('button[type="submit"]');

    // Step 2: Open the Delete Profile Modal
    await page.click('button:has-text("Delete Profile")'); // Click the delete profile button
    await expect(page.locator('#deleteProfileModal .modal-body')).toHaveText(
        'Are you sure you want to delete your profile? This action cannot be undone.'
    ); // Verify the confirmation message

    // Step 3: Cancel Deletion
    await page.click('div#deleteProfileModal button[data-bs-dismiss="modal"]'); // Click "Cancel" to close the modal
    await expect(page.locator('#deleteProfileModal')).not.toBeVisible(); // Ensure the modal is closed

    // Step 4: Open the Modal Again
    await page.click('button:has-text("Delete Profile")'); // Reopen the modal
    await expect(page.locator('#deleteProfileModal')).toBeVisible(); // Ensure the modal is visible

    // Step 5: Confirm Deletion
    await page.click('#confirmDeleteButton'); // Click the "Delete" button
    await expect(page.locator('#alertModalBody')).toHaveText('Profile deleted successfully! Logging out now...'); // Verify the success message
    await page.click('div#alertModal button[data-bs-dismiss="modal"]'); // Close the alert modal
});

