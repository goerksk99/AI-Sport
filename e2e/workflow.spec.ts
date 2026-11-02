import { test, expect, Page } from "@playwright/test";
const key = "puls:data:v1";
async function onboarding(page: Page, style?: string) {
  await page.goto("/");
  await page
    .getByRole("textbox", {
      name: "Wie dürfen wir dich nennen? (optional)",
      exact: true,
    })
    .fill("Alex");
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  if (style)
    await page.getByRole("button", { name: style, exact: true }).click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page
    .getByRole("button", { name: "Meinen Plan erstellen", exact: true })
    .click();
  await expect(page.getByText("Gut, dass du da bist, Alex.")).toBeVisible();
}
const load = (page: Page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
async function history(page: Page) {
  await expect(
    page.getByText("Trainingshistorie", { exact: true }),
  ).toBeVisible();
}

test("Ein Aktion-Abschluss ohne Pflichtangaben und Wiederherstellung", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await onboarding(page);
  await page
    .getByRole("button", { name: "Training starten", exact: true })
    .click();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await page.screenshot({
    path: "test-results/training-simple-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("button", {
      name: "Alles wie vorgeschlagen geschafft",
      exact: true,
    })
    .click();
  await history(page);
  let d = await load(page);
  expect(d.sessions).toHaveLength(1);
  expect(d.draft).toBeNull();
  expect(
    d.sessions[0].exercises
      .flatMap((e: any) => e.sets)
      .every((s: any) => s.status === "confirmed"),
  ).toBeTruthy();
  await page.reload();
  await history(page);
  d = await load(page);
  expect(d.sessions).toHaveLength(1);
  await page.getByRole("tab", { name: "Coach", exact: true }).click();
  await page
    .getByRole("button", { name: "Wie viel Pause brauche ich?", exact: true })
    .click();
  await expect(
    page.getByText(/Plane zwischen fordernden Einheiten/),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("Übung bearbeiten, Details mischen, Entwurf fortsetzen und Korrektur ohne Duplikate", async ({
  page,
}) => {
  await onboarding(page);
  await page
    .getByRole("button", { name: "Training starten", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Etwas war anders", exact: true })
    .click();
  const name = (await load(page)).draft.exercises[0].exerciseId;
  expect(name).toBe("legpress");
  await page
    .getByRole("button", { name: "Beinpresse: ändern", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Sätze Beinpresse", exact: true })
    .fill("2");
  await page
    .getByRole("textbox", { name: "Wiederholungen Beinpresse", exact: true })
    .fill("8");
  await page
    .getByRole("textbox", {
      name: "Gewicht kg Beinpresse (optional)",
      exact: true,
    })
    .fill("40");
  await expect(
    page.getByRole("button", {
      name: "Alles wie vorgeschlagen geschafft",
      exact: true,
    }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Werte übernehmen & geschafft", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Brustpresse: auslassen", exact: true })
    .click();
  await page.getByRole("button", { name: "Detailliert", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Wiederholungen Satz 1", exact: true })
    .first()
    .fill("9");
  await page
    .getByRole("button", { name: "Nur Abweichungen", exact: true })
    .click();
  await page.getByRole("button", { name: "Zurück", exact: true }).click();
  await page
    .getByRole("button", { name: "Training fortsetzen", exact: true })
    .click();
  await page.reload();
  await page
    .getByRole("button", { name: "Etwas war anders", exact: true })
    .click();
  await expect(page.getByText("2 × 9 · 40 kg", { exact: true })).toHaveCount(0); // only first set changed
  await expect(
    page.getByText("9 / 40 kg · 8 / 40 kg", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Alles wie vorgeschlagen geschafft",
      exact: true,
    })
    .click();
  await history(page);
  let d = await load(page);
  expect(d.sessions).toHaveLength(1);
  expect(d.sessions[0].exercises[0].sets[0].reps).toBe(9);
  expect(
    d.sessions[0].exercises[1].sets.every((s: any) => s.status === "skipped"),
  ).toBeTruthy();
  await page
    .getByRole("button", { name: /Ganzkörper A vom .* bearbeiten/ })
    .click();
  await page
    .getByRole("button", { name: "Beinpresse: ändern", exact: true })
    .click();
  await page
    .getByRole("textbox", {
      name: "Gewicht kg Beinpresse (optional)",
      exact: true,
    })
    .fill("45");
  await page
    .getByRole("button", { name: "Werte übernehmen & geschafft", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Korrektur abschließen", exact: true })
    .click();
  await history(page);
  d = await load(page);
  expect(d.sessions).toHaveLength(1);
  expect(d.sessions[0].exercises[0].sets[0].weight).toBe(45);
});

test("Nachtragen ohne Startzeit, nur Einheit speichern und später echte Leistung ergänzen", async ({
  page,
}) => {
  await onboarding(page);
  await page
    .getByRole("button", {
      name: "Schon trainiert? Jetzt eintragen",
      exact: true,
    })
    .click();
  await expect(page.getByText(/Dauer nicht erfasst/)).toBeVisible();
  await page
    .getByRole("button", {
      name: "Nur Training als absolviert speichern",
      exact: true,
    })
    .click();
  await history(page);
  await expect(
    page.getByText("Dein Rhythmus wird sichtbar.", { exact: true }),
  ).toBeVisible();
  let d = await load(page);
  expect(d.sessions[0].durationUnknown).toBeTruthy();
  expect(
    d.sessions[0].exercises
      .flatMap((e: any) => e.sets)
      .every((s: any) => s.status === "assumed"),
  ).toBeTruthy();
  await page.reload();
  await history(page);
  await page
    .getByRole("button", { name: /Ganzkörper A vom .* bearbeiten/ })
    .click();
  await expect(
    page.getByText("Nach Plan angenommen", { exact: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Beinpresse: geschafft", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Korrektur abschließen", exact: true })
    .click();
  await history(page);
  d = await load(page);
  expect(d.sessions).toHaveLength(1);
  expect(
    d.sessions[0].exercises[0].sets.every((s: any) => s.status === "confirmed"),
  ).toBeTruthy();
  expect(d.sessions[0].exercises[1].sets[0].status).toBe("assumed");
});

test("Freiwillige Selbsteinschätzung bleibt als Bereich erhalten und erzeugt passende Vorschläge", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page
    .getByRole("button", { name: "Langhantel & Hantelbank", exact: true })
    .click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Ausgangswerte hinzufügen (optional)",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Langhantel-Bankdrücken", exact: true })
    .click();
  await page
    .getByRole("textbox", {
      name: "Übliches Gewicht kg (optional)",
      exact: true,
    })
    .fill("100");
  await page
    .getByRole("button", { name: "Ausgangswerte übernehmen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Meinen Plan erstellen", exact: true })
    .click();
  let d = await load(page);
  expect(d.sessions).toHaveLength(0);
  expect(d.profile.assessments[0]).toMatchObject({
    weight: 100,
    setsMin: 3,
    setsMax: 4,
    repsMin: 6,
    repsMax: 10,
  });
  await page
    .getByRole("button", { name: "Training starten", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Etwas war anders", exact: true })
    .click();
  await expect(page.getByText("3 × 8 · 100 kg", { exact: true })).toBeVisible();
  await expect(page.getByText(/Aus deiner Selbsteinschätzung/)).toBeVisible();
  await page
    .getByRole("button", {
      name: "Langhantel-Bankdrücken: ändern",
      exact: true,
    })
    .click();
  await page
    .getByRole("textbox", {
      name: "Gewicht kg Langhantel-Bankdrücken (optional)",
      exact: true,
    })
    .fill("95");
  await page
    .getByRole("button", { name: "Werte übernehmen & geschafft", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Alles wie vorgeschlagen geschafft",
      exact: true,
    })
    .click();
  await history(page);
  await page.getByRole("tab", { name: "Training", exact: true }).click();
  await page.getByRole("button", { name: "Starten", exact: true }).click();
  await page
    .getByRole("button", { name: "Etwas war anders", exact: true })
    .click();
  await expect(page.getByText("3 × 8 · 95 kg", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/training-quick-desktop.png",
    fullPage: true,
  });
});

test("Calisthenics ohne Geräte und Kraftausdauer ändern den Plan; Profiländerung behält Historie", async ({
  page,
}) => {
  await onboarding(page, "Calisthenics");
  let d = await load(page);
  expect(d.profile.trainingStyle).toBe("calisthenics");
  expect(
    d.plan.workouts[0].exercises.some((e: any) => e.exerciseId === "pushup"),
  ).toBeTruthy();
  await page
    .getByRole("button", { name: "Training starten", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Nur Training als absolviert speichern",
      exact: true,
    })
    .click();
  await history(page);
  await page.getByRole("tab", { name: "Profil", exact: true }).click();
  await page
    .getByRole("button", { name: "Profil & Plan anpassen", exact: true })
    .click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page
    .getByRole("button", { name: "Kraftausdauer", exact: true })
    .click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page
    .getByRole("button", { name: "Profil & neuen Plan speichern", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByText("Dein Training, Alex.", { exact: true }),
  ).toBeVisible();
  d = await load(page);
  expect(d.sessions).toHaveLength(1);
  expect(d.profile.trainingStyle).toBe("endurance");
  expect(d.plan.workouts[0].exercises[0].sets[0].reps).toBe(18);
  expect(d.plan.workouts[0].exercises[0].restSeconds).toBe(40);
});

test("Details: ungültige Werte blockieren Abschluss und Plan bleibt bearbeitbar", async ({
  page,
}) => {
  await onboarding(page);
  await page.getByRole("tab", { name: "Training", exact: true }).click();
  await page
    .getByRole("button", { name: "Tauschen", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Kniebeugen", exact: true }).click();
  await page.getByRole("button", { name: "Mehr Sätze 1", exact: true }).click();
  await page.getByRole("button", { name: "Starten", exact: true }).click();
  await page.getByRole("button", { name: "Detailliert", exact: true }).click();
  const input = page
    .getByRole("textbox", { name: "Wiederholungen Satz 1", exact: true })
    .first();
  await input.fill("-1");
  await expect(
    page.getByRole("button", {
      name: "Alles wie vorgeschlagen geschafft",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", {
      name: "Nur Training als absolviert speichern",
      exact: true,
    }),
  ).toBeDisabled();
  await input.fill("10");
  await page
    .getByRole("button", {
      name: "Alles wie vorgeschlagen geschafft",
      exact: true,
    })
    .click();
  await history(page);
  const d = await load(page);
  expect(d.sessions[0].exercises[0].sets).toHaveLength(4);
});

test("Gemeinsame Eingabe wird automatisch wiederhergestellt und kann abgebrochen werden", async ({
  page,
}) => {
  await onboarding(page);
  await page
    .getByRole("button", { name: "Training starten", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Etwas war anders", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Beinpresse: ändern", exact: true })
    .click();
  await page
    .getByRole("textbox", {
      name: "Gewicht kg Beinpresse (optional)",
      exact: true,
    })
    .fill("32,5");
  await page
    .getByRole("textbox", { name: "Wiederholungen Beinpresse", exact: true })
    .fill("9");
  await page.reload();
  await expect(
    page.getByRole("textbox", {
      name: "Gewicht kg Beinpresse (optional)",
      exact: true,
    }),
  ).toHaveValue("32,5");
  await expect(
    page.getByRole("textbox", {
      name: "Wiederholungen Beinpresse",
      exact: true,
    }),
  ).toHaveValue("9");
  await expect(
    page.getByRole("button", {
      name: "Alles wie vorgeschlagen geschafft",
      exact: true,
    }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Abbrechen", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Alles wie vorgeschlagen geschafft",
      exact: true,
    }),
  ).toBeEnabled();
  const d = await load(page);
  expect(d.draft.exercises[0].sets[0].status).toBe("pending");
  expect(d.draft.exercises[0].editDraft).toBeUndefined();
});

test("Coach-Vorschlag ändert erst nach Übernahme den zukünftigen Plan", async ({
  page,
}) => {
  await onboarding(page);
  await page.getByRole("tab", { name: "Training", exact: true }).click();
  await page.getByRole("button", { name: "Starten", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Alles wie vorgeschlagen geschafft",
      exact: true,
    })
    .click();
  await history(page);
  await page.getByRole("tab", { name: "Training", exact: true }).click();
  await page.getByRole("button", { name: "Starten", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Alles wie vorgeschlagen geschafft",
      exact: true,
    })
    .click();
  await history(page);
  const before = await load(page);
  await page.getByRole("tab", { name: "Coach", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Vorschlag für nächste Trainings übernehmen",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Vorschlag für nächste Trainings übernehmen",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Im Plan übernommen", exact: true }),
  ).toBeDisabled();
  const after = await load(page);
  expect(after.sessions).toEqual(before.sessions);
  expect(after.plan).not.toEqual(before.plan);
});

test("Darstellungen vereinfachen die Oberfläche und behalten dieselben Leistungsdaten", async ({
  page,
}) => {
  await onboarding(page);
  await page
    .getByRole("button", { name: "Training starten", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Nur Abweichungen", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Beinpresse: geschafft", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Beinpresse: geschafft", exact: true })
    .click();
  const before = (await load(page)).draft.exercises;
  await page.getByRole("button", { name: "Detailliert", exact: true }).click();
  await expect(
    page
      .getByRole("textbox", { name: "Wiederholungen Satz 1", exact: true })
      .first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Übersicht anzeigen", exact: true })
    .click();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  expect((await load(page)).draft.exercises).toEqual(before);
  await page
    .getByRole("button", { name: "Nur Abweichungen", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Beinpresse: geschafft", exact: true }),
  ).toBeVisible();
  expect((await load(page)).draft.exercises).toEqual(before);
});

test("Kalender: Trainings- und Ruhetage, Tagesänderung und Wiederherstellung", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-02T12:00:00+01:00") });
  await onboarding(page);
  await page
    .getByRole("button", { name: "Kalender öffnen", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "2026-11-02: Training", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "2026-11-03: Ruhetag", exact: true })
    .click();
  await expect(page.getByText("Ruhetag", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ganzkörper A", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "2026-11-03: Training", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Trainingstage ändern", exact: true })
    .click();
  for (const label of ["Mo", "Mi", "Fr", "Di", "Do", "Sa"])
    await page.getByRole("button", { name: label, exact: true }).click();
  await page
    .getByRole("button", { name: "Wochenrhythmus speichern", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "2026-11-03: Training", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "2026-11-05: Training", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Als Ruhetag planen", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "2026-11-05: Ruhetag", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Wochenplan übernehmen", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "2026-11-05: Training", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/calendar-mobile.png",
    fullPage: true,
  });
});

test("Kalender: vergangenes Training am richtigen Tag eintragen und Leistungen erhalten", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-02T12:00:00+01:00") });
  await onboarding(page);
  await page
    .getByRole("button", { name: "Kalender öffnen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "2026-11-01: Ohne Plan", exact: true })
    .click();
  await page.getByRole("button", { name: "Ganzkörper A", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Training für diesen Tag nachtragen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Trainingstag: 1.11.2026", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Nur Training als absolviert speichern",
      exact: true,
    })
    .click();
  await history(page);
  let d = await load(page);
  expect(d.sessions[0].trainingDate).toBe("2026-11-01");
  expect(d.sessions[0].durationUnknown).toBeTruthy();
  await page.getByRole("tab", { name: "Training", exact: true }).click();
  await page
    .getByRole("button", { name: "Kalender & Ruhetage", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "2026-11-01: Training, absolviert",
      exact: true,
    })
    .click();
  await expect(
    page
      .getByText("An diesem Tag absolviert", { exact: true })
      .filter({ visible: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Als Ruhetag planen", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "2026-11-01: Ruhetag, absolviert",
      exact: true,
    }),
  ).toBeVisible();
  d = await load(page);
  expect(d.sessions).toHaveLength(1);
  expect(d.sessions[0].trainingDate).toBe("2026-11-01");
});

test("Coach: wiederholte Fragen erzeugen nur eine aktualisierte Antwort", async ({
  page,
}) => {
  await onboarding(page);
  await page.getByRole("tab", { name: "Coach", exact: true }).click();
  const button = page.getByRole("button", {
    name: "Wie mache ich Fortschritte?",
    exact: true,
  });
  await button.click();
  await button.click();
  await button.click();
  await expect(page.getByTestId("coach-message")).toHaveCount(1);
  await page
    .getByRole("textbox", { name: "Deine Frage", exact: true })
    .fill("  Wie mache ich Fortschritte?  ");
  await page.getByRole("button", { name: "Senden", exact: true }).click();
  await expect(page.getByTestId("coach-message")).toHaveCount(1);
  await expect(
    page.getByTestId("coach-message").getByText(/0 bestätigte/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Verlauf leeren", exact: true })
    .click();
  await expect(page.getByTestId("coach-message")).toHaveCount(0);
});

test("Coach: persönliche Planvorschau verändert erst nach Zustimmung den zukünftigen Plan", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await onboarding(page);
  await page
    .getByRole("button", { name: "Training starten", exact: true })
    .click();
  const before = await load(page);
  await page.getByRole("tab", { name: "Coach", exact: true }).click();
  await page
    .getByRole("button", { name: "Plan gemeinsam anpassen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Anpassung als Vorschau zeigen", exact: true })
    .click();
  await expect(
    page.getByText(/Ein neuer Plan ist dafür nicht nötig/),
  ).toBeVisible();
  await page.getByRole("button", { name: "20 Min.", exact: true }).click();
  await page.getByRole("button", { name: "Cardio", exact: true }).click();
  await page
    .getByRole("button", { name: "Anpassung als Vorschau zeigen", exact: true })
    .click();
  expect((await load(page)).plan.id).toBe(before.plan.id);
  await page
    .getByRole("button", { name: "Diese Planänderung übernehmen", exact: true })
    .click();
  const after = await load(page);
  expect(after.profile.minutes).toBe(20);
  expect(after.profile.trainingStyle).toBe("cardio");
  expect(after.plan.workouts[0].name).toBe("Cardio A");
  expect(after.draft).toEqual(before.draft);
  expect(after.sessions).toEqual(before.sessions);
  await expect(
    page.getByRole("button", { name: "Planänderung übernommen", exact: true }),
  ).toBeDisabled();
  expect(errors).toEqual([]);
});

test("Bibliothek: Kettlebell filtern, Übung ergänzen und vorhandenen Entwurf erhalten", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page.getByRole("button", { name: "Kettlebell", exact: true }).click();
  await page
    .getByRole("button", { name: "Functional / CrossFit", exact: true })
    .click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page
    .getByRole("button", { name: "Meinen Plan erstellen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Training starten", exact: true })
    .click();
  const before = await load(page);
  await page.getByRole("tab", { name: "Training", exact: true }).click();
  await page
    .getByRole("button", { name: "Übungsbibliothek", exact: true })
    .click();
  await page.getByRole("button", { name: "Kettlebell", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Übung suchen", exact: true })
    .fill("Reverse");
  await page
    .getByRole("button", {
      name: "Hinzufügen: Kettlebell Reverse Lunge",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Bereits im Training", exact: true }),
  ).toBeDisabled();
  const after = await load(page);
  expect(after.plan.workouts[0].exercises).toHaveLength(
    before.plan.workouts[0].exercises.length + 1,
  );
  expect(after.draft).toEqual(before.draft);
  await page.reload();
  await page
    .getByRole("textbox", { name: "Übung suchen", exact: true })
    .fill("Reverse");
  await expect(
    page.getByRole("button", { name: "Bereits im Training", exact: true }),
  ).toBeDisabled();
});

test("Cardio ist eigenständige Trainingsart mit zeitbasierten Übungen", async ({
  page,
}) => {
  await onboarding(page, "Cardio");
  const d = await load(page);
  expect(d.profile.trainingStyle).toBe("cardio");
  expect(d.plan.workouts[0].name).toBe("Cardio A");
  expect(d.plan.workouts[0].exercises).toHaveLength(2);
  expect(
    d.plan.workouts[0].exercises.reduce(
      (n: number, e: any) =>
        n + e.sets.reduce((a: number, s: any) => a + s.reps, 0),
      0,
    ),
  ).toBe(45 * 60);
  await page
    .getByRole("button", { name: "Training starten", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Alles wie vorgeschlagen geschafft",
      exact: true,
    })
    .click();
  await history(page);
});
