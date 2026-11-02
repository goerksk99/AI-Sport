import { Equipment, Exercise, ExerciseCategory } from "./types";
export const equipmentLabels: Record<Equipment, string> = {
  body: "Körpergewicht",
  dumbbell: "Kurzhanteln",
  gym: "Studiogeräte",
  barbell: "Langhantel & Hantelbank",
  pullup: "Klimmzugstange",
  kettlebell: "Kettlebell",
  bands: "Widerstandsbänder",
  rings: "Trainingsringe",
  rope: "Springseil",
  box: "Stabile Trainingsbox",
  rower: "Ruderergometer",
  treadmill: "Laufband",
};
export const categoryLabels: Record<ExerciseCategory, string> = {
  strength: "Kraft",
  calisthenics: "Calisthenics",
  kettlebell: "Kettlebell",
  functional: "Functional / CrossFit",
  cardio: "Cardio",
};
export const categoryOf = (e: Exercise): ExerciseCategory =>
  e.category ||
  (e.movement === "cardio"
    ? "cardio"
    : e.equipment === "body" || e.equipment === "pullup"
      ? "calisthenics"
      : "strength");
