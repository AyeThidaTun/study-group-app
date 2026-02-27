const { test, expect } = require("@playwright/test");

const apiUrl = "."; // Adjust this if your API is hosted elsewhere
const USER_ID = "20"; // Mock userId for logged-in user

test.describe("Study Group Features", () => {
  test.beforeEach(async ({ page }) => {
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

  test.describe("Join and Leave a Study Group", () => {
    test("Should allow user to join and then leave a study group", async ({
      page,
    }) => {

      await page.goto("http://localhost:3001/studyGroup/studyGroup.html");
      const joinDialog = page.waitForEvent("dialog");
      await page.locator(".join-button").first().click();
      const joinAlert = await joinDialog;
      expect(joinAlert.message()).toBe("Successfully joined the study group!");
      await joinAlert.dismiss();

      await page.click("#joined-groups-tab");
      const leaveDialog = page.waitForEvent("dialog");
      await page.locator(".leave-button").first().click({timeout: 10000});
      const leaveAlert = await leaveDialog;
      expect(leaveAlert.message()).toBe("Successfully left group!");
      await leaveAlert.dismiss();
    });
  });

  test.describe("Create and Delete a Study Group", () => {
    test("Should allow user to create and delete a study group", async ({
      page,
    }) => {

      await page.goto("http://localhost:3001/studyGroup/studyGroup.html");
      await page.click("#create-tab");
      await page.fill("#groupName", "Test Group");
      await page.fill("#groupDescription", "Test Description");
      const dialogPromise = new Promise((resolve) => {
        page.on("dialog", (dialog) => {
          console.log("Dialog message:", dialog.message());
          resolve(dialog);
        });
      });

      await page.click('button[type="submit"]');

      const createAlert = await dialogPromise;
      expect(createAlert.message()).toBe("Successfully created a new group!");
      await createAlert.dismiss();

      await page.click("#joined-groups-tab");
      await page.waitForSelector(".delete-button");

      const deleteAlert = page.waitForEvent("dialog");
      await page.locator(".delete-button").first().click();
      expect((await deleteAlert).message()).toBe(
        "Successfully deleted the study group!"
      );
      await (await deleteAlert).dismiss();
    });
  });
});
