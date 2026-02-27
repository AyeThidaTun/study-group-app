const { test, expect } = require('@playwright/test');


test.describe('User Login', () => {

  test('should display a random welcome message on login page', async ({ page }) => {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3001/login.html'); // URL of your login page

    // Wait for the typing animation to finish
    const welcomeMessage = await page.locator('#welcomeMessage');
    await welcomeMessage.waitFor({ state: 'attached' }); // Wait for the element to appear

    // Wait until the typing effect is likely finished. Adjust the time here if needed
    await page.waitForTimeout(5000); // 5 seconds for the message to fully type out

    // Retrieve the final message text after typing effect
    const welcomeText = await welcomeMessage.textContent();
    console.log('Welcome text:', welcomeText); // Log the text to check what is being displayed

    // List of all possible valid messages
    const validWelcomeMessages = [
        "Getting back to Mugging?",
        "Getting back on the Grind?",
        "Getting back to pull up your GPA?",
        "Ready to Ace your Exams?",
        "Time to hit the books hard!",
        "Ready to get back to studying?",
        "It's Slaving Time!",
        "Ready to become the Smartest?",
        "Time to crush those goals!",
        "Let's turn that grind into shine!",
        "Ready to transform your dreams into reality?",
        "Let's make studying your superpower!",
        "It's time to unleash your inner genius!",
        "Get ready to conquer those books!",
        "Your future self will thank you for this!",
        "Let's turn stress into success together!",
        "Focus mode: ON!",
        "Remember, every page turned is a step closer to success!",
        "You've got this—let's get to work!",
        "Every hour you study is an hour closer to your dreams!",
        "Let's make procrastination a thing of the past!",
        "The journey of a thousand pages begins with a single study session.",
        "You're not just studying; you're building your future!"
    ];

    // Check if the any of the valid messages starts with the displayed welcome message
    const startsWithValidMessage = validWelcomeMessages.some(validMessage => {
        console.log(`Checking if "${welcomeText}" starts with "${validMessage}"`); // Log the comparison
        return validMessage?.startsWith(welcomeText);
    });

    console.log('Does the message start with a valid message?', startsWithValidMessage); // Final check log

    expect(startsWithValidMessage).toBe(true);
});


  test('Login should generate token', async ({ page }) => {
    // Login request 
    const response = await page.request.post('http://localhost:3001/users/login', {
      data: { email: 'carol.23@ichat.sp.edu.sg', password: '1234' }
    });

    // Expect a successful response and token in the body
    const responseBody = await response.json();
    expect(responseBody.token).not.toBeNull();
    expect(responseBody.message).toBe('Success');
  });

  test('should login successfully as ADMIN with valid credentials', async ({ page }) => {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3001/login.html');

    // Fill in the login form with admin credentials
    console.log('Filling in the login form...');
    await page.fill('#email', 'lebron_james.23@ichat.sp.edu.sg'); // Admin email
    await page.fill('#password', '1234'); // Admin password

    // Submit the form
    console.log('Submitting the login form...');
    await page.click('button[type="submit"]');

    // Verify redirection to the admin page
    await expect(page).toHaveURL('http://localhost:3001/admin/manageSuggestions.html');

    // Retrieve token and userRole from localStorage
    console.log('Retrieving token and userRole from localStorage...');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const userRole = await page.evaluate(() => localStorage.getItem('userRole'));

    console.log('Token retrieved from localStorage:', token);
    console.log('UserRole retrieved from localStorage:', userRole);

    // Ensure token and user role are correctly set
    expect(token).not.toBeNull();
    expect(userRole).toBe('ADMIN'); // Admin role verification
  });

  test('should login successfully as USER with valid credentials', async ({ page }) => {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3001/login.html');

    // Fill in the login form with user credentials
    console.log('Filling in the login form...');
    await page.fill('#email', 'leo.23@ichat.sp.edu.sg'); // Regular user email
    await page.fill('#password', '1234'); // Regular user password

    // Submit the form
    console.log('Submitting the login form...');
    await page.click('button[type="submit"]');

    // Verify redirection to the user profile page
    await expect(page).toHaveURL('http://localhost:3001/profile/profile.html');

    // Retrieve token and userRole from localStorage
    console.log('Retrieving token and userRole from localStorage...');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const userRole = await page.evaluate(() => localStorage.getItem('userRole'));

    console.log('Token retrieved from localStorage:', token);
    console.log('UserRole retrieved from localStorage:', userRole);

    // Ensure token and user role are correctly set
    expect(token).not.toBeNull();
    expect(userRole).toBe('USER'); // Regular user role verification
  });


  test('should show error message with invalid credentials (boundary password)', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3001/login.html'); // Change to your local URL

    // Fill in invalid login details
    await page.fill('#email', 'Bob.23@ichat.sp.edu.sg');
    await page.fill('#password', 'pAssword123!'); // Correct password is 'Password123!'

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for alert modal to show and validate the message
    await expect(page.locator('#alertModalBody')).toContainText('Login failed. Please check your email and password.');
  });

  test('should show error message with invalid credentials (boundary email)', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3001/login.html'); // Change to your local URL

    // Fill in invalid login details
    await page.fill('#email', 'BOB.23@ichat.sp.edu.sg');
    await page.fill('#password', 'Password123!');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for alert modal to show and validate the message
    await expect(page.locator('#alertModalBody')).toContainText('Login failed. Please check your email and password.');
  });

  test('should update last login details after successful login', async ({ page }) => {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3001/login.html');
  
    // Fill in the login form with valid credentials
    console.log('Filling in the login form...');
    const email = 'bob.23@ichat.sp.edu.sg'; // Replace with a valid test email
    const password = 'Password123!'; // Replace with the valid password for the test user
    await page.fill('#email', email);
    await page.fill('#password', password);
  
    // Submit the login form
    console.log('Submitting the login form...');
    await page.click('button[type="submit"]');
  
    // Wait for the redirect to complete based on user role
    await page.waitForURL('http://localhost:3001/profile/profile.html'); 
  
    // Verify that the token, userId, and userRole are stored in localStorage
    console.log('Verifying localStorage for token, userId, and userRole...');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const userId = await page.evaluate(() => localStorage.getItem('userId'));
    const userRole = await page.evaluate(() => localStorage.getItem('userRole'));
  
    expect(token).not.toBeNull();
    expect(userId).not.toBeNull();
    expect(userRole).not.toBeNull();
  
    // Check if the last login was updated successfully by querying the backend
    console.log('Checking if the last login details were updated...');
    const response = await page.request.get(`http://localhost:3001/users/retrieveUserById/${userId}`); // Replace with the API endpoint to fetch user details
    const userData = await response.json();

    console.log('User data:', userData);
  
    // Assert that the lastLogin field was updated and is recent
    const lastLogin = new Date(userData.lastLogin);
    const currentTime = new Date();
    expect(lastLogin).toBeTruthy();
    expect(currentTime - lastLogin).toBeLessThan(60 * 1000); // Ensure lastLogin is within the last 60 seconds
  
    console.log('Test Passed! Last login details were successfully updated.');
  });

});


