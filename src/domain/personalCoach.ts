import {
  AppData,
  Equipment,
  FitnessGoal,
  TrainingStyle,
  UserProfile,
} from "./types";
import { exercises, exerciseById } from "../data/exercises";
import {
  availableExercises,
  generatePlan,
  plannedExercise,
  record,
} from "./training";
import { demoCoach } from "./coach";
import { trainingStyles, effortHint } from "./preferences";
import { equipmentLabels } from "./catalog";
import {
  calendarDay,
  nextScheduledWorkout,
  sessionDay,
  setWeeklySchedule,
  weekdaysFor,
} from "./calendar";
import { dateKey, localDate } from "./dates";
export const goalLabels: Record<FitnessGoal, string> = {
  fit: "allgemeine Fitness",
  muscle: "Muskelaufbau",
  lose: "Gewichtsreduktion",
  performance: "Leistungsverbesserung",
};
export type ProfileChange = {
  days?: number;
  minutes?: number;
  trainingStyle?: TrainingStyle;
  goal?: FitnessGoal;
  equipment?: Equipment[];
  includeCardio?: boolean;
};
export type CoachProposal = {
  base: string;
  title: string;
  description: string;
  action:
    | { type: "profile"; change: ProfileChange }
    | { type: "lighter" }
    | { type: "replace"; from: string; to: string };
};
export type CoachReply = {
  message: string;
  reason: string;
  proposal?: CoachProposal;
};
export const coachContextKey = (data: AppData) =>
  JSON.stringify({ profile: data.profile, plan: data.plan });
