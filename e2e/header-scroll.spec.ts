import { expect, test } from "@playwright/test";

for (const width of [392, 1440]) {
  test(`header mantiene altura estable y no alterna con pequeños movimientos a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 852 });
    await page.goto("/");
    const header = page.locator("header");
    const bar = page.locator('aside[aria-label="Barra informativa superior"]');
    await expect(bar).toHaveAttribute("aria-hidden", "false");
    const height = await header.evaluate((element) => element.getBoundingClientRect().height);
    await page.evaluate(() => window.scrollTo(0, 140));
    await expect(bar).toHaveAttribute("aria-hidden", "true");
    await expect(header).toHaveCSS("top", "-36px");
    expect(await header.evaluate((element) => element.getBoundingClientRect().height)).toBe(height);
    await page.screenshot({ path: `output/playwright/header-scroll-${width}.png` });
    // Repeated small reversals model touch momentum near the old collapse threshold.
    const states = await page.evaluate(async () => {
      const bar = document.querySelector('aside[aria-label="Barra informativa superior"]')!;
      const values: (string | null)[] = [];
      for (const y of [132, 138, 130, 136, 128, 134]) {
        window.scrollTo(0, y);
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        values.push(bar.getAttribute("aria-hidden"));
      }
      return values;
    });
    expect(states).toEqual(Array(6).fill("true"));
    await page.evaluate(() => window.scrollTo(0, 60));
    await expect(bar).toHaveAttribute("aria-hidden", "false");
    expect(await header.evaluate((element) => element.getBoundingClientRect().height)).toBe(height);
  });
}
