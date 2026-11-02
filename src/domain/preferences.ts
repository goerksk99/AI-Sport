import { TrainingStyle } from "./types";
export const trainingStyles: Record<TrainingStyle, string> = {
  strength: "Krafttraining",
  endurance: "Kraftausdauer",
  calisthenics: "Calisthenics",
  mixed: "Gemischt",
  functional: "Functional / CrossFit",
  cardio: "Cardio",
};
export const effortHint = (style: TrainingStyle = "strength") =>
  style === "cardio"
    ? "Wähle ein gleichmäßiges Tempo, bei dem du noch in kurzen Sätzen sprechen kannst. Beginne und beende die Einheit locker; keine Pulszonen werden geschätzt."
    : style === "functional"
      ? "Kontrollierte Technik vor Tempo. Plane Pausen nach Bedarf und beginne ohne Zeitdruck. Das ist ein funktioneller Trainingsplan, kein maximaler Wettkampf-WOD."
      : style === "endurance"
        ? "Leichte bis moderate Belastung, gleichmäßiges Tempo. Beende den Satz, solange noch etwa 2–3 saubere Wiederholungen möglich wären."
        : "Wähle Last oder Übungsvariante so, dass noch etwa zwei saubere Wiederholungen möglich wären. Kein Maximalversuch nötig.";
