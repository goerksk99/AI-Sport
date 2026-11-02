import {
  AppData,
  PlannedExercise,
  UserProfile,
  WorkoutPlan,
  WorkoutSession,
  ProgressRecord,
  ExercisePerformance,
  DocumentationMode,
} from "./types";
import { dateKey, isDateKey } from "./dates";
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
    (e) =>
      (e.equipment === "body" || p.equipment.includes(e.equipment)) &&
      (p.trainingStyle !== "calisthenics" || !e.weighted),
  );
export function plannedExercise(
  exerciseId: string,
  p: UserProfile,
): PlannedExercise {
  const e = exerciseById(exerciseId);
  const assessment = p.assessments?.find((a) => a.exerciseId === exerciseId);
  const style = p.trainingStyle || "strength";
  const count =
    assessment?.setsMin ??
    (e.movement === "cardio"
      ? 1
      : p.minutes <= 30
        ? 2
        : p.level === "advanced"
          ? 4
          : 3);
  return {
    id: uid(),
    exerciseId,
    source: assessment ? "assessment" : "plan",
    editedAt: assessment?.updatedAt,
    restSeconds: style === "endurance" ? 40 : e.movement === "core" ? 45 : 90,
    sets: Array.from({ length: count }, () => ({
      id: uid(),
      weight: e.weighted ? assessment?.weight : undefined,
      reps: assessment
        ? Math.floor((assessment.repsMin + assessment.repsMax) / 2)
        : e.unit === "seconds"
          ? e.movement === "cardio"
            ? 300
            : 30
          : style === "endurance"
            ? 18
            : style === "calisthenics"
              ? 8
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
    const options = pool.filter(
      (e) =>
        e.movement === movement &&
        (p.level === "advanced" || e.difficulty === "beginner"),
    );
    const assessed = options.find((e) =>
      p.assessments?.some((a) => a.exerciseId === e.id),
    );
    if (assessed) return assessed;
    const preferred = options.filter((e) =>
      p.trainingStyle === "mixed"
        ? index % 2 === 0
          ? e.weighted
          : !e.weighted
        : p.trainingStyle === "calisthenics"
          ? !e.weighted
          : e.weighted,
    );
    const choices = [...(preferred.length ? preferred : options)].sort(
      (a, b) =>
        p.level === "advanced" && p.trainingStyle === "calisthenics"
          ? Number(b.difficulty === "advanced") -
            Number(a.difficulty === "advanced")
          : 0,
    );
    return choices[index % choices.length]!;
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
    trainingStyle: p.trainingStyle || "strength",
    createdAt: new Date().toISOString(),
    rationale: `${p.trainingStyle === "endurance" ? "Kraftausdauer: höhere Wiederholungen, moderate Belastung und kürzere Pausen." : p.trainingStyle === "calisthenics" ? "Calisthenics: kontrollierte Körpergewichtsübungen und passende Varianten." : p.trainingStyle === "mixed" ? "Gemischt: externe Lasten und Körpergewichtsübungen im Wechsel." : "Krafttraining: kontrollierte Grundbewegungen."} ${p.days} Einheiten à ca. ${p.minutes} Minuten. ${split ? "Ober-/Unterkörper-Split für dein fortgeschrittenes Niveau." : "Ganzkörpertraining mit wiederkehrenden Grundbewegungen."} ${p.trainingStyle === "endurance" ? "Zielbereich: 16–20 Wiederholungen." : p.trainingStyle === "calisthenics" ? "Zielbereich: 6–10 Wiederholungen." : p.goal === "muscle" ? "Zielbereich: 8–12 Wiederholungen." : "Zielbereich: 10–14 Wiederholungen."} ${p.limitations ? "Angegebene Einschränkungen werden nicht medizinisch ausgewertet. Prüfe die Übungsauswahl fachlich, bevor du beginnst." : ""} Gewichte sind bewusst offen: Beginne leicht und wähle eine kontrolliert ausführbare Last.`,
    workouts,
  };
}
export function startSession(
  plan: WorkoutPlan,
  workoutId: string,
  history: WorkoutSession[],
  options: { posthoc?: boolean; trainingDate?: string } = {},
): WorkoutSession {
  if (
    options.trainingDate &&
    (!isDateKey(options.trainingDate) ||
      options.trainingDate > dateKey(new Date()))
  )
    throw new Error(
      "Ein tatsächliches Training kann nicht in der Zukunft liegen.",
    );
  const w = plan.workouts.find((x) => x.id === workoutId);
  if (!w) throw new Error("Training nicht gefunden");
  const now = new Date().toISOString();
  return {
    id: uid(),
    planId: plan.id,
    workoutId: w.id,
    name: w.name,
    startedAt: now,
    trainingDate: options.trainingDate,
    updatedAt: now,
    status: "draft",
    documentationMode: "quick",
    trainingStyle: plan.trainingStyle || "strength",
    durationUnknown: options.posthoc || undefined,
    exercises: w.exercises.map((e) => {
      const previousSession = [...history]
        .filter(
          (s) =>
            s.status === "completed" &&
            (s.trainingStyle || "strength") ===
              (plan.trainingStyle || "strength"),
        )
        .sort((a, b) =>
          (b.performanceUpdatedAt || b.updatedAt).localeCompare(
            a.performanceUpdatedAt || a.updatedAt,
          ),
        )
        .find((s) =>
          s.exercises.some(
            (x) =>
              x.exerciseId === e.exerciseId &&
              x.sets.some((y) => y.status === "confirmed"),
          ),
        );
      const previous = previousSession?.exercises.find(
        (x) =>
          x.exerciseId === e.exerciseId &&
          x.sets.some((y) => y.status === "confirmed"),
      );
      const useHistory =
        !!previous &&
        (!e.editedAt ||
          e.editedAt <
            (previousSession!.performanceUpdatedAt ||
              previousSession!.updatedAt));
      const completeHistory =
        useHistory && previous!.sets.every((s) => s.status === "confirmed");
      const plannedSets = completeHistory
        ? previous!.sets.map((s) => ({
            id: uid(),
            reps: s.reps,
            weight: s.weight,
          }))
        : e.sets.map((s) => ({ ...s }));
      return {
        id: uid(),
        exerciseId: e.exerciseId,
        restSeconds: e.restSeconds,
        source: useHistory ? "history" : e.source || "plan",
        plannedSets,
        sets: plannedSets.map((s, i) => {
          const old =
            useHistory && previous!.sets[i]?.status === "confirmed"
              ? previous!.sets[i]
              : undefined;
          return {
            id: uid(),
            plannedSetId: s.id,
            reps: old?.reps ?? s.reps,
            weight: old?.weight ?? s.weight,
            status: "pending" as const,
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
    date: s.trainingDate
      ? s.trainingDate + "T12:00:00"
      : s.completedAt || s.startedAt,
    sets: confirmed.length,
    volume: confirmed.reduce(
      (sum, x) => sum + (x.weighted ? (x.weight ?? 0) * x.reps : 0),
      0,
    ),
    assumedSets: s.exercises
      .flatMap((e) => e.sets)
      .filter((x) => x.status === "assumed").length,
    durationMinutes: s.durationUnknown
      ? (s.enteredDurationMinutes ?? null)
      : Math.max(
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
  if (session.exercises.some((e) => e.editDraft))
    throw new Error(
      "Bitte die gespeicherte Übungseingabe übernehmen oder abbrechen.",
    );
  if (
    !session.exercises.some((e) =>
      e.sets.some((s) => s.status === "confirmed" || s.status === "assumed"),
    )
  )
    throw new Error(
      "Bestätige mindestens eine Übung oder speichere das Training ohne genaue Leistungsdaten.",
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
    performanceUpdatedAt: session.completedAt
      ? session.performanceUpdatedAt || now
      : now,
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

/** Only undecided values are affected by whole-workout actions. */
export function resolveOpen(
  session: WorkoutSession,
  status: "confirmed" | "assumed" | "skipped",
): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map((e) => ({
      ...e,
      sets: e.sets.map((s) =>
        s.status === "pending"
          ? {
              ...s,
              status,
              confirmedAt:
                status === "confirmed" ? new Date().toISOString() : undefined,
            }
          : s,
      ),
    })),
  };
}
export function resolveExercise(
  session: WorkoutSession,
  id: string,
  status: "confirmed" | "skipped",
): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map((e) =>
      e.id !== id
        ? e
        : {
            ...e,
            sets: e.sets.map((s) => ({
              ...s,
              status,
              confirmedAt:
                status === "confirmed" ? new Date().toISOString() : undefined,
            })),
          },
    ),
  };
}
export function editExercise(
  e: ExercisePerformance,
  count: number,
  reps: number,
  weight?: number,
): ExercisePerformance {
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    count > 8 ||
    !Number.isInteger(reps) ||
    reps < 1 ||
    reps > 10000 ||
    (weight !== undefined &&
      (!Number.isFinite(weight) || weight < 0 || weight > 1000))
  )
    throw new Error("Bitte gültige Satzwerte eingeben.");
  const plannedSets = Array.from(
    { length: count },
    (_, i) => e.plannedSets[i] || { id: uid(), reps: e.plannedSets[0].reps },
  );
  return {
    ...e,
    editDraft: undefined,
    plannedSets,
    sets: plannedSets.map((p, i) => ({
      id: e.sets[i]?.id || uid(),
      plannedSetId: p.id,
      reps,
      weight: exerciseById(e.exerciseId).weighted ? weight : undefined,
      status: "confirmed",
      confirmedAt: new Date().toISOString(),
    })),
  };
}
export function exerciseSummary(e: ExercisePerformance): string {
  const ex = exerciseById(e.exerciseId);
  const same = e.sets.every(
    (s) => s.reps === e.sets[0].reps && s.weight === e.sets[0].weight,
  );
  if (same)
    return `${e.sets.length} × ${e.sets[0].reps}${ex.unit === "seconds" ? " Sek." : ""}${ex.weighted && e.sets[0].weight !== undefined ? " · " + e.sets[0].weight + " kg" : ""}`;
  return e.sets
    .map(
      (s) =>
        `${s.reps}${ex.unit === "seconds" ? " s" : ""}${ex.weighted && s.weight !== undefined ? " / " + s.weight + " kg" : ""}`,
    )
    .join(" · ");
}
