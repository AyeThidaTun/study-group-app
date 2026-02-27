const { test, expect } = require("@playwright/test");

const apiUrl = ".";
const USER_ID = "4";

test.describe("Study Group Features", () => {
  test.beforeEach(async ({ page }) => {
    console.log("Logging in as a user...");
    await page.goto("http://localhost:3001/login.html");
    await page.fill("#email", "dave.23@ichat.sp.edu.sg");
    await page.fill("#password", "1234");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("http://localhost:3001/profile/profile.html");
    const userId = await page.evaluate(() => localStorage.getItem("userId"));
    console.log("userId retrieved from localStorage:", userId);
    expect(userId).toBe(USER_ID);
  });

  test.describe("Filter feedbacks by group", () => {
    test("Should show feedbacks by filtered group name", async ({ page }) => {
      // Visit the page
      await page.goto("http://localhost:3001/feedback/feedback.html");
    
      await page.waitForTimeout(20000);

      // Set the filter to 'Chemistry Group'
      await page.selectOption("#studyGroupFilter", {
        label: "Chemistry Group",
      });

      // Wait for the feedback list to be visible and feedbacks to load
      const disclosedFeedbackList = await page.locator("#disclosedFeedbackList");
      await disclosedFeedbackList.waitFor({ state: "visible" });

      // Verify that feedbacks have loaded and check the feedbacks displayed
      const feedbackItems = await disclosedFeedbackList
        .locator(".card-title")
        .allTextContents();

      // Log feedbackItems to verify their contents
      console.log("Feedback Items:", feedbackItems);

      // Ensure feedbackItems are not empty
      expect(feedbackItems.length).toBeGreaterThan(0); // Ensure feedbacks are present
      expect(feedbackItems).toContain(" Feedback from Ivan");
      expect(feedbackItems).toContain(" Feedback from Bob");

      // Ensure that the feedbacks contain correct group information
      const groupNames = await disclosedFeedbackList
        .locator(".card-text")
        .allTextContents();

      // Clean up the text by trimming and replacing line breaks or excessive whitespace
      const cleanedGroupNames = groupNames.map((item) =>
        item.replace(/\s+/g, " ").trim()
      );

      // Check if any group info contains the expected group name
      const containsGroupName = cleanedGroupNames.some((item) =>
        item.includes("Group: Chemistry Group")
      );

      expect(containsGroupName).toBe(true); // Assert that the group name is found

    });
  });
});
