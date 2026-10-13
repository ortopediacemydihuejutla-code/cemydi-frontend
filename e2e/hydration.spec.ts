import { expect, test } from "@playwright/test";

test("inicio ignora atributos de seguridad inyectados antes de hidratar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const markDivs = (node: Node) => {
      if (!(node instanceof Element)) return;

      if (node.tagName === "DIV") {
        node.setAttribute("bis_skin_checked", "1");
      }

      node.querySelectorAll("div").forEach((element) => {
        element.setAttribute("bis_skin_checked", "1");
      });
    };

    new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach(markDivs);
      });
    }).observe(document, {
      childList: true,
      subtree: true,
    });
  });

  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      message.text().includes("A tree hydrated but some attributes")
    ) {
      hydrationErrors.push(message.text());
    }
  });

  await page.goto("/");

  // Exercise hydration without depending on API testimonials or autoplay timing.
  await page.getByRole("button", { name: "Abrir menú", exact: true }).click();
  await expect(page.getByRole("button", { name: "Cerrar menú", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar menú", exact: true }).click();
  await expect(page.getByRole("button", { name: "Abrir menú", exact: true })).toBeVisible();
  expect(hydrationErrors).toEqual([]);
});
