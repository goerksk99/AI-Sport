import { test } from "node:test";
import assert from "node:assert/strict";
import {
  availableExercises,
  generatePlan,
  startSession,
  plannedExercise,
  completeSession,
  record,
  emptyData,
} from "../src/domain/training";
import { demoCoach } from "../src/domain/coach";
import { createRepository, STORAGE_KEY } from "../src/storage/repository";
import { UserProfile, WorkoutSession } from "../src/domain/types";
const profile: UserProfile = {
  id: "person",
  createdAt: new Date().toISOString(),
  name: "Alex",
  goal: "muscle",
  level: "beginner",
  days: 3,
  minutes: 45,
  location: "home",
  equipment: ["body"],
  preferences: ["strength"],
};
const setup = () => {
  const plan = generatePlan(profile);
  const draft = startSession(plan, plan.workouts[0].id, []);
  return { ...emptyData(), profile, plan, draft };
};
const confirmAll = (s: WorkoutSession): WorkoutSession => ({
  ...s,
  exercises: s.exercises.map((e) => ({
    ...e,
    sets: e.sets.map((x) => ({
      ...x,
      status: "confirmed",
      confirmedAt: new Date().toISOString(),
    })),
  })),
});
test("Onboarding creates appropriate beginner home plan with stable relationships", () => {
  const d = setup();
  assert.equal(d.plan.workouts.length, 3);
  assert.equal(d.plan.profileId, profile.id);
  const available = availableExercises(profile).map((x) => x.id);
  for (const w of d.plan.workouts) {
    assert.match(w.name, /Ganzkörper/);
    for (const e of w.exercises) assert.ok(available.includes(e.exerciseId));
  }
  assert.equal(
    new Set(
      d.plan.workouts.flatMap((x) =>
        x.exercises.flatMap((e) => e.sets.map((s) => s.id)),
      ),
    ).size,
    45,
  );
});
test("Advanced four-day equipment-aware split and cardio", () => {
  const p = {
    ...profile,
    level: "advanced" as const,
    days: 4,
    minutes: 25,
    equipment: ["body", "dumbbell"] as UserProfile["equipment"],
    preferences: ["strength", "cardio"] as UserProfile["preferences"],
  };
  const plan = generatePlan(p);
  assert.match(plan.workouts[0].name, /Oberkörper/);
  assert.match(plan.workouts[1].name, /Unterkörper/);
  assert.ok(
    plan.workouts.every((w) =>
      w.exercises.some((e) => e.exerciseId === "march"),
    ),
  );
  assert.ok(
    plan.workouts.every((w) => w.exercises.every((e) => e.sets.length <= 2)),
  );
});
test("Suggested and skipped values never count toward progress", () => {
  const d = setup();
  let s = d.draft;
  assert.equal(record(s).sets, 0);
  assert.equal(record(s).volume, 0);
  s = {
    ...s,
    exercises: s.exercises.map((e, i) => ({
      ...e,
      sets: e.sets.map((x, j) => ({
        ...x,
        status: i === 0 && j === 0 ? "confirmed" : "skipped",
      })),
    })),
  };
  assert.equal(record(s).sets, 1);
  assert.equal(record(s).volume, 0);
});
test("Mixed live and later entries merge; incomplete entries cannot silently finalize", () => {
  let d = setup();
  const s = d.draft;
  s.exercises[0].sets[0].status = "confirmed";
  s.exercises[0].sets[0].reps = 8;
  assert.throws(() => completeSession(d, s), /offene/);
  s.exercises[1].sets[0].status = "confirmed";
  s.exercises[1].sets[0].reps = 11;
  for (const e of s.exercises)
    for (const x of e.sets) if (x.status === "pending") x.status = "skipped";
  const saved = completeSession(d, s);
  assert.equal(saved.draft, null);
  assert.equal(record(saved.sessions[0]).sets, 2);
  assert.equal(saved.sessions[0].exercises[0].sets[0].reps, 8);
  assert.equal(saved.sessions[0].exercises[1].sets[0].reps, 11);
});
test("Completing twice upserts, correction recalculates and preserves completion timestamp", () => {
  const d = setup();
  const completed = completeSession(d, confirmAll(d.draft));
  const session = completed.sessions[0];
  const corrected = {
    ...session,
    exercises: session.exercises.map((e, i) => ({
      ...e,
      sets: e.sets.map((s, j) =>
        i === 0 && j === 0 ? { ...s, status: "skipped" as const } : s,
      ),
    })),
  };
  const saved = completeSession(completed, corrected);
  assert.equal(saved.sessions.length, 1);
  assert.equal(saved.sessions[0].completedAt, session.completedAt);
  assert.equal(record(saved.sessions[0]).sets, record(session).sets - 1);
});
test("Last confirmed values are suggestions, not confirmed performances", () => {
  const d = setup();
  const history = confirmAll(d.draft);
  history.exercises[0].sets[0].reps = 7;
  const next = startSession(d.plan, d.plan.workouts[0].id, [
    { ...history, status: "completed", completedAt: new Date().toISOString() },
  ]);
  assert.equal(next.exercises[0].sets[0].reps, 7);
  assert.equal(next.exercises[0].sets[0].status, "pending");
  assert.equal(record(next).sets, 0);
});
test("Weighted volume excludes unconfirmed, skipped and timed work", () => {
  const p = {
    ...profile,
    equipment: ["body", "gym"] as UserProfile["equipment"],
  };
  const plan = generatePlan(p);
  const s = startSession(plan, plan.workouts[0].id, []);
  s.exercises[0].sets[0] = {
    ...s.exercises[0].sets[0],
    status: "confirmed",
    weight: 20,
    reps: 10,
  };
  s.exercises[0].sets[1] = {
    ...s.exercises[0].sets[1],
    status: "pending",
    weight: 100,
    reps: 10,
  };
  const core = s.exercises.find((e) => e.exerciseId === "deadbug")!;
  core.exerciseId = "plank";
  const plank = core;
  plank.sets[0] = {
    ...plank.sets[0],
    status: "confirmed",
    weight: 20,
    reps: 30,
  };
  assert.equal(record(s).volume, 200);
  assert.equal(record(s).sets, 2);
});
test("Plan edits cannot mutate a running session snapshot", () => {
  const d = setup();
  const original = d.draft.exercises[0].plannedSets[0].reps;
  d.plan.workouts[0].exercises[0].sets[0].reps = 99;
  assert.equal(d.draft.exercises[0].plannedSets[0].reps, original);
});
test("No empty completed training and no unsupported coach progress", () => {
  const d = setup();
  assert.throws(() => completeSession(d, d.draft), /mindestens/);
  assert.equal(demoCoach.recommend([])[0].id, "start");
  assert.notEqual(demoCoach.recommend([d.draft, d.draft])[0].id, "grow");
  assert.match(demoCoach.answer("Ich habe Schmerzen", []), /fachlich/);
});
test("Persistent draft restores mixed entries, profile and plan after restart", async () => {
  const map = new Map<string, string>();
  const storage = {
    async getItem(k: string) {
      return map.get(k) ?? null;
    },
    async setItem(k: string, v: string) {
      map.set(k, v);
    },
  };
  const first = createRepository(storage);
  const d = setup();
  d.draft.exercises[0].sets[0].status = "confirmed";
  d.draft.exercises[1].sets[0].status = "skipped";
  await first.save(d);
  const second = createRepository(storage);
  assert.deepEqual(await second.load(), JSON.parse(JSON.stringify(d)));
});
test("Serial writes cannot overwrite a newer draft with an older one", async () => {
  let raw: string | null = null;
  let calls = 0;
  const storage = {
    async getItem() {
      return raw;
    },
    async setItem(_k: string, v: string) {
      const delay = ++calls === 1 ? 30 : 0;
      await new Promise((r) => setTimeout(r, delay));
      raw = v;
    },
  };
  const repo = createRepository(storage);
  const a = setup();
  const b = { ...a, draft: { ...a.draft, name: "Neuester Stand" } };
  await Promise.all([repo.save(a), repo.save(b)]);
  assert.equal((await repo.load()).draft?.name, "Neuester Stand");
});
test("Storage failure is visible, retry succeeds and corruption is preserved", async () => {
  let fail = true;
  let raw: string | null = null;
  const repo = createRepository({
    async getItem() {
      return raw;
    },
    async setItem(_k, v) {
      if (fail) throw new Error("quota");
      raw = v;
    },
  });
  await assert.rejects(repo.save(setup()), /quota/);
  fail = false;
  await repo.save(setup());
  assert.ok((await repo.load()).profile);
  raw = "{broken";
  await assert.rejects(repo.load());
  assert.equal(raw, "{broken");
});

