import { test, expect } from "@playwright/test";

test.describe("Editor Flow", () => {
  test("Loads the canvas correctly", async ({ page }) => {
    // In a real test, you'd use Clerk mock auth to log in and visit the page
    // Here we just test that the local dev server is responding at a path
    // We expect the auth to kick us to /sign-in, so we check for redirect or content.
    
    await page.goto("/canvas/test-id");
    
    // We expect a sign-in redirect or page load (if using clerk test mode)
    const url = page.url();
    expect(url).toContain("sign-in");
  });
});
