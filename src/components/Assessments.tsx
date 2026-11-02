import React, { useState } from "react";
import { View } from "react-native";
import { SelfAssessment, UserProfile } from "../domain/types";
import { trainingStyles } from "../domain/preferences";
import { availableExercises } from "../domain/training";
import { exerciseById } from "../data/exercises";
import { Button, Card, Chip, Field, Label, T, C, styles as s } from "./ui";
export function Assessments({
  profile,
  value,
  onChange,
}: {
  profile: UserProfile;
  value: SelfAssessment[];
  onChange: (a: SelfAssessment[]) => void;
}) {
  const options = availableExercises(profile).filter(
    (e) => e.movement !== "cardio",
  );
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(
    options.find((e) => e.id === "barbell-bench")?.id || options[0].id,
  );
  const [weight, setWeight] = useState("");
  const [minSets, setMinSets] = useState("3");
  const [maxSets, setMaxSets] = useState("4");
  const [minReps, setMinReps] = useState("6");
  const [maxReps, setMaxReps] = useState("10");
  const [error, setError] = useState("");
  const ex = exerciseById(selected);
  function select(id: string) {
    setSelected(id);
    const a = value.find((x) => x.exerciseId === id);
    setWeight(a?.weight?.toString() || "");
    setMinSets(String(a?.setsMin || 3));
    setMaxSets(String(a?.setsMax || 4));
    setMinReps(String(a?.repsMin || 6));
    setMaxReps(String(a?.repsMax || 10));
    setError("");
  }
  function save() {
    const vals = [minSets, maxSets, minReps, maxReps].map(Number);
    const [smin, smax, rmin, rmax] = vals;
    const w = weight.trim() ? Number(weight.replace(",", ".")) : undefined;
    if (
      !vals.every((n) => Number.isInteger(n) && n > 0) ||
      smin > smax ||
      smax > 8 ||
      rmin > rmax ||
      rmax > 10000 ||
      (w !== undefined && (!Number.isFinite(w) || w < 0 || w > 1000))
    ) {
      setError(
        "Bitte gültige Bereiche eingeben: 1–8 Sätze, positive Wiederholungen / Sekunden und optional 0–1000 kg.",
      );
      return;
    }
    onChange([
      ...value.filter((a) => a.exerciseId !== selected),
      {
        exerciseId: selected,
        trainingStyle: profile.trainingStyle || "strength",
        weight: ex.weighted ? w : undefined,
        setsMin: smin,
        setsMax: smax,
        repsMin: rmin,
        repsMax: rmax,
        updatedAt: new Date().toISOString(),
      },
    ]);
    setOpen(false);
  }
  return (
    <View style={{ gap: 12 }}>
      <Label>FREIWILLIGE AUSGANGSWERTE</Label>
      <T muted style={{ fontSize: 12 }}>
        Du kennst deine üblichen Leistungen? Hinterlege sie einmal. Kein
        Maximaltest nötig; die Angaben sind keine bestätigten Trainings.
      </T>
      {value.map((a) => (
        <Card key={a.exerciseId} style={{ padding: 14 }}>
          <T>{exerciseById(a.exerciseId).name}</T>
          <T muted>
            {a.setsMin}–{a.setsMax} Sätze · {a.repsMin}–{a.repsMax}
            {exerciseById(a.exerciseId).unit === "seconds" ? " Sek." : " Wdh."}
            {a.weight !== undefined ? " · " + a.weight + " kg" : ""} ·
            Selbsteinschätzung
          </T>
          <View style={s.wrap}>
            <Button
              label={`Bearbeiten: ${exerciseById(a.exerciseId).name}`}
              secondary
              small
              onPress={() => {
                select(a.exerciseId);
                setOpen(true);
              }}
            />
            <Button
              label={`Entfernen: ${exerciseById(a.exerciseId).name}`}
              secondary
              small
              onPress={() =>
                onChange(value.filter((x) => x.exerciseId !== a.exerciseId))
              }
            />
          </View>
        </Card>
      ))}
      <Button
        label={
          open ? "Eingabe schließen" : "Ausgangswerte hinzufügen (optional)"
        }
        secondary
        onPress={() => {
          if (!open) select(selected);
          setOpen(!open);
        }}
      />
      {open && (
        <Card>
          <View style={s.wrap}>
            {options.map((e) => (
              <Chip
                key={e.id}
                label={e.name}
                selected={selected === e.id}
                onPress={() => select(e.id)}
              />
            ))}
          </View>
          <View style={s.row}>
            <Field
              label="Sätze von"
              value={minSets}
              onChange={setMinSets}
              numeric
            />
            <Field
              label="Sätze bis"
              value={maxSets}
              onChange={setMaxSets}
              numeric
            />
          </View>
          <View style={s.row}>
            <Field
              label={
                ex.unit === "seconds" ? "Sekunden von" : "Wiederholungen von"
              }
              value={minReps}
              onChange={setMinReps}
              numeric
            />
            <Field
              label={
                ex.unit === "seconds" ? "Sekunden bis" : "Wiederholungen bis"
              }
              value={maxReps}
              onChange={setMaxReps}
              numeric
            />
          </View>
          {ex.weighted && (
            <Field
              label="Übliches Gewicht kg (optional)"
              value={weight}
              onChange={setWeight}
              numeric
            />
          )}
          {!!error && <T style={{ color: C.red }}>{error}</T>}
          <Button label="Ausgangswerte übernehmen" onPress={save} />
        </Card>
      )}
    </View>
  );
}
