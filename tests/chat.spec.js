const { test, expect } = require("@playwright/test");
const prisma = require("../src/models/prismaClient");

const USER_A = { id: "20", email: "leo.23@ichat.sp.edu.sg", password: "1234" };
const USER_B = { id: "21", email: "judy.23@ichat.sp.edu.sg", password: "1234" };

test.describe("Chat feature", () => {

  test.beforeEach(async () => {
    // Cleanup any previous bookings before each test run
    await prisma.message.deleteMany({});
    // You can also clean up any other relevant data here
  });

  test("User A sends a message, and User B receives it", async ({
    browser,
  }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Log in as User A
    await pageA.goto("http://localhost:3001/login.html");
    await pageA.fill("#email", USER_A.email);
    await pageA.fill("#password", USER_A.password);
    await pageA.click('button[type="submit"]');
    await expect(pageA).toHaveURL("http://localhost:3001/profile/profile.html");

    // Navigate to User Study Groups
    await pageA.goto("http://localhost:3001/groupChat/userStudyGroups.html");

    // Wait for the group card to appear and select it
    await pageA.waitForSelector(".card-body", { timeout: 10000 });
    const groupCardA = await pageA
      .locator(".card-body")
      .locator("text=Algebra Group")
      .first();
    await groupCardA.click();
    console.log("User A selected group.");

    // Wait for the chat page to load
    await expect(pageA).toHaveURL(
      "http://localhost:3001/groupChat/groupChat.html"
    );

    // Send a message
    await pageA.fill("input#message", "Hello, this is Leo!");
    await pageA.locator("#sendBtn").click();

    // Wait for the message to appear on User A's side (confirmation)
    await expect(pageA.locator("#messages")).toContainText(
      "Hello, this is Leo!",
      { timeout: 10000 }
    );

    // Log in as User B
    await pageB.goto("http://localhost:3001/login.html");
    await pageB.fill("#email", USER_B.email);
    await pageB.fill("#password", USER_B.password);
    await pageB.click('button[type="submit"]');
    await expect(pageB).toHaveURL("http://localhost:3001/profile/profile.html");

    // Navigate to User Study Groups
    await pageB.goto("http://localhost:3001/groupChat/userStudyGroups.html");

    // Wait for the group card to appear and select it
    await pageB.waitForSelector(".card-body", { timeout: 10000 });
    const groupCardB = await pageB
      .locator(".card-body")
      .locator("text=Algebra Group")
      .first();
    await groupCardB.click();
    console.log("User B selected group.");

    // Wait for the chat page to load
    await expect(pageB).toHaveURL(
      "http://localhost:3001/groupChat/groupChat.html"
    );

    // Check if the message is received by User B
    await expect(pageB.locator("#messages")).toContainText(
      "Hello, this is Leo!",
      { timeout: 10000 }
    );

    // await contextA.close();
    // await contextB.close();
  });
});

test.describe("Poll feature", () => {
    test("User A creates a poll, and User B votes on it", async ({ browser }) => {
      const contextA = await browser.newContext();
      const contextB = await browser.newContext();
      const pageA = await contextA.newPage();
      const pageB = await contextB.newPage();
  
      // **User A logs in**
      await pageA.goto("http://localhost:3001/login.html");
      await pageA.fill("#email", USER_A.email);
      await pageA.fill("#password", USER_A.password);
      await pageA.click('button[type="submit"]');
      await expect(pageA).toHaveURL("http://localhost:3001/profile/profile.html");
  
      // **Navigate to study group chat**
      await pageA.goto("http://localhost:3001/groupChat/userStudyGroups.html");
  
      // **Select Algebra Group**
      await pageA.waitForSelector(".card-body", { timeout: 10000 });
      await pageA.locator(".card-body").locator("text=Algebra Group").first().click();
      console.log("User A selected group.");
      await expect(pageA).toHaveURL("http://localhost:3001/groupChat/groupChat.html");
  
      // **User A creates a poll**
      await pageA.locator("#pollBtn").click();
  
      // **Fill poll question and options**
      const pollQuestion = "What is your favorite color?";
      await pageA.fill("#poll-question", pollQuestion);
      await pageA.locator("#poll-options input[type='text']").nth(0).fill("Red");
      await pageA.locator("#poll-options input[type='text']").nth(1).fill("Blue");
      await pageA.locator("#createPollBtn").click();
  
      // **Ensure the poll appears for User A**
      await pageA.waitForTimeout(1000); // Short delay to allow real-time updates
      const userPolls = pageA.locator(".poll-message").filter({ hasText: pollQuestion });
      const latestPoll = userPolls.last();
      await expect(latestPoll).toContainText(pollQuestion, { timeout: 10000 });
  
      // **User B logs in**
      await pageB.goto("http://localhost:3001/login.html");
      await pageB.fill("#email", USER_B.email);
      await pageB.fill("#password", USER_B.password);
      await pageB.click('button[type="submit"]');
      await expect(pageB).toHaveURL("http://localhost:3001/profile/profile.html");
  
      // **Navigate to study group chat**
      await pageB.goto("http://localhost:3001/groupChat/userStudyGroups.html");
  
      // **Select Algebra Group**
      await pageB.waitForSelector(".card-body", { timeout: 10000 });
      await pageB.locator(".card-body").locator("text=Algebra Group").first().click();
      console.log("User B selected group.");
      await expect(pageB).toHaveURL("http://localhost:3001/groupChat/groupChat.html");
  
      // **Wait for poll to appear dynamically (real-time socket update)**
      await pageB.waitForTimeout(10000);
      const userBPolls = pageB.locator(".poll-message").filter({ hasText: pollQuestion });
      const pollToVote = userBPolls.last();
      await expect(pollToVote).toContainText(pollQuestion, { timeout: 10000 });
  
      // **Select vote option (Red or Blue)**
      const redOption = pollToVote.locator("label:has-text('Red')").first();
      const blueOption = pollToVote.locator("label:has-text('Blue')").first();
  
      if (await redOption.isVisible()) {
        console.log("User B votes for Red");
        await redOption.click();
      } else {
        console.log("User B votes for Blue");
        await blueOption.click();
      }
  
      // **Ensure vote count updates dynamically**
      const voteCount = pollToVote.locator(".vote-count").first();
      await expect(voteCount).toContainText("1 vote", { timeout: 10000 });
  
      console.log("User B successfully voted.");
    });
  });
  
  
  
  
