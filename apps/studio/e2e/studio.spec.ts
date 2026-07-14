import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Passcode").fill("pilot");
  await page.getByRole("button", { name: "Enter studio" }).click();
  await expect(page.getByRole("heading", { name: "Card Studio" })).toBeVisible();
});

test("creates, generates, accepts, manipulates, and recovers a local calling card", async ({ page }) => {
  await page.getByLabel("Message").fill("Meet me where the stars begin.");
  await page.getByLabel("Signature").fill("Aster");
  await page.getByRole("button", { name: /emblem/i }).first().click();
  await page.getByRole("button", { name: "Generate", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Accept candidate" }).click();
  await expect(page.getByText("emblem accepted into the local asset library.")).toBeVisible();
  await page.getByRole("slider", { name: "Opacity" }).fill("0.6");
  await expect(page.getByText("Valid v0.1.0")).toBeVisible();
  await expect(page.getByText("Saved locally")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Message")).toHaveValue("Meet me where the stars begin.");
  await expect(page.getByLabel("Signature")).toHaveValue("Aster");
});

test("supports batch review, rejection, reduced motion, and keyboard inspector controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Generate all missing" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Accept candidate" }).click();
  await page.keyboard.press("Tab");
  await expect(page.getByText(/Batch:/)).toBeVisible();
});

test("uploads, edits, exports, resets, and re-imports a portable card", async ({ page }) => {
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  await page.getByRole("button", { name: /Background Missing/i }).click();
  await page.getByLabel("Upload background image").setInputFiles({
    name: "background.png", mimeType: "image/png", buffer: pixel,
  });
  await page.getByRole("button", { name: /Texture Missing/i }).click();
  await page.getByLabel("Upload texture image").setInputFiles({
    name: "texture.png", mimeType: "image/png", buffer: pixel,
  });
  await page.getByRole("checkbox", { name: /background · upload/i }).check();
  await page.getByRole("button", { name: "Edit current image" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Reject" }).click();

  const pngDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG" }).click();
  expect((await pngDownload).suggestedFilename()).toBe("calling-card.png");

  const zipDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export ZIP" }).click();
  const zip = await zipDownload;
  const zipPath = await zip.path();
  expect(zipPath).toBeTruthy();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset local project" }).click();
  await page.getByLabel("Import portable ZIP").setInputFiles(zipPath!);
  await expect(page.getByText("Portable project imported.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Background Asset bound/i })).toBeVisible();
});

test.describe("canvas layer drag", () => {
  // The Konva stage draws in a fixed 750-wide coordinate system; the canvas is
  // then CSS-scaled to fit its column. Konva maps pointer positions 1:1 with the
  // container's CSS pixels, so pointer hit-testing only lines up with the drawn
  // geometry when the stage renders at its native width. A wide viewport gives
  // the canvas its full 750px (scale = 1) so the drag targets real stage coords.
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("drags the emblem layer on the canvas and persists its new position", async ({ page }) => {
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    );
    // Emblem is the default selected role; bind an image so the layer is draggable.
    await page.getByLabel("Upload emblem image").setInputFiles({
      name: "emblem.png", mimeType: "image/png", buffer: pixel,
    });
    await expect(page.getByRole("button", { name: /Emblem Asset bound/i })).toBeVisible();

    const xInput = page.getByLabel("x", { exact: true });
    const yInput = page.getByLabel("y", { exact: true });
    const startX = Number(await xInput.inputValue());
    const startY = Number(await yInput.inputValue());
    expect(startX).toBe(275);
    expect(startY).toBe(120);

    const box = (await page.locator(".card-stage").boundingBox())!;
    const scale = box.width / 750;
    // Emblem center in stage coordinates is (375, 220); drag it +120/+90.
    const originX = box.x + 375 * scale;
    const originY = box.y + 220 * scale;
    await page.mouse.move(originX, originY);
    await page.mouse.down();
    await page.mouse.move(originX + 120 * scale, originY + 90 * scale, { steps: 12 });
    await page.mouse.up();

    await expect.poll(async () => Number(await xInput.inputValue()), { timeout: 4000 }).not.toBe(startX);
    const endX = Number(await xInput.inputValue());
    const endY = Number(await yInput.inputValue());
    expect(endX - startX).toBeGreaterThanOrEqual(100);
    expect(endX - startX).toBeLessThanOrEqual(140);
    expect(endY - startY).toBeGreaterThanOrEqual(70);
    expect(endY - startY).toBeLessThanOrEqual(110);

    // The drag-end update schedules a 450ms-debounced local save. Wait for the
    // full save cycle to flush before reloading, or the new position is lost.
    const saveState = page.locator(".save-state").first();
    await expect(saveState).toHaveText("Saving locally…");
    await expect(saveState).toHaveText("Saved locally");

    await page.reload();
    await expect(page.getByLabel("x", { exact: true })).toHaveValue(String(endX));
    await expect(page.getByLabel("y", { exact: true })).toHaveValue(String(endY));
  });
});

test("has no serious accessibility violations at the access-controlled editor", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});
