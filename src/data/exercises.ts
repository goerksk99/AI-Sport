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
  {
    id: "barbell-bench",
    name: "Langhantel-Bankdrücken",
    muscles: ["Brust", "Trizeps"],
    equipment: "barbell",
    difficulty: "beginner",
    movement: "push",
    instruction:
      "Auf einer geeigneten Hantelbank mit Sicherheitsablagen trainieren. Füße stabil setzen, Schulterblätter halten und die Hantel kontrolliert führen. Last bei Bedarf mit Sicherungsperson wählen.",
    unit: "reps",
    weighted: true,
  },
  {
    id: "incline-pushup",
    name: "Erhöhte Liegestütze",
    muscles: ["Brust", "Trizeps"],
    equipment: "body",
    difficulty: "beginner",
    movement: "push",
    instruction:
      "Hände auf eine stabile, dafür geeignete feste Fläche setzen. Körper gerade halten. Je höher die Hände, desto leichter die Variante.",
    unit: "reps",
    weighted: false,
  },
  {
    id: "pike",
    name: "Pike Push-ups",
    muscles: ["Schultern", "Trizeps"],
    equipment: "body",
    difficulty: "advanced",
    movement: "push",
    instruction:
      "Hüfte hoch halten und Kopf kontrolliert zwischen den Händen absenken. Nur schmerzfrei und mit stabiler Schulter ausführen; sonst Liegestütze wählen.",
    unit: "reps",
    weighted: false,
  },
  {
    id: "pullup",
    name: "Klimmzüge",
    muscles: ["Rücken", "Bizeps"],
    equipment: "pullup",
    difficulty: "advanced",
    movement: "pull",
    instruction:
      "Nur an einer sicher montierten Klimmzugstange trainieren. Ohne Schwung kontrolliert hochziehen und absenken. Falls nicht sauber möglich, Rückenheben mit Armzug wählen.",
    unit: "reps",
    weighted: false,
  },
  {
    id: "split-squat",
    name: "Split Squat",
    muscles: ["Beine", "Gesäß"],
    equipment: "body",
    difficulty: "beginner",
    movement: "squat",
    instruction:
      "Im stabilen Ausfallschritt den Körper senkrecht absenken und wieder aufrichten. Wiederholungen gelten je Seite. Mit kontrollierter Tiefe beginnen.",
    unit: "reps",
    weighted: false,
  },
  {
    id: "sideplank",
    name: "Seitstütz",
    muscles: ["Core"],
    equipment: "body",
    difficulty: "beginner",
    movement: "core",
    instruction:
      "Unterarm unter die Schulter setzen, Hüfte anheben und ruhig atmen. Zeit gilt je Seite. Als leichtere Variante die Knie ablegen.",
    unit: "seconds",
    weighted: false,
  },
  {
    id: "kb-goblet",
    name: "Kettlebell Goblet Squat",
    category: "kettlebell",
    equipment: "kettlebell",
    movement: "squat",
    instruction:
      "Kugel vor der Brust halten. Hüfte kontrolliert absenken und über den ganzen Fuß aufrichten.",
    weighted: true,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Beine", "Gesäß"],
  },

  {
    id: "kb-deadlift",
    name: "Kettlebell Deadlift",
    category: "kettlebell",
    equipment: "kettlebell",
    movement: "hinge",
    instruction:
      "Kugel zwischen den Füßen. Hüfte zurückschieben, Rücken neutral halten und die Last nah am Körper anheben.",
    weighted: true,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Gesäß", "Beinrückseite"],
  },

  {
    id: "kb-row",
    name: "Kettlebell Rudern",
    category: "kettlebell",
    equipment: "kettlebell",
    movement: "pull",
    instruction:
      "Mit einer Hand sicher abstützen, Rücken neutral halten und Kugel zur Hüfte ziehen. Wiederholungen je Seite.",
    weighted: true,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Rücken", "Bizeps"],
  },

  {
    id: "kb-floorpress",
    name: "Kettlebell Floor Press",
    category: "kettlebell",
    equipment: "kettlebell",
    movement: "push",
    instruction:
      "In Rückenlage eine Kugel kontrolliert drücken und bis zum sanften Bodenkontakt des Oberarms absenken. Wiederholungen je Seite.",
    weighted: true,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Brust", "Trizeps"],
  },

  {
    id: "kb-swing",
    name: "Kettlebell Swing",
    category: "kettlebell",
    equipment: "kettlebell",
    movement: "hinge",
    instruction:
      "Nur mit erlernter Hüftscharnier-Technik. Die Bewegung kommt aus der Hüfte, nicht aus dem Rücken oder aktivem Armheben. Leicht beginnen; bei Unsicherheit Deadlift wählen.",
    weighted: true,
    difficulty: "advanced",
    unit: "reps",
    muscles: ["Gesäß", "Beinrückseite"],
  },

  {
    id: "kb-press",
    name: "Kettlebell Schulterdrücken",
    category: "kettlebell",
    equipment: "kettlebell",
    movement: "push",
    instruction:
      "Aus stabiler Rack-Position kontrolliert nach oben drücken, Rumpf stabil halten. Wiederholungen je Seite, ohne schmerzhaftes Ausweichen.",
    weighted: true,
    difficulty: "advanced",
    unit: "reps",
    muscles: ["Schultern", "Trizeps"],
  },

  {
    id: "kb-carry",
    name: "Kettlebell Suitcase Carry",
    category: "kettlebell",
    equipment: "kettlebell",
    movement: "core",
    instruction:
      "Eine Kugel seitlich tragen, aufrecht und ohne seitliches Abknicken gehen. Zeit gilt je Seite. Das Gewicht zählt nicht als Wiederholungsvolumen.",
    weighted: true,
    difficulty: "beginner",
    unit: "seconds",
    muscles: ["Core", "Griffkraft"],
  },

  {
    id: "kb-lunge",
    name: "Kettlebell Reverse Lunge",
    category: "kettlebell",
    equipment: "kettlebell",
    movement: "squat",
    instruction:
      "Kugel vor der Brust halten und kontrolliert einen Schritt nach hinten setzen. Wiederholungen je Seite.",
    weighted: true,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Beine", "Gesäß"],
  },

  {
    id: "band-row",
    name: "Rudern mit Widerstandsband",
    category: "strength",
    equipment: "bands",
    movement: "pull",
    instruction:
      "Band nur an einem dafür ausgelegten, sicheren Punkt befestigen. Ellbogen am Körper zurückführen, kontrolliert lösen.",
    weighted: false,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Rücken", "Bizeps"],
  },

  {
    id: "band-pullapart",
    name: "Band Pull-aparts",
    category: "strength",
    equipment: "bands",
    movement: "pull",
    instruction:
      "Band auf Brusthöhe auseinanderziehen, ohne ins Hohlkreuz auszuweichen. Widerstand so wählen, dass die Schultern stabil bleiben.",
    weighted: false,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Oberer Rücken"],
  },

  {
    id: "ring-row",
    name: "Ring Rows",
    category: "calisthenics",
    equipment: "rings",
    movement: "pull",
    instruction:
      "Ringe nur an einem dafür geeigneten sicheren Aufbau nutzen. Körper gerade halten und Brust zu den Ringen ziehen. Aufrechter stehen macht es leichter.",
    weighted: false,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Rücken", "Bizeps"],
  },

  {
    id: "chinup",
    name: "Chin-ups",
    category: "calisthenics",
    equipment: "pullup",
    movement: "pull",
    instruction:
      "An einer sicher montierten Stange im Untergriff kontrolliert hochziehen und absenken. Ohne Schwung; bei Bedarf leichtere Zugübung wählen.",
    weighted: false,
    difficulty: "advanced",
    unit: "reps",
    muscles: ["Rücken", "Bizeps"],
  },

  {
    id: "negative-pullup",
    name: "Negative Klimmzüge",
    category: "calisthenics",
    equipment: "pullup",
    movement: "pull",
    instruction:
      "Nur bei sicher erreichbarer Startposition: aus oberer Position langsam absenken. Nicht unkontrolliert abspringen oder improvisierte Aufbauten verwenden.",
    weighted: false,
    difficulty: "advanced",
    unit: "reps",
    muscles: ["Rücken", "Bizeps"],
  },

  {
    id: "scap-pullup",
    name: "Scapular Pull-ups",
    category: "calisthenics",
    equipment: "pullup",
    movement: "pull",
    instruction:
      "Mit gestreckten Armen an sicher montierter Stange die Schulterblätter kontrolliert bewegen. Nur ausführen, wenn der Hang beschwerdefrei möglich ist.",
    weighted: false,
    difficulty: "advanced",
    unit: "reps",
    muscles: ["Rücken", "Schulterstabilität"],
  },

  {
    id: "close-pushup",
    name: "Enge Liegestütze",
    category: "calisthenics",
    equipment: "body",
    movement: "push",
    instruction:
      "Hände etwas enger als schulterbreit platzieren. Körper stabil und Ellbogen kontrolliert am Rumpf führen.",
    weighted: false,
    difficulty: "advanced",
    unit: "reps",
    muscles: ["Brust", "Trizeps"],
  },

  {
    id: "knee-pushup",
    name: "Knie-Liegestütze",
    category: "calisthenics",
    equipment: "body",
    movement: "push",
    instruction:
      "Knie am Boden, Rumpf und Oberschenkel in einer Linie. Brust kontrolliert absenken und wieder hochdrücken.",
    weighted: false,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Brust", "Trizeps"],
  },

  {
    id: "hollow-hold",
    name: "Hollow Hold",
    category: "calisthenics",
    equipment: "body",
    movement: "core",
    instruction:
      "In Rückenlage Bauch anspannen und unteren Rücken stabil halten. Arme und Beine nur so weit strecken, wie die Position kontrolliert bleibt.",
    weighted: false,
    difficulty: "beginner",
    unit: "seconds",
    muscles: ["Core"],
  },

  {
    id: "bird-dog",
    name: "Bird Dog",
    category: "calisthenics",
    equipment: "body",
    movement: "core",
    instruction:
      "Im Vierfüßlerstand gegenüberliegenden Arm und Bein langsam strecken. Becken ruhig halten. Wiederholungen je Seite.",
    weighted: false,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Core", "Rückenstabilität"],
  },

  {
    id: "calf-raise",
    name: "Wadenheben",
    category: "calisthenics",
    equipment: "body",
    movement: "squat",
    instruction:
      "Auf beiden Füßen langsam auf die Zehenspitzen kommen und kontrolliert absenken. Bei Bedarf an einer stabilen Fläche das Gleichgewicht sichern.",
    weighted: false,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Waden"],
  },

  {
    id: "single-bridge",
    name: "Einbeinige Glute Bridge",
    category: "calisthenics",
    equipment: "body",
    movement: "hinge",
    instruction:
      "Ein Bein anheben, Hüfte über das aufgestellte Bein kontrolliert heben. Becken gerade halten. Wiederholungen je Seite.",
    weighted: false,
    difficulty: "advanced",
    unit: "reps",
    muscles: ["Gesäß", "Beinrückseite"],
  },

  {
    id: "stepup",
    name: "Box Step-ups",
    category: "functional",
    equipment: "box",
    movement: "squat",
    instruction:
      "Auf eine standsichere Trainingsbox steigen, kontrolliert absenken. Höhe passend wählen, ohne Absprung. Wiederholungen je Seite.",
    weighted: false,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Beine", "Gesäß"],
  },

  {
    id: "thruster",
    name: "Kurzhantel Thruster",
    category: "functional",
    equipment: "dumbbell",
    movement: "push",
    instruction:
      "Nur mit sicherer Kniebeugen- und Drucktechnik: aus der Kniebeuge aufrichten und Hanteln kontrolliert nach oben drücken. Gewicht als Gesamtlast beider Hanteln eintragen.",
    weighted: true,
    difficulty: "advanced",
    unit: "reps",
    muscles: ["Beine", "Schultern"],
  },

  {
    id: "squat-reach",
    name: "Kniebeuge mit Überkopf-Reach",
    category: "functional",
    equipment: "body",
    movement: "squat",
    instruction:
      "Kontrollierte Kniebeuge, beim Aufrichten Arme nach oben führen. Bewegungsumfang so wählen, dass Rücken und Schultern stabil bleiben.",
    weighted: false,
    difficulty: "beginner",
    unit: "reps",
    muscles: ["Beine", "Ganzkörper"],
  },

  {
    id: "bear-crawl",
    name: "Bear Crawl",
    category: "functional",
    equipment: "body",
    movement: "core",
    instruction:
      "Knie knapp über dem Boden halten und langsam kleine Schritte mit gegenüberliegender Hand und Fuß machen. Rumpf stabil halten.",
    weighted: false,
    difficulty: "beginner",
    unit: "seconds",
    muscles: ["Core", "Schultern"],
  },

  {
    id: "burpee-step",
    name: "Burpee ohne Sprung",
    category: "functional",
    equipment: "body",
    movement: "cardio",
    instruction:
      "Aus dem Stand Hände aufsetzen, Füße einzeln zurück in den Stütz und wieder nach vorn führen. Ohne Sprung und ohne Zeitdruck.",
    weighted: false,
    difficulty: "beginner",
    unit: "seconds",
    muscles: ["Ausdauer"],
  },

  {
    id: "burpee",
    name: "Burpees",
    category: "functional",
    equipment: "body",
    movement: "cardio",
    instruction:
      "Nur bei sicherer Stütztechnik. Kontrolliert in den Stütz wechseln und aufrichten; Sprung optional. Bei nachlassender Kontrolle pausieren oder die schrittweise Variante wählen.",
    weighted: false,
    difficulty: "advanced",
    unit: "seconds",
    muscles: ["Ausdauer"],
  },

  {
    id: "mountain-climber",
    name: "Mountain Climbers",
    category: "functional",
    equipment: "body",
    movement: "cardio",
    instruction:
      "Im hohen Stütz Knie abwechselnd nach vorn führen. Schultern stabil halten und Tempo der sauberen Ausführung anpassen.",
    weighted: false,
    difficulty: "advanced",
    unit: "seconds",
    muscles: ["Ausdauer"],
  },

  {
    id: "walk",
    name: "Zügiges Gehen",
    category: "cardio",
    equipment: "body",
    movement: "cardio",
    instruction:
      "Auf sicherem Untergrund zügig gehen. Ein Tempo wählen, bei dem du noch in kurzen Sätzen sprechen kannst. Locker beginnen und auslaufen.",
    weighted: false,
    difficulty: "beginner",
    unit: "seconds",
    muscles: ["Ausdauer"],
  },

  {
    id: "run",
    name: "Lockeres Laufen",
    category: "cardio",
    equipment: "body",
    movement: "cardio",
    instruction:
      "Gleichmäßig in einem angenehmen Sprechtempo laufen. Gehpausen sind möglich. Mit lockerem Gehen beginnen und beenden.",
    weighted: false,
    difficulty: "advanced",
    unit: "seconds",
    muscles: ["Ausdauer"],
  },

  {
    id: "rower",
    name: "Ruderergometer",
    category: "cardio",
    equipment: "rower",
    movement: "cardio",
    instruction:
      "Zuerst mit den Beinen drücken, dann Hüfte und Arme folgen lassen. Zurück in umgekehrter Reihenfolge. Moderaten Widerstand und kontrolliertes Tempo wählen.",
    weighted: false,
    difficulty: "beginner",
    unit: "seconds",
    muscles: ["Ausdauer"],
  },

  {
    id: "treadmill",
    name: "Laufband-Gehen",
    category: "cardio",
    equipment: "treadmill",
    movement: "cardio",
    instruction:
      "Mit niedriger Geschwindigkeit starten, sicher aufsteigen und die Sicherheitsfunktion kennen. Tempo kontrolliert steigern, Gehen bleibt ausreichend.",
    weighted: false,
    difficulty: "beginner",
    unit: "seconds",
    muscles: ["Ausdauer"],
  },

  {
    id: "jump-rope",
    name: "Seilspringen",
    category: "cardio",
    equipment: "rope",
    movement: "cardio",
    instruction:
      "Mit kurzen lockeren Intervallen beginnen. Kleine Sprünge und ausreichend freie Fläche. Gehpausen nutzen, bei Beschwerden eine gelenkschonendere Alternative wählen.",
    weighted: false,
    difficulty: "advanced",
    unit: "seconds",
    muscles: ["Ausdauer"],
  },

  {
    id: "low-impact-jacks",
    name: "Step Jacks ohne Sprung",
    category: "cardio",
    equipment: "body",
    movement: "cardio",
    instruction:
      "Arme anheben und abwechselnd einen Fuß zur Seite setzen. Ohne Sprung, gleichmäßig atmen und das Tempo selbst wählen.",
    weighted: false,
    difficulty: "beginner",
    unit: "seconds",
    muscles: ["Ausdauer"],
  },
];
export const exerciseById = (id: string) => {
  const e = exercises.find((x) => x.id === id);
  if (!e) throw new Error("Unbekannte Übung: " + id);
  return e;
};
