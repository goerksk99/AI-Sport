import { test } from "node:test";
import assert from "node:assert/strict";
import { upsertCoachMessage, questionKey } from "../src/domain/conversation";
import {
  personalCoachAnswer,
  profileProposal,
  lighterProposal,
  alternativeProposal,
  applyCoachProposal,
} from "../src/domain/personalCoach";
import { UserProfile } from "../src/domain/types";
import {
  emptyData,
  generatePlan,
  startSession,
  resolveOpen,
  completeSession,
  plannedExercise,
  record,
} from "../src/domain/training";
import { parseData } from "../src/storage/validation";
import { exercises, exerciseById } from "../src/data/exercises";
import { categoryOf } from "../src/domain/catalog";
import { setWeeklySchedule, weekdaysFor } from "../src/domain/calendar";
import { dateKey } from "../src/domain/dates";
const p: UserProfile = {
  id: "p",
  createdAt: new Date().toISOString(),
  name: "Alex",
  goal: "muscle",
  level: "beginner",
  days: 3,
  minutes: 45,
  location: "gym",
  equipment: ["body", "gym"],
  preferences: ["strength"],
};
const setup = (profile = p) => {
  const plan = generatePlan(profile);
  return {
    ...emptyData(),
    profile,
    plan,
    draft: startSession(plan, plan.workouts[0].id, []),
  };
};
test("Repeated coach clicks update a single answer, including normalized typed questions", () => {
  let messages = upsertCoachMessage([], "Wie viel Pause brauche ich?", "a");
  messages = upsertCoachMessage(messages, "Wie viel Pause brauche ich?", "b");
  messages = upsertCoachMessage(
    messages,
    "  WIE  VIEL PAUSE brauche ich!  ",
    "c",
  );
  assert.equal(messages.length, 1);
  assert.equal(messages[0].a, "c");
  assert.equal(messages[0].id, questionKey("Wie viel Pause brauche ich?"));
});
test("Coach history is bounded and blank submissions do not change it", () => {
  let m = upsertCoachMessage([], "Hallo", "a");
  const old = m;
  assert.equal(upsertCoachMessage(m, "  ", "b"), old);
  for (let i = 0; i < 40; i++) m = upsertCoachMessage(m, "Frage " + i, "a");
  assert.equal(m.length, 30);
});
test("Personal answers use actual profile and distinguish assumed performance", () => {
  let d = setup();
  d = completeSession(d, resolveOpen(d.draft!, "assumed")) as ReturnType<
    typeof setup
  >;
  const answer = personalCoachAnswer("Wie mache ich Fortschritte?", d);
  assert.match(answer.reason, /Muskelaufbau/);
  assert.match(answer.reason, /3 Tage à 45/);
  assert.match(answer.reason, /0 bestätigte/);
  assert.match(answer.reason, /angenommene/);
  assert.ok(!answer.proposal);
});
test("Supported request creates preview without mutation and apply preserves history and draft", () => {
  const d = setup();
  const before = JSON.stringify(d);
  const r = personalCoachAnswer("Ich habe nur 20 Minuten", d);
  assert.ok(r.proposal);
  assert.equal(JSON.stringify(d), before);
  const next = applyCoachProposal(d, r.proposal!);
  assert.equal(next.profile!.minutes, 20);
  assert.equal(next.draft, d.draft);
  assert.equal(next.sessions, d.sessions);
  assert.notEqual(next.plan!.id, d.plan.id);
  assert.equal(parseData(JSON.stringify(next)).profile!.minutes, 20);
});
test("Combined requests retain all explicitly supported choices", () => {
  const d = setup();
  const r = personalCoachAnswer(
    "Ich möchte mit Kettlebell 3 Tage pro Woche und nur 20 Minuten trainieren",
    d,
  );
  assert.ok(r.proposal);
  const next = applyCoachProposal(d, r.proposal!);
  assert.equal(next.profile!.minutes, 20);
  assert.equal(next.profile!.trainingStyle, "functional");
  assert.deepEqual(next.profile!.equipment, ["body", "kettlebell"]);
});
test("Unsupported requests, no-op changes and stale proposals do not overwrite plans", () => {
  const d = setup();
  assert.equal(
    personalCoachAnswer("Plane 9 Tage pro Woche", d).proposal,
    undefined,
  );
  assert.throws(() => profileProposal(d, { days: 3 }), /bereits/);
  const proposal = profileProposal(d, { minutes: 20 });
  const changed = { ...d, profile: { ...d.profile, name: "Andere Person" } };
  assert.throws(() => applyCoachProposal(changed, proposal), /geändert/);
  assert.match(
    personalCoachAnswer("Wie ist das Wetter auf dem Mars?", d).message,
    /nicht eindeutig/,
  );
});
test("Medical complaints never generate a plan change, even if other commands are present", () => {
  const d = setup();
  const r = personalCoachAnswer(
    "Ich habe Knieschmerzen und möchte 20 Minuten Cardio trainieren",
    d,
  );
  assert.equal(r.proposal, undefined);
  assert.match(r.message, /medizinisch/);
});
test("Proposal for fewer sets affects only future plans and keeps at least one set", () => {
  const d = setup();
  const proposal = lighterProposal(d)!;
  const next = applyCoachProposal(d, proposal);
  assert.equal(next.draft, d.draft);
  for (const w of next.plan!.workouts)
    for (const e of w.exercises) assert.ok(e.sets.length >= 1);
  assert.equal(next.plan!.workouts[0].exercises[0].sets.length, 2);
  assert.equal(d.plan.workouts[0].exercises[0].sets.length, 3);
});
test("Exercise alternatives match movement and equipment and never copy unrelated weight", () => {
  const d = setup();
  d.plan.workouts[0].exercises[0].sets.forEach((s) => (s.weight = 100));
  const proposal = alternativeProposal(d, "legpress")!;
  assert.ok(proposal);
  const next = applyCoachProposal(d, proposal);
  const replaced = next.plan!.workouts[0].exercises[0];
  assert.equal(exerciseById(replaced.exerciseId).movement, "squat");
  assert.ok(replaced.sets.every((s) => s.weight === undefined));
  assert.equal(next.draft, d.draft);
});
test("Personal planner preserves chosen weekdays when training frequency stays the same", () => {
  const d = setWeeklySchedule(setup(), [1, 3, 5]);
  const next = applyCoachProposal(
    d,
    profileProposal(d, { trainingStyle: "cardio" }),
  );
  assert.deepEqual(weekdaysFor(next, dateKey(new Date())), [1, 3, 5]);
});
test("Cardio produces duration-based plans within chosen minutes without mandatory weights", () => {
  for (const minutes of [15, 20, 25, 30, 45, 60]) {
    const plan = generatePlan({
      ...p,
      minutes,
      trainingStyle: "cardio",
      equipment: ["body", "rower"],
    });
    for (const w of plan.workouts) {
      assert.match(w.name, /Cardio/);
      assert.ok(
        w.exercises.every(
          (e) => exerciseById(e.exerciseId).movement === "cardio",
        ),
      );
      assert.equal(
        w.exercises.reduce(
          (sum, e) => sum + e.sets.reduce((n, s) => n + s.reps, 0),
          0,
        ),
        minutes * 60,
      );
      assert.ok(
        w.exercises.every((e) => e.sets.every((s) => s.weight === undefined)),
      );
    }
    assert.equal(plan.workouts[0].exercises[1].exerciseId, "rower");
  }
});
test("Functional planning uses a kettlebell when available and avoids advanced technique for beginners", () => {
  const plan = generatePlan({
    ...p,
    trainingStyle: "functional",
    equipment: ["body", "kettlebell"],
  });
  assert.ok(
    plan.workouts[0].exercises.some(
      (e) => categoryOf(exerciseById(e.exerciseId)) === "kettlebell",
    ),
  );
  assert.ok(
    plan.workouts.every((w) =>
      w.exercises.every(
        (e) => exerciseById(e.exerciseId).difficulty === "beginner",
      ),
    ),
  );
  assert.ok(
    plan.workouts.every((w) =>
      w.exercises.some((e) => exerciseById(e.exerciseId).movement === "cardio"),
    ),
  );
});
test("Extended catalog has unique IDs, equipment and full metadata", () => {
  assert.equal(exercises.length, 54);
  assert.equal(new Set(exercises.map((e) => e.id)).size, 54);
  for (const e of exercises) {
    assert.ok(e.instruction.length > 30);
    assert.ok(e.muscles.length > 0);
    assert.ok(categoryOf(e));
  }
  assert.ok(
    exercises.filter((e) => categoryOf(e) === "calisthenics").length >= 15,
  );
});
test("Timed loaded carries do not become incorrect kg-times-seconds volume", () => {
  const d = setup({ ...p, equipment: ["body", "kettlebell"] });
  const carry = plannedExercise("kb-carry", d.profile);
  d.plan.workouts[0].exercises = [carry];
  const s = resolveOpen(
    startSession(d.plan, d.plan.workouts[0].id, []),
    "confirmed",
  );
  s.exercises[0].sets.forEach((s) => (s.weight = 20));
  assert.equal(record(s).sets, 3);
  assert.equal(record(s).volume, 0);
});
test("New equipment and training styles roundtrip without breaking legacy data", () => {
  for (const trainingStyle of [
    "strength",
    "endurance",
    "calisthenics",
    "mixed",
    "functional",
    "cardio",
  ] as const) {
    const d = setup({
      ...p,
      trainingStyle,
      equipment: [
        "body",
        "kettlebell",
        "bands",
        "rings",
        "rope",
        "box",
        "rower",
        "treadmill",
      ],
    });
    assert.equal(
      parseData(JSON.stringify(d)).profile!.trainingStyle,
      trainingStyle,
    );
  }
});
test("Warm-up, load, recovery, motivation and technique have specific local responses", () => {
  const d = setup();
  assert.match(
    personalCoachAnswer("Wie wärme ich mich auf?", d).message,
    /Vorbereitungssätzen/,
  );
  assert.match(
    personalCoachAnswer("Wie schwer soll ich trainieren?", d).message,
    /keine berechnete persönliche Last/,
  );
  assert.match(
    personalCoachAnswer("Ich habe ein Training verpasst", d).message,
    /doppelten Umfang/,
  );
  assert.match(
    personalCoachAnswer("Wie mache ich Kettlebell Goblet Squat richtig?", d)
      .message,
    /Kugel vor der Brust/,
  );
  assert.match(
    personalCoachAnswer("Wie viel Pause brauche ich?", d).message,
    /Kalender/,
  );
});

