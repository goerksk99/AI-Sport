import { TrainingStyle } from "./types";
export const trainingStyles: Record<TrainingStyle, string> = {
  strength: "Krafttraining",
  endurance: "Kraftausdauer",
  calisthenics: "Calisthenics",
  mixed: "Gemischt",
};
export const effortHint = (style: TrainingStyle = "strength") =>
  style === "endurance"
    ? "Leichte bis moderate Belastung, gleichmäßiges Tempo. Beende den Satz, solange noch etwa 2–3 saubere Wiederholungen möglich wären."
    : "Wähle Last oder Übungsvariante so, dass noch etwa zwei saubere Wiederholungen möglich wären. Kein Maximalversuch nötig.";
