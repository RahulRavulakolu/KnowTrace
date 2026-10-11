import { test, expect } from "@playwright/test";

test("full student journey", async ({ page }) => {
  await page.goto("/onboarding?course_id=demo-course");
  await expect(page.getByText(/diagnostic/i)).toBeVisible();
  await page.goto("/dashboard?course_id=demo-course");
  await expect(page.getByText(/learner dashboard/i)).toBeVisible();
  await page.goto("/evaluation");
  await expect(page.getByText(/RAGAS by category/i)).toBeVisible();
});
