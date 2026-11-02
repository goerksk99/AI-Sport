export type FitnessGoal = "fit" | "muscle" | "lose" | "performance";
export type Equipment = "body" | "dumbbell" | "gym";
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
};
export type PlannedWorkout = {
  id: string;
  name: string;
  focus: string;
  exercises: PlannedExercise[];
};
export type WorkoutPlan = {
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
  status: "pending" | "confirmed" | "skipped";
  confirmedAt?: string;
};
export type ExercisePerformance = {
  id: string;
  exerciseId: string;
  plannedSets: PlannedSet[];
  sets: PerformedSet[];
  restSeconds: number;
};
export type WorkoutSession = {
  id: string;
  planId: string;
  workoutId: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
  restEndsAt?: string;
  status: "draft" | "completed";
  exercises: ExercisePerformance[];
};
export type ProgressRecord = {
  sessionId: string;
  date: string;
  volume: number;
  sets: number;
  durationMinutes: number;
};
export type CoachRecommendation = {
  id: string;
  title: string;
  message: string;
  reason: string;
  tone: "neutral" | "positive";
};
export type AppData = {
  version: 1;
  profile: UserProfile | null;
  plan: WorkoutPlan | null;
  draft: WorkoutSession | null;
  sessions: WorkoutSession[];
};
