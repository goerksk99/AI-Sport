import { AppData } from "../domain/types";
import { exercises } from "../data/exercises";
const object = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const time = (v: unknown) => text(v) && Number.isFinite(Date.parse(v));
const positive = (v: unknown) =>
  typeof v === "number" && Number.isInteger(v) && v > 0 && v <= 10000;
const weight = (v: unknown) =>
  v === undefined ||
  (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1000);
const exerciseId = (v: unknown) => exercises.some((e) => e.id === v);
const unique = (a: unknown[]) =>
  a.every(object) && new Set(a.map((x) => x.id)).size === a.length;
const plannedSet = (v: unknown) =>
  object(v) && text(v.id) && positive(v.reps) && weight(v.weight);
function performance(v: unknown): boolean {
  if (
    !object(v) ||
    !text(v.id) ||
    !exerciseId(v.exerciseId) ||
    !positive(v.restSeconds) ||
    !Array.isArray(v.plannedSets) ||
    !v.plannedSets.length ||
    !v.plannedSets.every(plannedSet) ||
    !unique(v.plannedSets) ||
    !Array.isArray(v.sets) ||
    v.sets.length !== v.plannedSets.length ||
    !unique(v.sets)
  )
    return false;
  const plannedIds = new Set(v.plannedSets.map((s) => s.id));
  return v.sets.every(
    (s) =>
      object(s) &&
      text(s.id) &&
      plannedIds.has(s.plannedSetId) &&
      positive(s.reps) &&
      weight(s.weight) &&
      ["pending", "confirmed", "skipped"].includes(s.status as string),
  );
}
function session(v: unknown, status: "draft" | "completed"): boolean {
  return (
    object(v) &&
    text(v.id) &&
    text(v.planId) &&
    text(v.workoutId) &&
    text(v.name) &&
    time(v.startedAt) &&
    time(v.updatedAt) &&
    v.status === status &&
    (status === "draft" || time(v.completedAt)) &&
    (v.restEndsAt === undefined || time(v.restEndsAt)) &&
    Array.isArray(v.exercises) &&
    v.exercises.length > 0 &&
    unique(v.exercises) &&
    v.exercises.every(performance)
  );
}
export function parseData(raw: string): AppData {
  const d: unknown = JSON.parse(raw);
  const invalid = () => {
    throw new Error(
      "Gespeicherte Daten können nicht gelesen werden. Sie wurden nicht überschrieben.",
    );
  };
  if (
    !object(d) ||
    d.version !== 1 ||
    !Array.isArray(d.sessions) ||
    !unique(d.sessions) ||
    !d.sessions.every((s) => session(s, "completed")) ||
    (d.draft !== null && !session(d.draft, "draft"))
  )
    return invalid();
  if (d.profile === null) {
    if (d.plan !== null || d.draft !== null || d.sessions.length)
      return invalid();
    return d as AppData;
  }
  const p = d.profile,
    plan = d.plan;
  if (
    !object(p) ||
    !text(p.id) ||
    !text(p.name) ||
    !time(p.createdAt) ||
    !["fit", "muscle", "lose", "performance"].includes(p.goal as string) ||
    !["beginner", "advanced"].includes(p.level as string) ||
    ![2, 3, 4, 5].includes(p.days as number) ||
    ![25, 45, 60].includes(p.minutes as number) ||
    !["home", "gym"].includes(p.location as string) ||
    !Array.isArray(p.equipment) ||
    !p.equipment.includes("body") ||
    !p.equipment.every((x) => ["body", "dumbbell", "gym"].includes(x)) ||
    !Array.isArray(p.preferences) ||
    !p.preferences.includes("strength") ||
    !p.preferences.every((x) => ["strength", "cardio"].includes(x)) ||
    !weight(p.weight) ||
    (p.limitations !== undefined && typeof p.limitations !== "string")
  )
    return invalid();
  if (
    !object(plan) ||
    !text(plan.id) ||
    plan.profileId !== p.id ||
    !time(plan.createdAt) ||
    typeof plan.rationale !== "string" ||
    !Array.isArray(plan.workouts) ||
    !plan.workouts.length ||
    !unique(plan.workouts) ||
    !plan.workouts.every(
      (w) =>
        object(w) &&
        text(w.id) &&
        text(w.name) &&
        text(w.focus) &&
        Array.isArray(w.exercises) &&
        w.exercises.length > 0 &&
        unique(w.exercises) &&
        w.exercises.every(
          (e) =>
            object(e) &&
            text(e.id) &&
            exerciseId(e.exerciseId) &&
            positive(e.restSeconds) &&
            Array.isArray(e.sets) &&
            e.sets.length > 0 &&
            e.sets.every(plannedSet) &&
            unique(e.sets),
        ),
    )
  )
    return invalid();
  const draftId = object(d.draft) ? d.draft.id : null;
  if (draftId && d.sessions.some((s) => object(s) && s.id === draftId))
    return invalid();
  return d as AppData;
}
