export type FitnessGoal = "fit" | "muscle" | "lose" | "performance";
export type Equipment = "body" | "dumbbell" | "gym" | "barbell" | "pullup";
export type TrainingStyle = "strength" | "endurance" | "calisthenics" | "mixed";
export type DocumentationMode = "simple" | "quick" | "detailed";
export type SelfAssessment = {
  exerciseId: string;
  weight?: number;
  setsMin: number;
  setsMax: number;
  repsMin: number;
  repsMax: number;
  updatedAt: string;
};
export type UserProfile = {
  id: string;
  createdAt: string;
  name: string;
  goal: FitnessGoal;
  level: "beginner" | "advanced";
  days: number;
  minutes: number;
  location: "home" | "gym";
  equipment: Equipment[];
  preferences: ("strength" | "cardio")[];
  weight?: number;
  limitations?: string;
  trainingStyle?: TrainingStyle;
  assessments?: SelfAssessment[];
};
export type Exercise = {
  id: string;
  name: string;
  muscles: string[];
  equipment: Equipment;
  difficulty: "beginner" | "advanced";
  movement: "push" | "pull" | "squat" | "hinge" | "core" | "cardio";
  instruction: string;
  unit: "reps" | "seconds";
  weighted: boolean;
};
export type PlannedSet = { id: string; reps: number; weight?: number };
export type PlannedExercise = {
  id: string;
  exerciseId: string;
  sets: PlannedSet[];
  restSeconds: number;
  editedAt?: string;
  source?: "plan" | "assessment" | "history";
};
export type PlannedWorkout = {
  id: string;
  name: string;
  focus: string;
  exercises: PlannedExercise[];
};
export type WorkoutPlan = {
  trainingStyle?: TrainingStyle;
  id: string;
  profileId: string;
  createdAt: string;
  rationale: string;
  workouts: PlannedWorkout[];
};
export type PerformedSet = {
  id: string;
  plannedSetId: string;
  reps: number;
  weight?: number;
  status: "pending" | "confirmed" | "skipped" | "assumed";
  confirmedAt?: string;
};
export type ExercisePerformance = {
  editDraft?: { count: string; reps: string; weight: string };
  id: string;
  exerciseId: string;
  plannedSets: PlannedSet[];
  sets: PerformedSet[];
  restSeconds: number;
  source?: "plan" | "assessment" | "history";
};
export type WorkoutSession = {
  trainingStyle?: TrainingStyle;
  id: string;
  planId: string;
  workoutId: string;
  name: string;
  startedAt: string;
  trainingDate?: string;
  completedAt?: string;
  updatedAt: string;
  performanceUpdatedAt?: string;
  restEndsAt?: string;
  documentationMode?: DocumentationMode;
  durationUnknown?: boolean;
  enteredDurationMinutes?: number;
  status: "draft" | "completed";
  exercises: ExercisePerformance[];
};
export type ProgressRecord = {
  sessionId: string;
  date: string;
  volume: number;
  sets: number;
  durationMinutes: number | null;
  assumedSets: number;
};
export type CoachRecommendation = {
  id: string;
  title: string;
  message: string;
  reason: string;
  tone: "neutral" | "positive";
  adjustment?: { exerciseId: string; kind: "reps" | "weight"; value: number };
};
export type CalendarSchedule = {
  planId: string;
  from: string;
  weekdays: number[];
};
export type CalendarOverride = {
  planId: string;
  kind: "rest" | "workout";
  workoutId?: string;
};
export type AppData = {
  calendarSchedules?: CalendarSchedule[];
  calendarOverrides?: Record<string, CalendarOverride>;
  version: 1;
  profile: UserProfile | null;
  plan: WorkoutPlan | null;
  draft: WorkoutSession | null;
  sessions: WorkoutSession[];
};
