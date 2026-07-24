import { expect, test } from "@playwright/test";

test("inicio ignora atributos de seguridad inyectados antes de hidratar", async ({
  page,
}) => {
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

  const nextButton = page.getByRole("button", {
    name: "Siguiente testimonio",
  });
  const previousButton = page.getByRole("button", {
    name: "Testimonio anterior",
  });

  await expect(nextButton).toBeEnabled();
  await nextButton.click();
  await expect(previousButton).toBeEnabled();
  expect(hydrationErrors).toEqual([]);
});