test("A shorter coach plan stays shorter despite older complete sessions and retains known loads", () => {
  let d = setup();
  d.draft.exercises[0].sets.forEach((s) => (s.weight = 40));
  d = completeSession(d, resolveOpen(d.draft, "confirmed")) as ReturnType<
    typeof setup
  >;
  const proposal = profileProposal(d, { minutes: 20 });
  const next = applyCoachProposal(d, proposal);
  const s = startSession(next.plan!, next.plan!.workouts[0].id, next.sessions);
  assert.equal(s.exercises.length, 3);
  assert.equal(s.exercises[0].sets.length, 2);
  assert.equal(s.exercises[0].sets[0].weight, 40);
});
test("Strength self-assessments are not projected onto a different training style", () => {
  const profile = {
    ...p,
    trainingStyle: "endurance" as const,
    equipment: ["body", "barbell"] as UserProfile["equipment"],
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
  const planned = plannedExercise("barbell-bench", profile);
  assert.equal(planned.sets[0].reps, 18);
  assert.equal(planned.sets[0].weight, undefined);
  assert.equal(planned.source, "plan");
});

test("A time-only change retains actual repetition values; a higher rep target does not copy heavy loads", () => {
  let d = setup();
  d.draft.exercises[0].sets.forEach((s) => {
    s.weight = 40;
    s.reps = 8;
  });
  d = completeSession(d, resolveOpen(d.draft, "confirmed")) as ReturnType<
    typeof setup
  >;
  const shorter = applyCoachProposal(d, profileProposal(d, { minutes: 20 }));
  assert.equal(shorter.plan!.workouts[0].exercises[0].sets[0].reps, 8);
  assert.equal(shorter.plan!.workouts[0].exercises[0].sets[0].weight, 40);
  const goal = applyCoachProposal(d, profileProposal(d, { goal: "fit" }));
  assert.equal(goal.plan!.workouts[0].exercises[0].sets[0].reps, 12);
  assert.equal(goal.plan!.workouts[0].exercises[0].sets[0].weight, undefined);
});
