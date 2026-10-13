import { expect, test } from "@playwright/test";

test("CSP utiliza un nonce nuevo y permite hidratar el formulario", async ({ page, request }) => {
  const response = await page.goto("/login");
  const policy = response?.headers()["content-security-policy"] ?? "";
  const scripts = policy.split(";").find((directive) => directive.trim().startsWith("script-src")) ?? "";
  const nonce = scripts.match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();
  expect(scripts).not.toContain("'unsafe-inline'");
  expect(response?.headers()["permissions-policy"]).toContain("microphone=(self)");

  const inlineNonces = await page.locator("script:not([src])").evaluateAll((elements) =>
    elements.filter((element) => !element.getAttribute("type") || element.getAttribute("type") === "text/javascript")
      .map((element) => (element as HTMLScriptElement).nonce),
  );
  expect(inlineNonces.length).toBeGreaterThan(0);
  expect(inlineNonces.every((value) => value === nonce)).toBe(true);

  // Client interactivity still works under the enforced policy.
  await page.getByRole("button", { name: "Mostrar contraseña", exact: true }).click();
  await expect(page.getByLabel("Contraseña", { exact: true })).toHaveAttribute("type", "text");

  const secondResponse = await request.get("/login", { headers: { "x-nonce": "untrusted-client-value" } });
  const secondNonce = secondResponse.headers()["content-security-policy"].match(/'nonce-([^']+)'/)?.[1];
  expect(secondNonce).toBeTruthy();
  expect(secondNonce).not.toBe(nonce);
  expect(secondNonce).not.toBe("untrusted-client-value");
});