test.describe('User Registration', () => {

  test('should successfully register a new user and redirect to profile page', async ({ page }) => {
    console.log('Navigating to registration page...');
    await page.goto('http://localhost:3001/register.html'); // Adjust this URL if needed

    // Fill in the registration form with valid details
    console.log('Filling in the registration form...');
    const email = `new${Date.now()}_user.23@ichat.sp.edu.sg`; // Generates a unique email using the current timestamp
    const password = 'Password123!'; // Replace with a test password
    const name = 'New User'; // Optional, can be inferred from the email
    await page.fill('#email', email);
    await page.fill('#password', password);

    // Submit the registration form
    console.log('Submitting the registration form...');
    await page.click('button[type="submit"]');

    // Wait for 4 seconds before proceeding
    await page.waitForTimeout(4000); // Wait for 4 seconds

    await page.evaluate(() => {
      // Find the close button inside the modal
      const closeButton = document.querySelector('#alertModal .btn-close');

      if (closeButton) {
        // Trigger a click on the close button to close the modal
        closeButton.click();
      } else {
        console.log('Close button not found.');
      }
    });

    // Wait for the modal to close and for login to be triggered
    await page.waitForTimeout(1000); // Wait for the login to happen

    // // Wait for the redirect to complete
    // await page.waitForTimeout(3000); // Wait for the 3-second delay before redirection

    // Check if the current page is the profile page
    console.log('Verifying that the user is redirected to profile...');
    expect(page.url()).toBe('http://localhost:3001/profile/profile.html'); // Verify redirection to profile
  });


  test('should show an error if the email format is invalid', async ({ page }) => {
    console.log('Navigating to registration page...');
    await page.goto('http://localhost:3001/register.html');
  
    // Fill in the form with invalid email format
    console.log('Filling in the form with invalid email...');
    const invalidEmail = 'invalid-email@domain.com'; // Invalid email format
    const password = 'Password123!'; // Valid password
    await page.fill('#email', invalidEmail);
    await page.fill('#password', password);
  
    // Submit the registration form
    console.log('Submitting the registration form...');
    await page.click('button[type="submit"]');
  
    // Wait for the modal to appear
    console.log('Waiting for the alert modal...');
    await page.waitForSelector('#alertModal', { visible: true, timeout: 5000 });  // Wait for the modal to appear
  
    // Get the message inside the modal body
    console.log('Getting the message from modal body...');
    const alertText = await page.innerText('#alertModalBody');
    console.log('Alert message:', alertText);
  
    // Verify the error message for invalid email
    expect(alertText).toContain('Email format is invalid. Ensure it follows the pattern "name.year@ichat.sp.edu.sg".');
  });  
  

  test('should show an error if the password does not meet the requirements', async ({ page }) => {
    console.log('Navigating to registration page...');
    await page.goto('http://localhost:3001/register.html');
  
    // Fill in the form with a password that does not meet requirements
    console.log('Filling in the form with invalid password...');
    const email = 'test_user.2023@ichat.sp.edu.sg';
    const invalidPassword = 'password'; // Invalid password (no uppercase, no special character)
    await page.fill('#email', email);
    await page.fill('#password', invalidPassword);
  
    // Submit the registration form
    console.log('Submitting the registration form...');
    await page.click('button[type="submit"]');
  
    // Wait for the modal to appear
    console.log('Waiting for the alert modal...');
    await page.waitForSelector('#alertModal', { visible: true, timeout: 5000 });
  
    // Get the message inside the modal body
    console.log('Getting the message from modal body...');
    const alertText = await page.innerText('#alertModalBody');
    console.log('Alert message:', alertText);
  
    // Verify the error message for invalid password
    expect(alertText).toContain('Password does not meet the requirements.');
  });

  test('should show an error if the email is already registered', async ({ page }) => {
    console.log('Navigating to registration page...');
    await page.goto('http://localhost:3001/register.html');
  
    // Fill in the form with an email already in the database
    console.log('Filling in the form with an already registered email...');
    const registeredEmail = 'lebron_james.23@ichat.sp.edu.sg'; // An email already in the DB
    const password = 'Password123!'; // Valid password
    await page.fill('#email', registeredEmail);
    await page.fill('#password', password);
  
    // Submit the registration form
    console.log('Submitting the registration form...');
    await page.click('button[type="submit"]');
  
    // Wait for the modal to appear
    console.log('Waiting for email already registered alert...');
    await page.waitForSelector('#alertModal', { visible: true, timeout: 5000 });
  
    // Get the message inside the modal body
    console.log('Getting the message from modal body...');
    const alertText = await page.innerText('#alertModalBody');
    console.log('Alert message:', alertText);
  
    // Verify the error message for email already registered
    expect(alertText).toContain('Email already registered');
  });
  

});

