import { CoachRecommendation, WorkoutSession } from "./types";
import { exerciseById } from "../data/exercises";
export const COACH_RULES = {
  successfulSessions: 2,
  incrementPercent: 2.5,
  missesBeforeReview: 2,
};
export interface CoachService {
  recommend(sessions: WorkoutSession[]): CoachRecommendation[];
  answer(question: string, sessions: WorkoutSession[]): string;
}
export const demoCoach: CoachService = {
  recommend(input) {
    const sessions = input
      .filter((s) => s.status === "completed")
      .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));
    if (!sessions.length)
      return [
        {
          id: "start",
          title: "Dein erster Schritt zählt.",
          message:
            "Starte mit einer kontrollierten Einheit. Erst bestätigte Sätze geben uns eine Grundlage für Empfehlungen.",
          reason: "Noch keine gespeicherten Leistungen vorhanden.",
          tone: "neutral",
        },
      ];
    // Compare the same exercise at the same external load, rather than unrelated workouts.
    for (const latest of sessions[0].exercises) {
      const ex = exerciseById(latest.exerciseId);
      const recent = sessions
        .filter(
          (s) =>
            (s.trainingStyle || "strength") ===
            (sessions[0].trainingStyle || "strength"),
        )
        .flatMap((s) => s.exercises.filter((e) => e.exerciseId === ex.id))
        .slice(0, COACH_RULES.successfulSessions);
      const misses = recent.filter((e) =>
        e.sets.some(
          (s) =>
            s.status === "confirmed" &&
            s.reps <
              (e.plannedSets.find((p) => p.id === s.plannedSetId)?.reps ??
                s.reps),
        ),
      ).length;
      if (misses >= COACH_RULES.missesBeforeReview)
        return [
          {
            id: "review",
            title: `${ex.name}: Belastung prüfen.`,
            message:
              "In zwei Einheiten wurden Zielwerte dieser Übung unterschritten. Prüfe Technik, Pausen und eine kleinere Belastung. Das ist keine gesundheitliche Diagnose.",
            reason:
              "Dieselbe Übung: mindestens ein bestätigter Satz pro Einheit unter dem Planwert.",
            tone: "neutral",
          },
        ];
      if (misses)
        return [
          {
            id: "hold",
            title: `${ex.name}: Bleib bei deiner Belastung.`,
            message:
              "Einige bestätigte Wiederholungen oder Haltezeiten liegen unter dem Planwert. Wiederhole zunächst die Belastung mit sauberer Technik.",
            reason: "Bestätigte Leistung dieser Übung unter dem Planwert.",
            tone: "neutral",
          },
        ];
      const comparable =
        recent.length === COACH_RULES.successfulSessions &&
        ex.weighted &&
        recent[0].sets.length === recent[1].sets.length &&
        recent.every(
          (e) =>
            e.sets.length > 0 &&
            e.sets.every(
              (s, i) =>
                s.status === "confirmed" &&
                s.weight !== undefined &&
                s.weight > 0 &&
                s.weight === recent[0].sets[i].weight &&
                s.reps >=
                  (e.plannedSets.find((p) => p.id === s.plannedSetId)?.reps ??
                    Infinity),
            ),
        );
      if (comparable)
        return [
          {
            id: "grow",
            adjustment:
              new Set(recent[0].sets.map((s) => s.weight)).size === 1
                ? {
                    exerciseId: ex.id,
                    kind: "weight",
                    value: Math.min(
                      1000,
                      Math.round(recent[0].sets[0].weight! * 1.025 * 4) / 4,
                    ),
                  }
                : undefined,
            title: `${ex.name}: Ein kleiner nächster Schritt?`,
            message: `Du hast bei dieser Übung zweimal alle Planwerte bei gleicher Last bestätigt. Bei guter Technik kannst du etwa ${COACH_RULES.incrementPercent} % mehr Gewicht prüfen. Es wird nichts automatisch erhöht.`,
            reason:
              "Zwei Einheiten derselben Übung, gleiche Satzanzahl und Lasten; alle Sätze bestätigt und Planwerte erreicht.",
            tone: "positive",
          },
        ];
      const repeatedBody =
        !ex.weighted &&
        recent.length === 2 &&
        recent[0].sets.length === recent[1].sets.length &&
        recent.every(
          (e) =>
            e.sets.length > 0 &&
            e.sets.every(
              (s) =>
                s.status === "confirmed" &&
                s.reps >=
                  (e.plannedSets.find((p) => p.id === s.plannedSetId)?.reps ??
                    Infinity),
            ),
        );
      if (repeatedBody) {
        const current = Math.min(...recent[0].sets.map((s) => s.reps));
        const limit = ex.unit === "seconds" ? 120 : 20;
        if (current < limit)
          return [
            {
              id: "body-progress",
              title: `${ex.name}: Ein kleiner nächster Schritt?`,
              message: `Du hast die Zielwerte dieser Übung zweimal vollständig bestätigt. Du kannst ${ex.unit === "seconds" ? "fünf Sekunden länger halten" : "eine zusätzliche saubere Wiederholung"} prüfen. Die Übungsvariante soll weiterhin kontrolliert ausführbar bleiben.`,
              reason:
                "Zwei vollständig bestätigte Übungsleistungen. Keine angenommenen Werte und kein Maximalkrafttest.",
              tone: "positive",
              adjustment: {
                exerciseId: ex.id,
                kind: "reps",
                value: Math.min(
                  limit,
                  current + (ex.unit === "seconds" ? 5 : 1),
                ),
              },
            },
          ];
      }
    }
    return [
      {
        id: "consistent",
        title: "Baue deinen Rhythmus auf.",
        message:
          "Dokumentiere weiter, was du tatsächlich geschafft hast. Für eine Steigerung fehlen noch vergleichbare, vollständige Übungsdaten.",
        reason: `${sessions.length} gespeicherte Einheit(en). Steigerungen erfordern zwei vollständige Übungsleistungen mit gleicher Satzanzahl und Last.`,
        tone: "neutral",
      },
    ];
  },
  answer(q, s) {
    if (/schmerz|verletz|krank/i.test(q))
      return "Trainiere nicht in Schmerzen hinein. Der Demo-Coach kann Beschwerden nicht beurteilen. Lass anhaltende oder akute Beschwerden fachlich abklären.";
    if (/pause|erholung/i.test(q))
      return "Plane zwischen fordernden Einheiten derselben Muskelgruppe einen Erholungstag ein. Passe die Belastung deinem Befinden an; der Prototyp beurteilt keine Regeneration.";
    if (/ernähr|protein|kalori/i.test(q))
      return "Der Ernährungstracker ist für eine spätere Version vorgesehen. Hier liegt der Fokus auf deinem Training. Individuelle Ernährungsziele berechnet der Demo-Coach noch nicht.";
    return this.recommend(s)[0].message;
  },
};