const normal = (text: string) =>
  text
    .toLocaleLowerCase("de-DE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
function propose(
  data: AppData,
  title: string,
  action: CoachProposal["action"],
  description: string,
): CoachProposal {
  return { base: coachContextKey(data), title, action, description };
}
export function profileProposal(
  data: AppData,
  change: ProfileChange,
): CoachProposal {
  const p = data.profile;
  if (!p || !data.plan) throw new Error("Bitte zuerst dein Profil anlegen.");
  if (change.days !== undefined && ![2, 3, 4, 5].includes(change.days))
    throw new Error("Der lokale Planer unterstützt 2 bis 5 Trainingstage.");
  if (
    change.minutes !== undefined &&
    ![15, 20, 25, 30, 45, 60].includes(change.minutes)
  )
    throw new Error(
      "Mögliche Zeitfenster: 15, 20, 25, 30, 45 oder 60 Minuten.",
    );
  if (
    change.trainingStyle !== undefined &&
    !(change.trainingStyle in trainingStyles)
  )
    throw new Error("Diese Trainingsart ist nicht unterstützt.");
  if (change.goal !== undefined && !(change.goal in goalLabels))
    throw new Error("Dieses Trainingsziel ist nicht unterstützt.");
  if (
    change.equipment !== undefined &&
    (!Array.isArray(change.equipment) ||
      !change.equipment.includes("body") ||
      new Set(change.equipment).size !== change.equipment.length ||
      !change.equipment.every((e) => e in equipmentLabels))
  )
    throw new Error("Bitte gültiges verfügbares Equipment wählen.");
  if (
    change.includeCardio !== undefined &&
    typeof change.includeCardio !== "boolean"
  )
    throw new Error("Ungültige Ausdauer-Auswahl.");
  const same = Object.entries(change).every(([key, value]) =>
    key === "includeCardio"
      ? p.preferences.includes("cardio") === value
      : key === "equipment"
        ? JSON.stringify([...(value as Equipment[])].sort()) ===
          JSON.stringify([...p.equipment].sort())
        : p[key as keyof UserProfile] === value,
  );
  if (same)
    throw new Error(
      "Dein Profil entspricht diesen Angaben bereits. Ein neuer Plan ist dafür nicht nötig.",
    );
  const next = { ...p, ...change };
  const description = `${p.days} → ${next.days} Tage pro Woche · ${p.minutes} → ${next.minutes} Minuten · ${trainingStyles[p.trainingStyle || "strength"]} → ${trainingStyles[next.trainingStyle || "strength"]}${change.goal ? " · Ziel: " + goalLabels[change.goal] : ""}${change.equipment ? " · Equipment: " + change.equipment.map((e) => equipmentLabels[e]).join(", ") : ""}${change.includeCardio !== undefined ? " · Ausdauer zusätzlich: " + (change.includeCardio ? "ja" : "nein") : ""}. Der zukünftige Plan wird neu erstellt; eigene Übungsänderungen darin werden ersetzt. Laufende Einheit und Historie bleiben erhalten.`;
  return propose(
    data,
    "Trainingsplan gemeinsam anpassen",
    { type: "profile", change },
    description,
  );
}
export function lighterProposal(data: AppData): CoachProposal | undefined {
  if (
    !data.plan?.workouts.some((w) => w.exercises.some((e) => e.sets.length > 1))
  )
    return;
  return propose(
    data,
    "Weniger Umfang für die nächsten Einheiten",
    { type: "lighter" },
    "Jede Übung mit mehreren Sätzen bekommt einen Satz weniger, mindestens einer bleibt. Gewichte und Wiederholungen bleiben gleich. Nur der zukünftige Plan ändert sich; keine Diagnose und keine Bewertung deiner Erholung.",
  );
}
export function alternativeProposal(
  data: AppData,
  exerciseId: string,
): CoachProposal | undefined {
  const p = data.profile,
    plan = data.plan;
  if (!p || !plan) return;
  const from = exerciseById(exerciseId);
  const affected = plan.workouts.filter((w) =>
    w.exercises.some((e) => e.exerciseId === exerciseId),
  );
  if (!affected.length) return;
  const to = availableExercises(p).find(
    (e) =>
      e.id !== from.id &&
      e.movement === from.movement &&
      (p.level === "advanced" || e.difficulty === "beginner") &&
      affected.every((w) => !w.exercises.some((x) => x.exerciseId === e.id)),
  );
  if (!to) return;
  return propose(
    data,
    `${from.name} austauschen`,
    { type: "replace", from: from.id, to: to.id },
    `${from.name} → ${to.name} in ${affected.length} zukünftigen Einheit(en). Gleiche Bewegungsgruppe, verfügbares Equipment. Lasten werden nicht von einer anderen Übung übertragen. Laufende Trainings und Historie ändern sich nicht.`,
  );
}
export function applyCoachProposal(
  data: AppData,
  proposal: CoachProposal,
): AppData {
  if (proposal.base !== coachContextKey(data))
    throw new Error(
      "Dein Profil oder Plan hat sich geändert. Bitte frage erneut, damit der Vorschlag zum aktuellen Stand passt.",
    );
  if (!data.plan || !data.profile)
    throw new Error("Kein Trainingsplan vorhanden.");
  const action = proposal.action;
  if (action.type === "profile") {
    profileProposal(data, action.change); // validate supported choices again at apply time
    const { includeCardio, ...change } = action.change;
    const profile: UserProfile = {
      ...data.profile,
      ...change,
      preferences:
        includeCardio === undefined
          ? data.profile.preferences
          : includeCardio
            ? ["strength", "cardio"]
            : ["strength"],
    };
    const weekdays = weekdaysFor(data, dateKey(new Date()));
    const plan = generatePlan(profile);
    // Keep new time/goal targets, while reusing known loads only for the same
    // exercise and training style. Never restore an old, longer set schedule.
    const recent = [...data.sessions]
      .filter(
        (s) =>
          (s.trainingStyle || "strength") ===
          (profile.trainingStyle || "strength"),
      )
      .sort((a, b) =>
        (b.performanceUpdatedAt || b.updatedAt).localeCompare(
          a.performanceUpdatedAt || a.updatedAt,
        ),
      );
    const preserveActualReps =
      (!change.goal || change.goal === data.profile.goal) &&
      (!change.trainingStyle ||
        (change.trainingStyle || "strength") ===
          (data.profile.trainingStyle || "strength"));
    const editedAt = new Date().toISOString();
    for (const w of plan.workouts)
      for (const e of w.exercises) {
        e.editedAt = editedAt;
        const previous = recent
          .flatMap((s) => s.exercises)
          .find(
            (x) =>
              x.exerciseId === e.exerciseId &&
              x.sets.some((s) => s.status === "confirmed"),
          );
        if (previous)
          e.sets = e.sets.map((set, i) => {
            const actual = previous.sets[i];
            if (actual?.status !== "confirmed") return set;
            const reps = preserveActualReps ? actual.reps : set.reps;
            const weight =
              exerciseById(e.exerciseId).weighted && reps <= actual.reps
                ? actual.weight
                : undefined;
            return { ...set, reps, weight };
          });
      }
    let result: AppData = { ...data, profile, plan };
    if (weekdays.length === profile.days)
      result = setWeeklySchedule(result, weekdays);
    return result;
  }
  const now = new Date().toISOString();
  return {
    ...data,
    plan: {
      ...data.plan,
      workouts: data.plan.workouts.map((w) => ({
        ...w,
        exercises: w.exercises.map((e) => {
          if (action.type === "lighter")
            return e.sets.length > 1
              ? { ...e, editedAt: now, sets: e.sets.slice(0, -1) }
              : e;
          if (e.exerciseId !== action.from) return e;
          const to = exerciseById(action.to);
          const from = exerciseById(action.from);
          if (
            to.movement !== from.movement ||
            !availableExercises(data.profile!).some((x) => x.id === to.id)
          )
            throw new Error(
              "Die Alternative passt nicht mehr zu deinem Equipment.",
            );
          return {
            ...plannedExercise(to.id, data.profile!),
            id: e.id,
            editedAt: now,
          };
        }),
      })),
    },
  };
}
export function personalCoachAnswer(
  question: string,
  data: AppData,
): CoachReply {
  const p = data.profile;
  if (!p || !data.plan)
    return {
      message:
        "Lege zuerst dein Trainingsprofil an. Danach kann ich Ziel, Equipment und Trainingsdaten berücksichtigen.",
      reason: "Noch kein Profil vorhanden.",
    };
  const q = normal(question);
  const sessions = data.sessions.filter(
    (s) => (s.trainingStyle || "strength") === (p.trainingStyle || "strength"),
  );
  const actual = sessions.reduce((n, s) => n + record(s).sets, 0);
  const assumed = sessions.reduce((n, s) => n + record(s).assumedSets, 0);
  const profileReason = `Dein Profil: ${goalLabels[p.goal]}, ${p.level === "beginner" ? "Einsteiger" : "fortgeschritten"}, ${p.days} Tage à ${p.minutes} Minuten, ${trainingStyles[p.trainingStyle || "strength"]}. ${sessions.length} gespeicherte Einheiten dieser Trainingsart, ${actual} bestätigte und ${assumed} angenommene Sätze.`;
  const reply = (message: string, proposal?: CoachProposal): CoachReply => ({
    message,
    reason: profileReason,
    proposal,
  });
  if (/schmerz|verletz|krank|schwindel|\bbrustdruck\b|atemnot/.test(q))
    return reply(
      "Trainiere nicht in Schmerzen oder akute Beschwerden hinein. Ich kann weder die Ursache noch sichere Alternativen medizinisch beurteilen. Bei starken oder akuten Beschwerden hole passende medizinische Hilfe. Deine Einschränkungsnotiz wird gespeichert, aber nicht automatisch fachlich ausgewertet. Ich ändere deshalb auf dieser Grundlage keinen Trainingsplan.",
    );
  const style: TrainingStyle | undefined = /calisthen/.test(q)
    ? "calisthenics"
    : /crossfit|functional|funktionell/.test(q)
      ? "functional"
      : /kraftausdauer/.test(q)
        ? "endurance"
        : /cardio|ausdauertraining/.test(q)
          ? "cardio"
          : /gemischt/.test(q)
            ? "mixed"
            : /krafttraining/.test(q)
              ? "strength"
              : undefined;
  const daysMatch = q.match(
    /\b(\d+)\s*(?:tage?|mal|x)\s*(?:pro\s*)?(?:die\s*)?(?:in\s*der\s*)?woche/,
  );
  const minutesMatch = q.match(/\b(\d+)\s*(?:minuten|min\b)/);
  const changeRequested =
    !/^(wie|was|warum|welch)\b/.test(q) &&
    /will|mochte|andern|wechsel|umstell|plan|nur|mach|trainier/.test(q);
  const equipmentRequest: Equipment[] | undefined =
    /nur kettlebell|mit kettlebell/.test(q)
      ? ["body", "kettlebell"]
      : /ohne gerate|nur korpergewicht/.test(q)
        ? ["body"]
        : undefined;
  const goal: FitnessGoal | undefined = /muskelaufbau|muskeln aufbauen/.test(q)
    ? "muscle"
    : /abnehmen|gewicht reduzieren/.test(q)
      ? "lose"
      : /allgemeine fitness|fitter werden/.test(q)
        ? "fit"
        : undefined;
  if (
    changeRequested &&
    (daysMatch || minutesMatch || style || equipmentRequest || goal)
  ) {
    const change: ProfileChange = {};
    if (daysMatch) change.days = Number(daysMatch[1]);
    if (minutesMatch) change.minutes = Number(minutesMatch[1]);
    if (style) change.trainingStyle = style;
    if (equipmentRequest) {
      change.equipment = equipmentRequest;
      if (!style)
        change.trainingStyle = equipmentRequest.includes("kettlebell")
          ? "functional"
          : "calisthenics";
    }
    if (goal) change.goal = goal;
    try {
      return reply(
        "Ich kann deinen zukünftigen Plan darauf umstellen. Prüfe zuerst den konkreten Vorschlag; es wird noch nichts verändert.",
        profileProposal(data, change),
      );
    } catch (e) {
      return reply(
        (e as Error).message + " Dein bestehender Plan bleibt unverändert.",
      );
    }
  }
  if (
    /leichter|weniger satze|weniger umfang|mude|erschopft|stress|schlecht geschlafen/.test(
      q,
    )
  )
    return reply(
      "Ich kann deine Erholung nicht messen. Wenn du den Umfang bewusst reduzieren möchtest, kannst du für die nächsten Einheiten einen Satz je mehrsätziger Übung streichen. Du musst nichts als geschafft bestätigen, was du nicht absolviert hast.",
      lighterProposal(data),
    );
  const mentioned =
    [...exercises]
      .sort((a, b) => b.name.length - a.name.length)
      .find((e) => q.includes(normal(e.name))) ||
    (/bankdruck|hantelbank/.test(q)
      ? exercises.find((e) => e.id === "barbell-bench")
      : undefined) ||
    (/liegestutz/.test(q)
      ? exercises.find((e) => e.id === "pushup")
      : undefined);
  if (/tausch|ersetz|alternative/.test(q)) {
    if (!mentioned)
      return reply(
        "Nenne die konkrete Übung, etwa „Ersetze Liegestütze“. Oder öffne die Übungsbibliothek und filtere nach deinem Equipment.",
      );
    const proposal = alternativeProposal(data, mentioned.id);
    return reply(
      proposal
        ? "Hier ist eine Alternative derselben Bewegungsgruppe. Prüfe den Vorschlag, bevor du ihn übernimmst."
        : "Für diese Übung finde ich in deinem aktuellen Plan und Equipment keine weitere passende Alternative. In der Bibliothek kannst du weitere Optionen ansehen.",
      proposal,
    );
  }
  if (mentioned && /technik|ausfuhr|wie geht|wie mache/.test(q))
    return reply(
      `${mentioned.name}: ${mentioned.instruction} ${effortHint(p.trainingStyle)} Eine tatsächliche Technikbeurteilung ist lokal nicht möglich.`,
    );
  if (
    /pause|erholung|restday|ruhetag|nachste|nachst|heute|rhythmus|wann train/.test(
      q,
    )
  ) {
    const today = calendarDay(data, dateKey(new Date()));
    const next = nextScheduledWorkout(data);
    return reply(
      `${today.kind === "rest" ? "Heute ist laut Kalender Ruhetag." : today.workout ? "Heute steht " + today.workout.name + " im Kalender." : "Heute ist noch keine Einheit geplant."} ${next ? "Als Nächstes: " + next.workout.name + " am " + localDate(next.date).toLocaleDateString("de-DE") + "." : ""} Plane zwischen fordernden Einheiten derselben Muskelgruppen einen Erholungstag als sinnvollen Ausgangspunkt ein; das ist keine Messung deiner Regeneration. Die vorgesehenen Satzpausen stehen bei jeder Übung. Kalenderausnahmen kannst du selbst setzen.`,
    );
  }
  if (/ernahr|protein|kalori|essen|abnehm/.test(q))
    return reply(
      `Dein Ziel ist ${goalLabels[p.goal]}. Eine regelmäßige, ausgewogene Ernährung und alltagstaugliche Gewohnheiten sind ein sinnvoller Ausgangspunkt. Der lokale Coach berechnet ohne ausreichende Angaben keine persönlichen Kalorien- oder Makroziele. Ein Ernährungstracker ist noch nicht enthalten. Training allein garantiert keine bestimmte Gewichtsveränderung.`,
    );
  if (/aufwarm|warm.?up|warme.*auf/.test(q))
    return reply(
      `Beginne mit einigen Minuten lockerer Bewegung und leichteren Vorbereitungssätzen für die geplanten Bewegungen. Bei ${trainingStyles[p.trainingStyle || "strength"]} steigere kontrolliert bis zur Arbeitsbelastung. Vorbereitungssätze müssen nicht als Leistungsrekorde dokumentiert werden. Bei kurzen Einheiten lieber weniger Übungen statt das Aufwärmen einfach auszulassen.`,
    );
  if (/gewicht|belastung|intensitat|wie schwer/.test(q))
    return reply(
      `${effortHint(p.trainingStyle)} ${p.assessments?.length ? "Deine Selbsteinschätzungen sind Ausgangswerte, keine Maximalkrafttests." : ""} ${actual ? "Neue Vorschläge berücksichtigen deine zuletzt bestätigten Leistungen derselben Übung und Trainingsart." : "Noch fehlen bestätigte Leistungen; deshalb schlage ich keine berechnete persönliche Last vor."} Bei Cardio zählt zunächst ein kontrolliertes Sprechtempo; persönliche Pulszonen werden nicht geschätzt.`,
    );
  if (/fortschritt|stagn|steiger|plateau/.test(q)) {
    const rec = demoCoach.recommend(sessions)[0];
    return reply(
      `${rec.message} ${rec.reason} ${assumed ? "Nach Plan angenommene Werte sind aus Leistungssteigerungen ausgeschlossen." : ""}`,
    );
  }
  if (/verpasst|ausgefallen|ausgelassen|motivat|dranbleib/.test(q)) {
    const from = new Date();
    from.setDate(from.getDate() - 6);
    const n = data.sessions.filter(
      (s) =>
        sessionDay(s) >= dateKey(from) && sessionDay(s) <= dateKey(new Date()),
    ).length;
    return reply(
      `Du hast in den letzten sieben Kalendertagen ${n} Einheit(en) gespeichert. Dein Ziel sind ${p.days} pro Woche. Eine ausgelassene Einheit muss nicht durch doppelten Umfang nachgeholt werden. Verschiebe den Tag im Kalender oder mache mit der nächsten passenden Einheit weiter. Ein kurzer, machbarer Einstieg ist ebenfalls sinnvoll.`,
    );
  }
  if (/ziel|profil|personlich|personalis/.test(q))
    return reply(
      `Ich berücksichtige bereits dein Ziel ${goalLabels[p.goal]}, deine Erfahrung, ${p.equipment.map((e) => equipmentLabels[e]).join(", ")} und deine bestätigten Trainings. ${p.limitations ? "Du hast Einschränkungen notiert; sie werden nicht medizinisch interpretiert." : ""} Anpassungen sind lokale Regeln. Für freie Gespräche mit umfassendem Sprachverständnis fehlt noch ein serverseitiger KI-Dienst.`,
    );
  if (/kettlebell|crossfit|calisthen|cardio|ubung/.test(q))
    return reply(
      `In der Bibliothek findest du ${exercises.length} Übungen. Filtere nach Kettlebell, Functional / CrossFit, Calisthenics oder Cardio. Nur verfügbares Equipment wird zum Hinzufügen freigegeben. Trainingsart und Equipment kannst du im Profil oder über eine konkrete Anfrage ändern, etwa „Ich möchte Cardio trainieren“. Bei komplexen Übungen ersetzt der Coach keine fachliche Technikeinweisung.`,
    );
  return reply(
    "Ich bin ein lokaler Regelcoach und habe diese Frage nicht eindeutig zugeordnet. Ich kann bei Fortschritt, Belastung, Technik bekannter Übungen, Pausen, Aufwärmen, Motivation, Kalender und konkreten Planänderungen helfen. Beispiele: „Ich habe nur 20 Minuten“, „Ich möchte Calisthenics trainieren“, „Ersetze Liegestütze“ oder „Plane 3 Tage pro Woche“.",
  );
}
