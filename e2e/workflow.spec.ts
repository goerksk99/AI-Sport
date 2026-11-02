import { test, expect } from "@playwright/test";
const key = "puls:data:v1";
test("Erststart → gemischtes Tracking → Neustart → Abschluss → Korrektur → Fortschritt", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByText("Dein Ziel.")).toBeVisible();
  await page
    .getByRole("textbox", {
      name: "Wie dürfen wir dich nennen? (optional)",
      exact: true,
    })
    .fill("Alex");
  await page
    .getByRole("button", { name: "Muskeln aufbauen", exact: true })
    .click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page.getByRole("button", { name: "Zu Hause", exact: true }).click();
  await page.getByRole("button", { name: "Kurzhanteln", exact: true }).click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page
    .getByRole("button", { name: "Meinen Plan erstellen", exact: true })
    .click();
  await expect(page.getByText("Gut, dass du da bist, Alex.")).toBeVisible();
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Training starten", exact: true })
    .click();
  await expect(page.getByText("Vorschlag · unbestätigt").first()).toBeVisible();
  await page
    .getByRole("textbox", { name: "Wiederholungen Satz 1", exact: true })
    .fill("8");
  await page
    .getByRole("textbox", { name: "Gewicht kg Satz 1", exact: true })
    .fill("12");
  await page
    .getByRole("button", { name: "Satz 1 bestätigen", exact: true })
    .click();
  await expect(page.getByText("✓ Bestätigt").first()).toBeVisible();
  await page
    .getByRole("button", { name: "Training verlassen und speichern" })
    .click();
  await page
    .getByRole("button", { name: "Training fortsetzen", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Wiederholungen Satz 1", exact: true }),
  ).toHaveValue("8");
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Gewicht kg Satz 1", exact: true }),
  ).toHaveValue("12");
  await page
    .getByRole("button", { name: "Nachtragen & Abschluss", exact: true })
    .click();
  const reps = page.getByRole("textbox", {
    name: "Wiederholungen Satz 2",
    exact: true,
  });
  await reps.first().fill("9");
  await page
    .getByRole("button", { name: "Satz 2 bestätigen", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", {
      name: "Alle offenen Sätze als ausgelassen markieren",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Training speichern & abschließen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Trainingshistorie", { exact: true }),
  ).toBeVisible();
  const stored = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!),
    key,
  );
  expect(stored.sessions).toHaveLength(1);
  expect(stored.draft).toBeNull();
  expect(stored.sessions[0].exercises[0].sets[0].reps).toBe(8);
  expect(stored.sessions[0].exercises[0].sets[1].reps).toBe(9);
  expect(
    stored.sessions[0].exercises
      .flatMap((e: any) => e.sets)
      .filter((s: any) => s.status === "confirmed"),
  ).toHaveLength(2);
  await page
    .getByRole("button", { name: /Ganzkörper A vom .* bearbeiten/ })
    .click();
  await page
    .getByRole("textbox", { name: "Wiederholungen Satz 1", exact: true })
    .first()
    .fill("10");
  await page
    .getByRole("button", { name: "Korrektur abschließen", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByText("Trainingshistorie", { exact: true }),
  ).toBeVisible();
  const corrected = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!),
    key,
  );
  expect(corrected.sessions).toHaveLength(1);
  expect(corrected.sessions[0].exercises[0].sets[0].reps).toBe(10);
  await page.getByRole("tab", { name: "Coach", exact: true }).click();
  await page
    .getByRole("button", { name: "Wie viel Pause brauche ich?", exact: true })
    .click();
  await expect(
    page.getByText(/Plane zwischen fordernden Einheiten/),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Heute", exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("Plan bearbeiten, Übung tauschen und Fehler bei unbestätigtem Abschluss", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page
    .getByRole("button", { name: "Meinen Plan erstellen", exact: true })
    .click();
  await page.getByRole("tab", { name: "Training", exact: true }).click();
  await page
    .getByRole("button", { name: "Tauschen", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Kniebeugen", exact: true }).click();
  await page.getByRole("button", { name: "Mehr Sätze 1", exact: true }).click();
  await page.getByRole("button", { name: "Starten", exact: true }).click();
  await expect(page.getByText("Plan: 4 Sätze", { exact: false })).toBeVisible();
  await page
    .getByRole("button", { name: "Nachtragen & Abschluss", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Training speichern & abschließen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Bestätige mindestens einen tatsächlich absolvierten Satz."),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Ja, alle offenen Vorschläge tatsächlich geschafft",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Training speichern & abschließen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Trainingshistorie", { exact: true }),
  ).toBeVisible();
});

test("Ungültige Eingaben blockieren den Sammelabschluss und Profiländerungen behalten Historie", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page
    .getByRole("button", { name: "Meinen Plan erstellen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Training starten", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Nachtragen & Abschluss", exact: true })
    .click();
  const input = page
    .getByRole("textbox", { name: "Wiederholungen Satz 1", exact: true })
    .first();
  await input.fill("-1");
  await expect(
    page.getByRole("button", {
      name: "Ja, alle offenen Vorschläge tatsächlich geschafft",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", {
      name: "Training speichern & abschließen",
      exact: true,
    }),
  ).toBeDisabled();
  await input.fill("10");
  await page
    .getByRole("button", {
      name: "Ja, alle offenen Vorschläge tatsächlich geschafft",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Training speichern & abschließen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Trainingshistorie", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Profil", exact: true }).click();
  await page
    .getByRole("button", { name: "Profil & Plan anpassen", exact: true })
    .click();
  await page
    .getByRole("textbox", {
      name: "Wie dürfen wir dich nennen? (optional)",
      exact: true,
    })
    .fill("Sam");
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page
    .getByRole("button", { name: "Profil & neuen Plan speichern", exact: true })
    .click();
  await expect(
    page.getByText("Dein Training, Sam.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Dein Training, Sam.", { exact: true }),
  ).toBeVisible();
  const d = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!),
    key,
  );
  expect(d.sessions).toHaveLength(1);
  expect(d.profile.name).toBe("Sam");
  expect(d.plan.id).not.toBe(d.sessions[0].planId);
});
