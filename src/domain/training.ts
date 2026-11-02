import {
  AppData,
  PlannedExercise,
  UserProfile,
  WorkoutPlan,
  WorkoutSession,
  ProgressRecord,
} from "./types";
import { exercises, exerciseById } from "../data/exercises";
export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
export const emptyData = (): AppData => ({
  version: 1,
  profile: null,
  plan: null,
  draft: null,
  sessions: [],
});
export const availableExercises = (p: UserProfile) =>
  exercises.filter(
    (e) => e.equipment === "body" || p.equipment.includes(e.equipment),
  );
export function plannedExercise(
  exerciseId: string,
  p: UserProfile,
): PlannedExercise {
  const e = exerciseById(exerciseId);
  const count =
    e.movement === "cardio"
      ? 1
      : p.minutes <= 30
        ? 2
        : p.level === "advanced"
          ? 4
          : 3;
  return {
    id: uid(),
    exerciseId,
    restSeconds: e.movement === "core" ? 45 : 75,
    sets: Array.from({ length: count }, () => ({
      id: uid(),
      reps:
        e.unit === "seconds"
          ? e.movement === "cardio"
            ? 300
            : 30
          : p.goal === "muscle"
            ? 10
            : 12,
    })),
  };
}
export function generatePlan(p: UserProfile): WorkoutPlan {
  const pool = availableExercises(p);
  const split = p.level === "advanced" && p.days >= 4;
  const choose = (movement: string, index: number) => {
    const options = pool.filter((e) => e.movement === movement);
    return options[index % 2 === 0 ? options.length - 1 : 0]!;
  };
  const workouts = Array.from({ length: p.days }, (_, i) => {
    const movements = split
      ? i % 2 === 0
        ? ["push", "pull", "core"]
        : ["squat", "hinge", "core"]
      : [
          "squat",
          "push",
          "pull",
          ...(p.minutes >= 45 ? ["hinge"] : []),
          "core",
        ];
    if (p.preferences.includes("cardio")) movements.push("cardio");
    return {
      id: uid(),
      name: split
        ? (i % 2 === 0 ? "Oberkörper" : "Unterkörper") +
          ` ${Math.floor(i / 2) + 1}`
        : `Ganzkörper ${String.fromCharCode(65 + i)}`,
      focus: split
        ? i % 2 === 0
          ? "Brust · Rücken · Core"
          : "Beine · Gesäß · Core"
        : "Kraft, die dich im Alltag weiterbringt",
      exercises: movements.map((m) => plannedExercise(choose(m, i).id, p)),
    };
  });
  return {
    id: uid(),
    profileId: p.id,
    createdAt: new Date().toISOString(),
    rationale: `${p.days} Einheiten à ca. ${p.minutes} Minuten. ${split ? "Ober-/Unterkörper-Split für dein fortgeschrittenes Niveau." : "Ganzkörpertraining mit wiederkehrenden Grundbewegungen."} ${p.goal === "muscle" ? "Zielbereich: 8–12 Wiederholungen." : "Zielbereich: 10–14 Wiederholungen."} ${p.limitations ? "Angegebene Einschränkungen werden nicht medizinisch ausgewertet. Prüfe die Übungsauswahl fachlich, bevor du beginnst." : ""} Gewichte sind bewusst offen: Beginne leicht und wähle eine kontrolliert ausführbare Last.`,
    workouts,
  };
}
export function startSession(
  plan: WorkoutPlan,
  workoutId: string,
  history: WorkoutSession[],
): WorkoutSession {
  const w = plan.workouts.find((x) => x.id === workoutId);
  if (!w) throw new Error("Training nicht gefunden");
  const now = new Date().toISOString();
  return {
    id: uid(),
    planId: plan.id,
    workoutId: w.id,
    name: w.name,
    startedAt: now,
    updatedAt: now,
    status: "draft",
    exercises: w.exercises.map((e) => {
      const previous = [...history]
        .sort((a, b) =>
          (b.completedAt || "").localeCompare(a.completedAt || ""),
        )
        .flatMap((s) => s.exercises)
        .find((x) => x.exerciseId === e.exerciseId);
      return {
        id: uid(),
        exerciseId: e.exerciseId,
        plannedSets: e.sets.map((x) => ({ ...x })),
        restSeconds: e.restSeconds,
        sets: e.sets.map((s, i) => {
          const old = previous?.sets.filter((x) => x.status === "confirmed")[i];
          return {
            id: uid(),
            plannedSetId: s.id,
            reps: old?.reps ?? s.reps,
            weight: old?.weight ?? s.weight,
            status: "pending",
          };
        }),
      };
    }),
  };
}
export function record(s: WorkoutSession): ProgressRecord {
  const confirmed = s.exercises.flatMap((e) =>
    e.sets
      .filter((x) => x.status === "confirmed")
      .map((x) => ({ ...x, weighted: exerciseById(e.exerciseId).weighted })),
  );
  return {
    sessionId: s.id,
    date: s.completedAt || s.startedAt,
    sets: confirmed.length,
    volume: confirmed.reduce(
      (sum, x) => sum + (x.weighted ? (x.weight ?? 0) * x.reps : 0),
      0,
    ),
    durationMinutes: Math.max(
      1,
      Math.round(
        (Date.parse(s.completedAt || new Date().toISOString()) -
          Date.parse(s.startedAt)) /
          60000,
      ),
    ),
  };
}
export function completeSession(
  data: AppData,
  session: WorkoutSession,
): AppData {
  if (
    !session.exercises.some((e) => e.sets.some((s) => s.status === "confirmed"))
  )
    throw new Error(
      "Bestätige mindestens einen tatsächlich absolvierten Satz.",
    );
  if (session.exercises.some((e) => e.sets.some((s) => s.status === "pending")))
    throw new Error(
      "Bitte bestätige offene Sätze oder markiere sie als ausgelassen.",
    );
  for (const e of session.exercises)
    for (const s of e.sets) {
      if (
        s.status === "confirmed" &&
        (!Number.isInteger(s.reps) ||
          s.reps <= 0 ||
          s.reps > 10000 ||
          (s.weight !== undefined &&
            (!Number.isFinite(s.weight) || s.weight < 0 || s.weight > 1000)))
      ) {
        throw new Error("Bitte gültige Satzwerte eingeben.");
      }
    }
  const now = new Date().toISOString();
  const saved = {
    ...session,
    status: "completed" as const,
    completedAt: session.completedAt || now,
    updatedAt: now,
  };
  return {
    ...data,
    draft: data.draft?.id === session.id ? null : data.draft,
    sessions: [saved, ...data.sessions.filter((x) => x.id !== saved.id)],
  };
}
export const targetRange = (reps: number, unit: string) =>
  unit === "seconds"
    ? `${reps} Sek.`
    : `${Math.max(1, reps - 2)}–${reps + 2} Wdh.`;
