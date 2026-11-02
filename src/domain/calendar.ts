import { AppData, WorkoutSession } from "./types";
import { dateKey, isDateKey, localDate, weekdayIndex } from "./dates";
export const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
export const defaultWeekdays = (days: number): number[] =>
  ({ 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 5], 5: [0, 1, 2, 4, 5] })[days] || [
    0, 2, 4,
  ];
export const sessionDay = (session: WorkoutSession) =>
  session.trainingDate ||
  dateKey(new Date(session.completedAt || session.startedAt));
export function weekdaysFor(data: AppData, key: string): number[] {
  const config = [...(data.calendarSchedules || [])]
    .filter((s) => s.planId === data.plan?.id && s.from <= key)
    .sort((a, b) => b.from.localeCompare(a.from))[0];
  return config?.weekdays || defaultWeekdays(data.profile?.days || 3);
}
export function calendarDay(data: AppData, key: string) {
  if (!isDateKey(key)) throw new Error("Ungültiges Datum.");
  const completed = data.sessions.filter((s) => sessionDay(s) === key);
  const plan = data.plan;
  const override = data.calendarOverrides?.[key];
  if (override?.planId === plan?.id) {
    if (override?.kind === "rest")
      return {
        kind: "rest" as const,
        workout: undefined,
        completed,
        overridden: true,
      };
    const workout = plan?.workouts.find((w) => w.id === override?.workoutId);
    if (workout)
      return { kind: "workout" as const, workout, completed, overridden: true };
  }
  if (!plan || key < dateKey(new Date(plan.createdAt)))
    return {
      kind: "unplanned" as const,
      workout: undefined,
      completed,
      overridden: false,
    };
  const weekdays = weekdaysFor(data, key);
  const index = weekdays.indexOf(weekdayIndex(localDate(key)));
  const workout =
    index < 0 ? undefined : plan.workouts[index % plan.workouts.length];
  return {
    kind: workout ? ("workout" as const) : ("rest" as const),
    workout,
    completed,
    overridden: false,
  };
}
export function setWeeklySchedule(
  data: AppData,
  weekdays: number[],
  from = dateKey(new Date()),
): AppData {
  if (
    !data.plan ||
    !data.profile ||
    !isDateKey(from) ||
    weekdays.length !== data.profile.days ||
    new Set(weekdays).size !== weekdays.length ||
    !weekdays.every((n) => Number.isInteger(n) && n >= 0 && n < 7)
  )
    throw new Error("Bitte genau deine Anzahl an Trainingstagen auswählen.");
  const config = {
    planId: data.plan.id,
    from,
    weekdays: [...weekdays].sort((a, b) => a - b),
  };
  return {
    ...data,
    calendarSchedules: [
      ...(data.calendarSchedules || []).filter(
        (s) => s.planId !== config.planId || s.from !== from,
      ),
      config,
    ],
  };
}
export function setCalendarDay(
  data: AppData,
  key: string,
  workoutId?: string,
): AppData {
  if (
    !data.plan ||
    !isDateKey(key) ||
    (workoutId && !data.plan.workouts.some((w) => w.id === workoutId))
  )
    throw new Error("Ungültige Tagesplanung.");
  return {
    ...data,
    calendarOverrides: {
      ...data.calendarOverrides,
      [key]: {
        planId: data.plan.id,
        kind: workoutId ? "workout" : "rest",
        ...(workoutId ? { workoutId } : {}),
      },
    },
  };
}
export function resetCalendarDay(data: AppData, key: string): AppData {
  const overrides = { ...data.calendarOverrides };
  delete overrides[key];
  return { ...data, calendarOverrides: overrides };
}
export function monthCells(month: Date): (string | null)[] {
  const start = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const last = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
    12,
  ).getDate();
  const cells: (string | null)[] = Array(weekdayIndex(start)).fill(null);
  for (let i = 1; i <= last; i++)
    cells.push(dateKey(new Date(month.getFullYear(), month.getMonth(), i, 12)));
  while (cells.length % 7) cells.push(null);
  return cells;
}
export function nextScheduledWorkout(
  data: AppData,
  from = dateKey(new Date()),
) {
  const start = localDate(from);
  for (let i = 0; i < 15; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = dateKey(date);
    const state = calendarDay(data, key);
    if (
      state.workout &&
      !state.completed.some((s) => s.workoutId === state.workout!.id)
    )
      return { date: key, workout: state.workout };
  }
  return null;
}
