import { test } from "node:test";
import assert from "node:assert/strict";
import { UserProfile, WorkoutSession } from "../src/domain/types";
import {
  generatePlan,
  startSession,
  record,
  resolveOpen,
  resolveExercise,
  editExercise,
  completeSession,
  emptyData,
  availableExercises,
} from "../src/domain/training";
import { parseData } from "../src/storage/validation";
import { demoCoach } from "../src/domain/coach";
import { exerciseById } from "../src/data/exercises";
const p: UserProfile = {
  id: "p",
  name: "Alex",
  createdAt: "2026-01-01T00:00:00Z",
  goal: "muscle",
  level: "beginner",
  days: 3,
  minutes: 45,
  location: "gym",
  equipment: ["body", "gym", "barbell"],
  preferences: ["strength"],
};
function setup(profile = p) {
  const plan = generatePlan(profile);
  return {
    ...emptyData(),
    profile,
    plan,
    draft: startSession(plan, plan.workouts[0].id, []),
  };
}
test("A simple one-action completion counts a workout but never performance", () => {
  const d = setup();
  const s = resolveOpen(d.draft, "assumed");
  const saved = completeSession(d, s);
  assert.equal(saved.sessions.length, 1);
  assert.equal(record(saved.sessions[0]).sets, 0);
  assert.equal(record(s).volume, 0);
  assert.equal(
    record(s).assumedSets,
    s.exercises.flatMap((e) => e.sets).length,
  );
  assert.notEqual(demoCoach.recommend(saved.sessions)[0].id, "grow");
});
test("A whole-workout confirmation preserves skips, edits and existing confirmations", () => {
  const d = setup();
  let s = resolveExercise(d.draft, d.draft.exercises[0].id, "skipped");
  s.exercises[1] = editExercise(s.exercises[1], 2, 7, 35);
  s = resolveOpen(s, "confirmed");
  assert.ok(s.exercises[0].sets.every((x) => x.status === "skipped"));
  assert.equal(s.exercises[1].sets.length, 2);
  assert.equal(s.exercises[1].sets[0].reps, 7);
  assert.equal(s.exercises[1].sets[0].weight, 35);
  assert.ok(s.exercises[2].sets.every((x) => x.status === "confirmed"));
  assert.equal(completeSession(d, s).sessions.length, 1);
});
test("Simple finish preserves already documented actual performance", () => {
  const d = setup();
  d.draft.exercises[0] = editExercise(d.draft.exercises[0], 2, 8, 20);
  const s = resolveOpen(d.draft, "assumed");
  assert.equal(record(s).sets, 2);
  assert.equal(record(s).volume, 320);
  assert.ok(record(s).assumedSets > 0);
});
test("Posthoc sessions have unknown duration unless explicitly entered", () => {
  const d = setup();
  const s = startSession(d.plan, d.plan.workouts[0].id, [], { posthoc: true });
  assert.equal(record(s).durationMinutes, null);
  s.enteredDurationMinutes = 48;
  assert.equal(record(s).durationMinutes, 48);
});
test("Exercise-level edits retain planned targets and produce consistent set IDs", () => {
  const d = setup();
  const e = d.draft.exercises[0];
  const old = e.plannedSets[0].reps;
  const changed = editExercise(e, 4, 6, 50);
  assert.equal(changed.plannedSets.length, 4);
  assert.equal(changed.sets.length, 4);
  assert.equal(changed.plannedSets[0].reps, old);
  assert.equal(new Set(changed.sets.map((s) => s.id)).size, 4);
  assert.ok(
    changed.sets.every((s) =>
      changed.plannedSets.some((p) => p.id === s.plannedSetId),
    ),
  );
  assert.equal(changed.sets[0].status, "confirmed");
});
test("New confirmed counts and weights become pending suggestions next time", () => {
  const d = setup();
  d.draft.exercises[0] = editExercise(d.draft.exercises[0], 4, 8, 42);
  const saved = completeSession(d, resolveOpen(d.draft, "confirmed"));
  const next = startSession(d.plan, d.plan.workouts[0].id, saved.sessions);
  assert.equal(next.exercises[0].sets.length, 4);
  assert.equal(next.exercises[0].sets[0].weight, 42);
  assert.equal(next.exercises[0].source, "history");
  assert.equal(record(next).sets, 0);
});
test("A later assumed session cannot replace the most recent actual values", () => {
  const d = setup();
  d.draft.exercises[0] = editExercise(d.draft.exercises[0], 3, 7, 30);
  const actual = completeSession(d, resolveOpen(d.draft, "confirmed"))
    .sessions[0];
  const assumed = {
    ...resolveOpen(startSession(d.plan, d.plan.workouts[0].id, []), "assumed"),
    status: "completed" as const,
    completedAt: "2090-01-01T00:00:00Z",
    updatedAt: "2090-01-01T00:00:00Z",
  };
  const next = startSession(d.plan, d.plan.workouts[0].id, [assumed, actual]);
  assert.equal(next.exercises[0].sets[0].weight, 30);
});
test("Manual plan edits newer than performance take priority", () => {
  const d = setup();
  const history = completeSession(
    d,
    resolveOpen(d.draft, "confirmed"),
  ).sessions;
  d.plan.workouts[0].exercises[0].editedAt = "2090-01-01T00:00:00Z";
  d.plan.workouts[0].exercises[0].sets.forEach((s) => (s.reps = 15));
  const next = startSession(d.plan, d.plan.workouts[0].id, history);
  assert.equal(next.exercises[0].sets[0].reps, 15);
  assert.equal(next.exercises[0].source, "plan");
});
test("Assessment retains ranges, selects the matching exercise and never creates history", () => {
  const profile = {
    ...p,
    assessments: [
      {
        exerciseId: "barbell-bench",
        weight: 100,
        setsMin: 3,
        setsMax: 4,
        repsMin: 6,
        repsMax: 10,
        updatedAt: "2090-01-01T00:00:00Z",
      },
    ],
  };
  const d = setup(profile);
  const e = d.draft.exercises.find((e) => e.exerciseId === "barbell-bench")!;
  assert.equal(e.source, "assessment");
  assert.equal(e.sets.length, 3);
  assert.equal(e.sets[0].reps, 8);
  assert.equal(e.sets[0].weight, 100);
  assert.equal(d.sessions.length, 0);
  assert.equal(record(d.draft).volume, 0);
  assert.equal(profile.assessments[0].setsMax, 4);
  assert.equal(
    parseData(JSON.stringify(d)).profile?.assessments?.[0].repsMin,
    6,
  );
});
test("Missing equipment never extrapolates or selects assessment weights for another exercise", () => {
  const profile = {
    ...p,
    equipment: ["body"] as UserProfile["equipment"],
    assessments: [
      {
        exerciseId: "barbell-bench",
        weight: 100,
        setsMin: 3,
        setsMax: 4,
        repsMin: 6,
        repsMax: 10,
        updatedAt: new Date().toISOString(),
      },
    ],
  };
  const d = setup(profile);
  assert.ok(
    d.draft.exercises.every((e) => !exerciseById(e.exerciseId).weighted),
  );
  assert.ok(
    d.draft.exercises.every((e) => e.sets.every((s) => s.weight === undefined)),
  );
});
test("Training styles change selection, reps and rest; mixed includes both exercise types", () => {
  const strength = generatePlan({ ...p, trainingStyle: "strength" });
  const endurance = generatePlan({ ...p, trainingStyle: "endurance" });
  const cal = generatePlan({ ...p, trainingStyle: "calisthenics" });
  const mixed = generatePlan({ ...p, trainingStyle: "mixed" });
  assert.equal(endurance.workouts[0].exercises[0].sets[0].reps, 18);
  assert.ok(
    endurance.workouts[0].exercises[0].restSeconds <
      strength.workouts[0].exercises[0].restSeconds,
  );
  assert.ok(
    cal.workouts.every((w) =>
      w.exercises.every((e) => !exerciseById(e.exerciseId).weighted),
    ),
  );
  assert.ok(
    mixed.workouts[0].exercises.some(
      (e) => exerciseById(e.exerciseId).weighted,
    ),
  );
  assert.ok(
    mixed.workouts[1].exercises.every(
      (e) => !exerciseById(e.exerciseId).weighted,
    ),
  );
});
test("Switching training style does not reuse incompatible repetition targets", () => {
  const d = setup({ ...p, trainingStyle: "strength" });
  const history = completeSession(
    d,
    resolveOpen(d.draft, "confirmed"),
  ).sessions;
  const plan = generatePlan({ ...p, trainingStyle: "endurance" });
  const s = startSession(plan, plan.workouts[0].id, history);
  assert.equal(s.exercises[0].sets[0].reps, 18);
});
test("Calisthenics uses mounted pull-up equipment only when available and experienced", () => {
  const novice = {
    ...p,
    trainingStyle: "calisthenics" as const,
    equipment: ["body", "pullup"] as UserProfile["equipment"],
  };
  assert.ok(
    generatePlan(novice).workouts.every((w) =>
      w.exercises.every(
        (e) => exerciseById(e.exerciseId).difficulty === "beginner",
      ),
    ),
  );
  const advanced = generatePlan({ ...novice, level: "advanced" });
  assert.ok(
    advanced.workouts.some((w) =>
      w.exercises.some((e) => e.exerciseId === "pullup"),
    ),
  );
  assert.ok(
    !availableExercises({ ...novice, equipment: ["body"] }).some(
      (e) => e.id === "pullup",
    ),
  );
});
test("Legacy data preserves old profiles, snapshots and confirmations without reset", () => {
  const d = setup();
  delete d.plan.trainingStyle;
  delete d.profile.trainingStyle;
  delete d.draft.trainingStyle;
  delete d.draft.documentationMode;
  delete d.draft.durationUnknown;
  d.draft.exercises[0].sets[0].status = "confirmed";
  const parsed = parseData(JSON.stringify(d));
  assert.equal(parsed.draft?.id, d.draft.id);
  assert.equal(parsed.draft?.exercises[0].sets[0].status, "confirmed");
  assert.equal(parsed.profile?.id, p.id);
});
test("Assumed sessions survive restart and can later be corrected without duplication", () => {
  const d = setup();
  const saved = completeSession(d, resolveOpen(d.draft, "assumed"));
  const restored = parseData(JSON.stringify(saved));
  const session = restored.sessions[0];
  const corrected = {
    ...session,
    exercises: session.exercises.map((e, i) =>
      i === 0 ? editExercise(e, 2, 8, 20) : e,
    ),
  };
  const updated = completeSession(restored, corrected);
  assert.equal(updated.sessions.length, 1);
  assert.equal(updated.sessions[0].completedAt, session.completedAt);
  assert.equal(record(updated.sessions[0]).sets, 2);
  assert.equal(record(updated.sessions[0]).volume, 320);
});
test("Invalid ranges and documentation states cannot corrupt persisted data", () => {
  const d = setup();
  const invalid = {
    ...d,
    profile: {
      ...d.profile,
      assessments: [
        {
          exerciseId: "barbell-bench",
          setsMin: 5,
          setsMax: 2,
          repsMin: 10,
          repsMax: 6,
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  };
  assert.throws(() => parseData(JSON.stringify(invalid)));
  assert.throws(() =>
    parseData(
      JSON.stringify({
        ...d,
        draft: { ...d.draft, documentationMode: "mystery" },
      }),
    ),
  );
});
test("Changing only presentation mode never changes confirmed/skipped set data", () => {
  const d = setup();
  const s = resolveExercise(d.draft, d.draft.exercises[0].id, "confirmed");
  const before = JSON.stringify(s.exercises);
  for (const mode of ["simple", "quick", "detailed"] as const) {
    s.documentationMode = mode;
    assert.equal(JSON.stringify(s.exercises), before);
  }
});

test("Grouped input drafts survive restart and cannot be silently confirmed", () => {
  const d = setup();
  d.draft.exercises[0].editDraft = { count: "4", reps: "", weight: "42,5" };
  const restored = parseData(JSON.stringify(d));
  assert.equal(restored.draft?.exercises[0].editDraft?.weight, "42,5");
  assert.throws(
    () => completeSession(restored, resolveOpen(restored.draft!, "confirmed")),
    /übernehmen/,
  );
  const e = editExercise(restored.draft!.exercises[0], 4, 8, 42.5);
  assert.equal(e.editDraft, undefined);
  assert.equal(e.sets[0].weight, 42.5);
});
test("Presentation changes do not make an older performance newer than a manual plan edit", () => {
  const d = setup();
  const saved = completeSession(d, resolveOpen(d.draft, "confirmed"));
  const session = saved.sessions[0];
  session.performanceUpdatedAt = "2026-01-01T00:00:00Z";
  session.updatedAt = "2091-01-01T00:00:00Z";
  d.plan.workouts[0].exercises[0].editedAt = "2090-01-01T00:00:00Z";
  d.plan.workouts[0].exercises[0].sets.forEach((s) => (s.reps = 16));
  const next = startSession(d.plan, d.plan.workouts[0].id, [session]);
  assert.equal(next.exercises[0].sets[0].reps, 16);
});

test("Coach suggests small bodyweight progression only after repeated confirmed performances", () => {
  const d = setup({ ...p, trainingStyle: "calisthenics" });
  const a = completeSession(d, resolveOpen(d.draft, "confirmed")).sessions[0];
  const b = { ...a, id: "repeat", completedAt: "2090-01-01T00:00:00Z" };
  const rec = demoCoach.recommend([a, b])[0];
  assert.equal(rec.id, "body-progress");
  assert.equal(rec.adjustment?.kind, "reps");
  const assumed = {
    ...resolveOpen(startSession(d.plan, d.plan.workouts[0].id, []), "assumed"),
    status: "completed" as const,
    completedAt: "2091-01-01T00:00:00Z",
  };
  assert.notEqual(demoCoach.recommend([assumed, a])[0].id, "body-progress");
});
