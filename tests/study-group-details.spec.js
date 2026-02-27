const { test, expect } = require("@playwright/test");

const apiUrl = "."; // Adjust this if your API is hosted elsewhere
const USER_ID = "20"; // Mock userId for logged-in user

test.describe("Study Group Features", () => {
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

  test("Should display multiple members in the study group", async ({
    page,
  }) => {

    await page.goto("http://localhost:3001/studyGroup/studyGroup.html");

    const groupCard = await page
      .locator(".card-body")
      .locator("text=Algebra Group")
      .first();
    await groupCard.click();

    await page.waitForTimeout(10000);

    await expect(page.locator("h2")).toHaveText("Study Group Details");

    const memberList = await page.locator("#groupMembers li");
    await page.waitForSelector("#groupMembers li");

    const count = await memberList.count();
    expect(count).toBeGreaterThan(1);

    const totalMembers = await page.locator("p.mt-3");
    await expect(totalMembers).toBeVisible();
  });

  test("Should be able to join group from details page", async ({
      page,
    }) => {
      await page.goto("http://localhost:3001/studyGroup/studyGroup.html");

      const groupCard = await page
      .locator(".card-body")
      .locator("text=Physics Group")
      .first();
      await groupCard.click();

      await expect(page.locator("h2")).toHaveText("Study Group Details");

      // const memberList = page.locator("#groupMembers li");
      // const count = await memberList.count();
      // expect(count).toBeGreaterThan(1);

      const dialogPromise = new Promise(resolve => {
        page.on('dialog', dialog => {
            console.log('Dialog message:', dialog.message());
            resolve(dialog);
        });
      });

      await page.waitForTimeout(1000);

      // await page.locator("#joinGroupButton").first().click();
      await page.click('button[type="submit"]');

      const joinAlert = await dialogPromise;
      expect(joinAlert.message()).toBe("Successfully joined the study group!");
      await joinAlert.dismiss();
    });
});
