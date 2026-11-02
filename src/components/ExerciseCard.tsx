import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { ExercisePerformance, PerformedSet } from "../domain/types";
import { editExercise, exerciseSummary } from "../domain/training";
import { exerciseById } from "../data/exercises";
import { SetEditor } from "./SetEditor";
import { Button, Card, Field, Label, T, C, styles as s } from "./ui";
export function ExerciseCard({
  performance: e,
  detailed,
  onReplace,
  onStatus,
  onSet,
  onValidity,
  onPause,
}: {
  performance: ExercisePerformance;
  detailed: boolean;
  onReplace: (e: ExercisePerformance) => void;
  onStatus: (status: "confirmed" | "skipped") => void;
  onSet: (sid: string, p: Partial<PerformedSet>) => void;
  onValidity: (id: string, valid: boolean) => void;
  onPause: () => void;
}) {
  const ex = exerciseById(e.exerciseId);
  const [editing, setEditing] = useState(!!e.editDraft);
  const [individual, setIndividual] = useState(false);
  const [count, setCount] = useState(
    e.editDraft?.count ?? String(e.sets.length),
  );
  const [reps, setReps] = useState(e.editDraft?.reps ?? String(e.sets[0].reps));
  const [weight, setWeight] = useState(
    e.editDraft?.weight ?? e.sets[0].weight?.toString() ?? "",
  );
  const [error, setError] = useState("");
  useEffect(() => {
    onValidity(e.id, !editing);
    return () => onValidity(e.id, true);
  }, [editing, e.id, onValidity]);
  const statuses = new Set(e.sets.map((s) => s.status));
  const label =
    statuses.size > 1
      ? "Teilweise dokumentiert"
      : e.sets[0].status === "confirmed"
        ? "Geschafft · bestätigt"
        : e.sets[0].status === "assumed"
          ? "Nach Plan angenommen"
          : e.sets[0].status === "skipped"
            ? "Ausgelassen"
            : "Vorschlag · offen";
  const beginEdit = () => {
    setCount(String(e.sets.length));
    setReps(String(e.sets[0].reps));
    setWeight(e.sets[0].weight?.toString() || "");
    setError("");
    onReplace({
      ...e,
      editDraft: {
        count: String(e.sets.length),
        reps: String(e.sets[0].reps),
        weight: e.sets[0].weight?.toString() || "",
      },
    });
    setEditing(true);
  };
  function buffer(field: "count" | "reps" | "weight", value: string) {
    if (value.length > 32) return;
    if (field === "count") setCount(value);
    else if (field === "reps") setReps(value);
    else setWeight(value);
    onReplace({ ...e, editDraft: { count, reps, weight, [field]: value } });
  }
  function save() {
    try {
      if (!count.trim() || !reps.trim())
        throw new Error("Bitte Sätze und Wiederholungen / Sekunden eintragen.");
      onReplace(
        editExercise(
          e,
          Number(count),
          Number(reps),
          weight.trim() ? Number(weight.replace(",", ".")) : undefined,
        ),
      );
      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }
  return (
    <Card>
      <View style={{ gap: 5 }}>
        <Label>{ex.muscles.join(" · ").toUpperCase()}</Label>
        <T style={s.h2}>{ex.name}</T>
        <T style={{ color: C.accent, fontSize: 21, fontWeight: "700" }}>
          {exerciseSummary(e)}
        </T>
        <T muted style={{ fontSize: 12 }}>
          {label}
        </T>
        <T muted style={{ fontSize: 11 }}>
          {e.source === "history"
            ? "Aus deiner letzten bestätigten Leistung"
            : e.source === "assessment"
              ? "Aus deiner Selbsteinschätzung"
              : "Aus deinem Plan"}{" "}
          · {e.restSeconds} s Pause
        </T>
      </View>
      {!editing && (
        <View style={s.wrap}>
          <Button
            label="Geschafft"
            accessibilityLabel={`${ex.name}: geschafft`}
            icon="check"
            small
            onPress={() => onStatus("confirmed")}
          />
          <Button
            label="Ändern"
            accessibilityLabel={`${ex.name}: ändern`}
            secondary
            small
            onPress={beginEdit}
          />
          <Button
            label="Ausgelassen"
            accessibilityLabel={`${ex.name}: auslassen`}
            secondary
            small
            onPress={() => onStatus("skipped")}
          />
        </View>
      )}
      {editing && (
        <View style={{ gap: 14 }}>
          <T>Gemeinsame Werte für diese Übung</T>
          <View style={s.row}>
            <Field
              label={`Sätze ${ex.name}`}
              numeric
              value={count}
              onChange={(v) => buffer("count", v)}
            />
            <Field
              label={`${ex.unit === "seconds" ? "Sekunden" : "Wiederholungen"} ${ex.name}`}
              numeric
              value={reps}
              onChange={(v) => buffer("reps", v)}
            />
          </View>
          {ex.weighted && (
            <Field
              label={`Gewicht kg ${ex.name} (optional)`}
              numeric
              value={weight}
              onChange={(v) => buffer("weight", v)}
              placeholder="Nach Anstrengung wählen"
            />
          )}
          {!!error && <T style={{ color: C.red }}>{error}</T>}
          <Button label="Werte übernehmen & geschafft" onPress={save} />
          <Button
            label="Abbrechen"
            secondary
            small
            onPress={() => {
              setEditing(false);
              onReplace({ ...e, editDraft: undefined });
              setError("");
            }}
          />
        </View>
      )}
      {!editing && (
        <Button
          label={individual ? "Details schließen" : "Einzelne Sätze bearbeiten"}
          secondary
          small
          onPress={() => setIndividual(!individual)}
        />
      )}
      {!editing && (detailed || individual) && (
        <View style={{ gap: 12 }}>
          <T muted style={{ fontSize: 12 }}>
            {ex.instruction}
          </T>
          {e.sets.map((set, i) => (
            <SetEditor
              key={set.id}
              set={set}
              index={i}
              weighted={ex.weighted}
              unit={ex.unit}
              patch={(p) => onSet(set.id, p)}
              onValidity={onValidity}
              onConfirm={() => {
                onSet(set.id, {
                  status: "confirmed",
                  confirmedAt: new Date().toISOString(),
                });
                onPause();
              }}
            />
          ))}
          <Button
            label="Pause starten"
            small
            secondary
            icon="clock"
            onPress={onPause}
          />
        </View>
      )}
    </Card>
  );
}
