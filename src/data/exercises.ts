import { Exercise } from "../domain/types";
export const exercises: Exercise[] = [
  {
    id: "squat",
    name: "Kniebeugen",
    muscles: ["Beine", "Gesäß"],
    equipment: "body",
    difficulty: "beginner",
    movement: "squat",
    instruction:
      "Füße etwa schulterbreit. Schiebe die Hüfte zurück, halte die Knie in Richtung der Fußspitzen und richte dich kontrolliert auf.",
    unit: "reps",
    weighted: false,
  },
  {
    id: "goblet",
    name: "Goblet Squat",
    muscles: ["Beine", "Gesäß"],
    equipment: "dumbbell",
    difficulty: "beginner",
    movement: "squat",
    instruction:
      "Halte eine Kurzhantel vor der Brust. Senke die Hüfte kontrolliert ab und drücke dich über den ganzen Fuß nach oben.",
    unit: "reps",
    weighted: true,
  },
  {
    id: "legpress",
    name: "Beinpresse",
    muscles: ["Beine", "Gesäß"],
    equipment: "gym",
    difficulty: "beginner",
    movement: "squat",
    instruction:
      "Rücken am Polster lassen. Beuge die Knie nur so weit, wie das Becken stabil bleibt. Knie nicht durchdrücken.",
    unit: "reps",
    weighted: true,
  },
  {
    id: "pushup",
    name: "Liegestütze",
    muscles: ["Brust", "Trizeps"],
    equipment: "body",
    difficulty: "beginner",
    movement: "push",
    instruction:
      "Körper in einer Linie halten, Ellbogen leicht zum Körper führen. Bei Bedarf Hände auf eine stabile erhöhte Fläche setzen.",
    unit: "reps",
    weighted: false,
  },
  {
    id: "dbpress",
    name: "Kurzhantel-Bodendrücken",
    muscles: ["Brust", "Trizeps"],
    equipment: "dumbbell",
    difficulty: "beginner",
    movement: "push",
    instruction:
      "Auf dem Rücken liegend die Hanteln kontrolliert zur Seite absenken, bis die Oberarme den Boden berühren. Nach oben drücken.",
    unit: "reps",
    weighted: true,
  },
  {
    id: "bench",
    name: "Brustpresse",
    muscles: ["Brust", "Trizeps"],
    equipment: "gym",
    difficulty: "beginner",
    movement: "push",
    instruction:
      "Sitz so einstellen, dass die Griffe auf Brusthöhe liegen. Schulterblätter stabil halten und langsam drücken.",
    unit: "reps",
    weighted: true,
  },
  {
    id: "prone",
    name: "Rückenheben mit Armzug",
    muscles: ["Rücken"],
    equipment: "body",
    difficulty: "beginner",
    movement: "pull",
    instruction:
      "In Bauchlage Arme nach vorn strecken. Brust leicht anheben und Ellbogen sanft nach hinten ziehen. Nacken lang halten.",
    unit: "reps",
    weighted: false,
  },
  {
    id: "row",
    name: "Kurzhantel-Rudern",
    muscles: ["Rücken", "Bizeps"],
    equipment: "dumbbell",
    difficulty: "beginner",
    movement: "pull",
    instruction:
      "Mit einer Hand stabil abstützen. Rücken neutral halten und die Hantel zur Hüfte ziehen, ohne den Oberkörper zu verdrehen.",
    unit: "reps",
    weighted: true,
  },
  {
    id: "lat",
    name: "Latzug",
    muscles: ["Rücken", "Bizeps"],
    equipment: "gym",
    difficulty: "beginner",
    movement: "pull",
    instruction:
      "Brust aufrichten und die Stange vor den Körper zum oberen Brustbereich ziehen. Langsam zurückführen.",
    unit: "reps",
    weighted: true,
  },
  {
    id: "bridge",
    name: "Glute Bridge",
    muscles: ["Gesäß", "Beinrückseite"],
    equipment: "body",
    difficulty: "beginner",
    movement: "hinge",
    instruction:
      "Füße aufstellen und die Hüfte heben, bis Rumpf und Oberschenkel eine Linie bilden. Nicht ins Hohlkreuz gehen.",
    unit: "reps",
    weighted: false,
  },
  {
    id: "rdl",
    name: "Rumänisches Kreuzheben",
    muscles: ["Beinrückseite", "Gesäß"],
    equipment: "dumbbell",
    difficulty: "beginner",
    movement: "hinge",
    instruction:
      "Hanteln nah an den Beinen führen. Knie leicht beugen, Hüfte zurückschieben und nur mit neutralem Rücken absenken.",
    unit: "reps",
    weighted: true,
  },
  {
    id: "plank",
    name: "Unterarmstütz",
    muscles: ["Core"],
    equipment: "body",
    difficulty: "beginner",
    movement: "core",
    instruction:
      "Ellbogen unter die Schultern setzen. Bauch und Gesäß anspannen, ruhig atmen. Beenden, wenn die Haltung nicht mehr stabil ist.",
    unit: "seconds",
    weighted: false,
  },
  {
    id: "deadbug",
    name: "Dead Bug",
    muscles: ["Core"],
    equipment: "body",
    difficulty: "beginner",
    movement: "core",
    instruction:
      "In Rückenlage gegenüberliegenden Arm und Bein langsam strecken. Den unteren Rücken stabil am Boden lassen.",
    unit: "reps",
    weighted: false,
  },
  {
    id: "march",
    name: "Zügiges Gehen auf der Stelle",
    muscles: ["Ausdauer"],
    equipment: "body",
    difficulty: "beginner",
    movement: "cardio",
    instruction:
      "Gleichmäßig gehen und die Arme mitnehmen. Wähle ein Tempo, bei dem du noch in kurzen Sätzen sprechen kannst.",
    unit: "seconds",
    weighted: false,
  },
  {
    id: "bike",
    name: "Fahrrad-Ergometer",
    muscles: ["Ausdauer", "Beine"],
    equipment: "gym",
    difficulty: "beginner",
    movement: "cardio",
    instruction:
      "Sattelhöhe einstellen und mit moderatem Widerstand gleichmäßig treten. Beginne locker und steigere langsam.",
    unit: "seconds",
    weighted: false,
  },
];
export const exerciseById = (id: string) => {
  const e = exercises.find((x) => x.id === id);
  if (!e) throw new Error("Unbekannte Übung: " + id);
  return e;
};
