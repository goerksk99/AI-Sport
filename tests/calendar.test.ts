import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultWeekdays,
  calendarDay,
  weekdaysFor,
  setWeeklySchedule,
  setCalendarDay,
  resetCalendarDay,
  monthCells,
  sessionDay,
  nextScheduledWorkout,
} from "../src/domain/calendar";
import {
  dateKey,
  localDate,
  isDateKey,
  weekdayIndex,
} from "../src/domain/dates";
import {
  emptyData,
  generatePlan,
  startSession,
  completeSession,
  resolveOpen,
  record,
} from "../src/domain/training";
import { parseData } from "../src/storage/validation";
import { UserProfile } from "../src/domain/types";
function setup() {
  const profile: UserProfile = {
    id: "p",
    name: "Alex",
    createdAt: "2026-11-01T12:00:00",
    goal: "fit",
    level: "beginner",
    days: 3,
    minutes: 45,
    location: "home",
    equipment: ["body"],
    preferences: ["strength"],
  };
  const plan = generatePlan(profile);
  plan.createdAt = "2026-11-01T12:00:00";
  return { ...emptyData(), profile, plan };
}
test("Default rhythm distributes training and rest days for all supported frequencies", () => {
  for (const n of [2, 3, 4, 5]) {
    const days = defaultWeekdays(n);
    assert.equal(days.length, n);
    assert.equal(new Set(days).size, n);
  }
  const d = setup();
  assert.equal(calendarDay(d, "2026-11-02").workout?.id, d.plan.workouts[0].id);
  assert.equal(calendarDay(d, "2026-11-03").kind, "rest");
  assert.equal(calendarDay(d, "2026-11-04").workout?.id, d.plan.workouts[1].id);
  assert.equal(calendarDay(d, "2026-10-31").kind, "unplanned");
});
test("Weekly changes apply from their date and leave earlier planning unchanged", () => {
  const d = setWeeklySchedule(setup(), [1, 3, 5], "2026-11-04");
  assert.equal(calendarDay(d, "2026-11-02").kind, "workout");
  assert.equal(calendarDay(d, "2026-11-04").kind, "rest");
  assert.equal(
    calendarDay(d, "2026-11-05").workout?.id,
    d.plan!.workouts[1].id,
  );
  assert.deepEqual(weekdaysFor(d, "2026-11-03"), [0, 2, 4]);
  assert.throws(() => setWeeklySchedule(d, [1, 1, 5], "2026-11-05"));
  assert.throws(() => setWeeklySchedule(d, [1, 3], "2026-11-05"));
});
test("An explicit rest day or workout overrides the week and can be reset", () => {
  const d = setup();
  const rest = setCalendarDay(d, "2026-11-02");
  assert.equal(calendarDay(rest, "2026-11-02").kind, "rest");
  const swapped = setCalendarDay(rest, "2026-11-02", d.plan.workouts[2].id);
  assert.equal(
    calendarDay(swapped, "2026-11-02").workout?.id,
    d.plan.workouts[2].id,
  );
  assert.equal(
    calendarDay(resetCalendarDay(swapped, "2026-11-02"), "2026-11-02").workout
      ?.id,
    d.plan.workouts[0].id,
  );
  assert.throws(() => setCalendarDay(d, "2026-11-02", "missing"));
});
test("Calendar configuration survives restart and legacy data needs no migration reset", () => {
  let d = setWeeklySchedule(setup(), [1, 3, 5], "2026-11-02");
  d = setCalendarDay(d, "2026-11-03");
  assert.deepEqual(parseData(JSON.stringify(d)), JSON.parse(JSON.stringify(d)));
  const old = setup();
  const restored = parseData(JSON.stringify(old));
  assert.equal(restored.plan?.id, old.plan.id);
  assert.equal(calendarDay(restored, "2026-11-02").kind, "workout");
});
test("Invalid calendar data is rejected without accepting impossible dates", () => {
  const d = setup();
  assert.ok(!isDateKey("2026-02-30"));
  assert.ok(isDateKey("2028-02-29"));
  assert.throws(() =>
    parseData(
      JSON.stringify({
        ...d,
        calendarOverrides: {
          "2026-02-30": { planId: d.plan.id, kind: "rest" },
        },
      }),
    ),
  );
  assert.throws(() =>
    parseData(
      JSON.stringify({
        ...d,
        calendarSchedules: [
          { planId: d.plan.id, from: "2026-11-02", weekdays: [0, 0, 4] },
        ],
      }),
    ),
  );
});
test("Month grid starts Monday and correctly handles leap days and year transitions", () => {
  const feb = monthCells(new Date(2028, 1, 1, 12));
  assert.equal(feb.filter(Boolean).length, 29);
  assert.equal(feb.length % 7, 0);
  const jan = monthCells(new Date(2027, 0, 1, 12));
  assert.equal(jan.indexOf("2027-01-01"), 4);
  assert.equal(weekdayIndex(localDate("2026-11-02")), 0);
  assert.equal(dateKey(localDate("2026-11-02")), "2026-11-02");
});
test("Posthoc calendar training belongs to the selected day and has no invented duration", () => {
  const d = setup();
  const s = startSession(d.plan, d.plan.workouts[0].id, [], {
    posthoc: true,
    trainingDate: "2026-11-01",
  });
  const saved = completeSession(d, resolveOpen(s, "assumed"));
  assert.equal(sessionDay(saved.sessions[0]), "2026-11-01");
  assert.equal(calendarDay(saved, "2026-11-01").completed.length, 1);
  assert.equal(record(saved.sessions[0]).date, "2026-11-01T12:00:00");
  assert.equal(record(saved.sessions[0]).durationMinutes, null);
  assert.equal(record(saved.sessions[0]).sets, 0);
  const future = new Date();
  future.setDate(future.getDate() + 1);
  assert.throws(
    () =>
      startSession(d.plan, d.plan.workouts[0].id, [], {
        trainingDate: dateKey(future),
      }),
    /Zukunft/,
  );
});
test("Changing calendar plans never mutates existing completed workouts", () => {
  const d = setup();
  const s = startSession(d.plan, d.plan.workouts[0].id, [], {
    posthoc: true,
    trainingDate: "2026-11-02",
  });
  const saved = completeSession(d, resolveOpen(s, "confirmed"));
  const before = JSON.stringify(saved.sessions);
  const rest = setCalendarDay(saved, "2026-11-02");
  assert.equal(JSON.stringify(rest.sessions), before);
  assert.equal(calendarDay(rest, "2026-11-02").completed.length, 1);
  assert.equal(calendarDay(rest, "2026-11-02").kind, "rest");
});
test("Next scheduled workout skips an already completed occurrence only for that date", () => {
  const d = setup();
  const s = startSession(d.plan, d.plan.workouts[0].id, [], {
    trainingDate: "2026-11-02",
  });
  const saved = completeSession(d, resolveOpen(s, "assumed"));
  const next = nextScheduledWorkout(saved, "2026-11-02");
  assert.equal(next?.date, "2026-11-04");
  assert.equal(next?.workout.id, d.plan.workouts[1].id);
});
test("Old overrides do not bind new workout IDs after plan regeneration", () => {
  let d = setCalendarDay(setup(), "2026-11-03");
  d = { ...d, plan: generatePlan(d.profile!) };
  d.plan!.createdAt = "2026-11-01T12:00:00";
  assert.equal(calendarDay(d, "2026-11-03").overridden, false);
  assert.equal(calendarDay(d, "2026-11-03").kind, "rest");
});
