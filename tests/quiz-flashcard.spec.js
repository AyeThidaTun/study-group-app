// @ts-check
const { test, expect } = require('@playwright/test');

// Test constants
const API_URL = 'http://localhost:3001';

// Commented out as does not work in github


// // Helper to log in before each test
// test.beforeEach(async ({ page }) => {
//     console.log('Logging in as a user...');
//     await page.goto(`${API_URL}/login.html`);
//     await page.fill('#email', 'yvonne.23@ichat.sp.edu.sg'); // Regular user email
//     await page.fill('#password', '1234'); // Regular user password
//     await page.click('button[type="submit"]');

//     // Confirm redirection to profile page
//     await expect(page).toHaveURL(`${API_URL}/profile/profile.html`);
//     // Navigate to Quiz Page
//     await page.goto(`${API_URL}/quiz/chooseSchoolForQuiz.html`);

//     // Click the school card with schoolId=1 & School Name is School of Computing
//     await page.click('a[href="/quiz/chooseModuleForQuiz.html?schoolId=1&schoolName=School%20of%20Computing"]');

//     // Click the module card where module is ST0510 J2EE Application Development

//     await page.click('a[href="/quiz/chooseQuizForModule.html?modCode=ST0510&modName=J2EE%20Application%20Development&schoolId=1&schoolName=School%20of%20Computing"]');
// });

// test('Completing a quiz successfully', async ({ page }) => {

//     await page.click('a[href="/quiz/startQuiz.html?quizId=1"]');

//     // Try to submit without answering
//     await page.click('button[type="submit"]'); // Assuming the submit button is inside the form

//     // Verify the first modal appears with the correct warning message
//     await page.locator('#confirmationModal');
//     const confirmationModal = page.locator('#confirmationModal');
//     await expect(confirmationModal).toBeVisible();
//     await expect(confirmationModal.locator('.modal-body')).toContainText(
//         "You haven't answered all questions. Are you sure you want to submit the quiz?"
//     );

//     // Click "Cancel" on the first modal (assuming a cancel button is present)
//     await page.click('#cancelSubmitButton');

//     // Ensure the modal disappears
//     await expect(confirmationModal).not.toBeVisible();

//     // Select the first radio option for each question
//     const questions = await page.locator('.form-check-input[name^="question-"]').all(); // Select all radio inputs
//     const uniqueQuestions = new Set();

//     for (const radio of questions) {
//         const name = await radio.getAttribute('name');
//         if (!uniqueQuestions.has(name)) {
//             uniqueQuestions.add(name);
//             await radio.check(); // Select the first option for each question
//         }
//     }

//     // Submit the form again
//     await page.click('button[type="submit"]');

//     // Verify the second confirmation modal appears
//     const fullAnswerModal = page.locator('#fullAnswerModal');
//     await expect(fullAnswerModal).toBeVisible();

//     // Click "Confirm Submission" on the second modal
//     await page.click('#confirmFullSubmitButton');

//     // Ensure the second modal disappears
//     await expect(fullAnswerModal).not.toBeVisible();

//     // Ensure we're on the success/results page by checking the title or heading
//     await page.waitForSelector('text=Quiz Results');

//     // Verify the score is 5/5
//     await expect(page.locator('text=Score: 5/5')).toBeVisible();

//     // Verify each question displays the correct answer and the user's answer
//     const questionsArr = [
//         { question: "Which of the following will we be using?", answer: "Option 1 - Eclipse" },
//         { question: "Define JSP", answer: "Option 1 - Jakarta Server Pages" },
//         { question: "What is the extension for a Java file?", answer: "Option 1 - .java" },
//         { question: "Which of the following is a valid Java data type?", answer: "Option 1 - String" },
//         { question: "Which keyword is used to define a class in Java?", answer: "Option 1 - class" }
//     ];

//     for (const q of questionsArr) {
//         await expect(page.locator(`text=${q.question}`)).toBeVisible();
//         await expect(page.locator(`text=Your Answer: ${q.answer}`)).toBeVisible();
//         await expect(page.locator(`text=Correct Answer: ${q.answer}`)).toBeVisible();
//     }

//     // Click the "Go Back" button
//     await page.click('#go-back-btn');

// });

// Does Not work on github actions
// test('Completing a deck of flashcards successfully', async ({ page }) => {

//     // Click on the "Flashcards" tab
//     await page.click('#flashcards-tab');

//     // Ensure the flashcards content is visible
//     await page.waitForSelector('#flashcards-content', { state: 'visible' });

//     await page.locator('.card2', { hasText: 'J2EE Basics' }).click();

//     // Click the "Go Back" button
//     await page.click('#go-back-btn');

//     // Click on the "Flashcards" tab
//     await page.click('#flashcards-tab');

//     // Verify the flashcard deck's status is "In Progress"
//     // await expect(page.locator('text=Status: In Progress')).toBeVisible();
//     await expect(page.locator('.card2 >> text=Status: In Progress')).toBeVisible();

//     await page.locator('.card2', { hasText: 'J2EE Basics' }).click();

//     // Ensure the "Previous" and "Next" buttons exist
//     await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
//     await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();

//     // Verify the starting counter is 1 / 9 flashcards
//     await expect(page.locator('#flashcard-counter')).toHaveText('1 / 9');

//     // Verify the starting flashcard text
//     await expect(page.locator('#flashcard-content')).toHaveText('What is J2EE?');

//     // Click the flashcard to flip it
//     await page.click('#flashcard');

//     // Ensure the text updates after flipping
//     await expect(page.locator('#flashcard-content'))
//         .toHaveText('J2EE is a platform for developing web applications in Java.');

//     // Click the "Next" button
//     await page.getByRole('button', { name: 'Next' }).click();

//     // Verify the counter is 2 / 9 flashcards
//     await expect(page.locator('#flashcard-counter')).toHaveText('2 / 9');

//     // Click the "Prev" button
//     await page.getByRole('button', { name: 'Prev' }).click();

//     // Verify the starting counter is 1 / 9 flashcards
//     await expect(page.locator('#flashcard-counter')).toHaveText('1 / 9');

//     // Loop the "Next" button 8 times to reach the last flashcard
//     for (let i = 0; i < 8; i++) {
//         await page.getByRole('button', { name: 'Next' }).click();
//     }

//     // Verify the counter is 9 / 9 flashcards
//     await expect(page.locator('#flashcard-counter')).toHaveText('9 / 9');

//     await page.getByRole('button', { name: 'Next' }).click();

//     // Ensure the completion message is displayed
//     await expect(page.locator('#flashcard-content'))
//         .toContainText('Way to go! You’ve reviewed all the cards.');

//     await expect(page.locator('#flashcard-content'))
//         .toContainText('How you\'re doing');

//     await expect(page.locator('#flashcard-content'))
//         .toContainText('Completed: 9');

//     await expect(page.locator('#flashcard-content'))
//         .toContainText('Terms left: 0');

//     // Click the "Next" button
//     await page.getByRole('button', { name: 'Back to last question' }).click();

//     // Verify the counter is 9 / 9 flashcards
//     await expect(page.locator('#flashcard-counter')).toHaveText('9 / 9');

//     await page.getByRole('button', { name: 'Next' }).click();

//     // Click the "Go Back" button
//     await page.click('#go-back-btn');

//     await page.reload();

//     // Click on the "Flashcards" tab
//     await page.click('#flashcards-tab');

//     // Verify the flashcard deck's status is "Completed"
//     await expect(page.locator('text=Status: Mastered')).toBeVisible();
// });