test("Corrupt nested data, unknown exercises and duplicate sessions fail without writes", async () => {
  const d = setup();
  const corrupted = {
    ...d,
    draft: {
      ...d.draft,
      exercises: [{ ...d.draft.exercises[0], exerciseId: "unknown" }],
    },
  };
  let writes = 0;
  let raw = JSON.stringify(corrupted);
  const repo = createRepository({
    async getItem() {
      return raw;
    },
    async setItem() {
      writes++;
    },
  });
  await assert.rejects(repo.load(), /nicht gelesen/);
  assert.equal(writes, 0);
  const saved = completeSession(d, confirmAll(d.draft));
  raw = JSON.stringify({
    ...saved,
    sessions: [saved.sessions[0], saved.sessions[0]],
  });
  await assert.rejects(repo.load(), /nicht gelesen/);
  assert.equal(writes, 0);
});
test("Invalid confirmed set values cannot be finalized", () => {
  const d = setup();
  const s = confirmAll(d.draft);
  s.exercises[0].sets[0].reps = -1;
  assert.throws(() => completeSession(d, s), /gültige/);
  s.exercises[0].sets[0].reps = 10;
  s.exercises[0].sets[0].weight = NaN;
  assert.throws(() => completeSession(d, s), /gültige/);
});
test("Coach only suggests weight progression for same exercise and comparable loads", () => {
  const p = {
    ...profile,
    equipment: ["body", "gym"] as UserProfile["equipment"],
  };
  const plan = generatePlan(p);
  const a = confirmAll(startSession(plan, plan.workouts[0].id, []));
  a.status = "completed";
  a.completedAt = "2026-01-01T10:00:00.000Z";
  a.exercises.forEach((e) => e.sets.forEach((s) => (s.weight = 20)));
  const b = JSON.parse(JSON.stringify(a)) as WorkoutSession;
  b.id = "second";
  b.completedAt = "2026-01-02T10:00:00.000Z";
  assert.equal(demoCoach.recommend([a, b])[0].id, "grow");
  b.exercises.forEach((e) => e.sets.forEach((s) => (s.weight = 10)));
  assert.equal(demoCoach.recommend([a, b])[0].id, "consistent");
  b.exercises[0].sets[0].reps = 1;
  assert.equal(demoCoach.recommend([a, b])[0].id, "hold");
  a.exercises[0].sets[0].reps = 1;
  assert.equal(demoCoach.recommend([a, b])[0].id, "review");
});
