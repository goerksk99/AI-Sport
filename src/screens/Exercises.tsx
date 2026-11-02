import React, { useState } from "react";
import { View } from "react-native";
import { useStore } from "../storage/store";
import { exercises } from "../data/exercises";
import { categoryLabels, categoryOf, equipmentLabels } from "../domain/catalog";
import { availableExercises, plannedExercise } from "../domain/training";
import { ExerciseCategory } from "../domain/types";
import {
  Button,
  Card,
  Chip,
  Field,
  Label,
  T,
  C,
  styles as s,
} from "../components/ui";
import { Heading } from "./Heading";
export function Exercises() {
  const { data, update } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ExerciseCategory | "all">("all");
  const [availableOnly, setAvailableOnly] = useState(true);
  const [selected, setSelected] = useState(data.plan!.workouts[0].id);
  const [message, setMessage] = useState("");
  const profile = data.profile!;
  const workout =
    data.plan!.workouts.find((w) => w.id === selected) ||
    data.plan!.workouts[0];
  const ids = new Set(availableExercises(profile).map((e) => e.id));
  const shown = exercises.filter(
    (e) =>
      (!availableOnly || ids.has(e.id)) &&
      (category === "all" || categoryOf(e) === category) &&
      `${e.name} ${e.muscles.join(" ")} ${equipmentLabels[e.equipment]} ${categoryLabels[categoryOf(e)]}`
        .toLocaleLowerCase("de-DE")
        .includes(search.trim().toLocaleLowerCase("de-DE")),
  );
  function add(id: string) {
    update((d) => {
      const target = d.plan!.workouts.find((w) => w.id === workout.id);
      if (!target || target.exercises.some((e) => e.exerciseId === id))
        return d;
      return {
        ...d,
        plan: {
          ...d.plan!,
          workouts: d.plan!.workouts.map((w) =>
            w.id === target.id
              ? {
                  ...w,
                  exercises: [
                    ...w.exercises,
                    {
                      ...plannedExercise(id, d.profile!),
                      editedAt: new Date().toISOString(),
                    },
                  ],
                }
              : w,
          ),
        },
      };
    });
    setMessage(
      "Übung zum zukünftigen Training hinzugefügt. Laufende Einheit und Historie bleiben unverändert.",
    );
  }
  return (
    <>
      <Heading
        eyebrow="DEINE ÜBUNGEN"
        title="Mehr Möglichkeiten für dein Training."
        description={`${exercises.length} Übungen mit Anleitung. Suche, filtere und ergänze deinen Plan.`}
      />
      <Field
        label="Übung suchen"
        value={search}
        onChange={setSearch}
        placeholder="Name oder Muskelgruppe"
      />
      <View style={s.wrap}>
        <Chip
          label="Alle Kategorien"
          selected={category === "all"}
          onPress={() => setCategory("all")}
        />
        {Object.entries(categoryLabels).map(([v, l]) => (
          <Chip
            key={v}
            label={l}
            selected={category === v}
            onPress={() => setCategory(v as ExerciseCategory)}
          />
        ))}
      </View>
      <View style={s.wrap}>
        <Chip
          label="Mit meinem Equipment"
          selected={availableOnly}
          onPress={() => setAvailableOnly(true)}
        />
        <Chip
          label="Gesamten Katalog ansehen"
          selected={!availableOnly}
          onPress={() => setAvailableOnly(false)}
        />
      </View>
      <Label>ZU WELCHEM TRAINING HINZUFÜGEN?</Label>
      <View style={s.wrap}>
        {data.plan!.workouts.map((w) => (
          <Chip
            key={w.id}
            label={w.name}
            selected={workout.id === w.id}
            onPress={() => {
              setSelected(w.id);
              setMessage("");
            }}
          />
        ))}
      </View>
      {!!message && <T style={{ color: C.accent }}>{message}</T>}
      <T muted>
        {shown.length} passende Übungen. Fortgeschrittene Varianten werden für
        Einsteiger nicht automatisch eingeplant.
      </T>
      {!shown.length && (
        <Card>
          <T>Keine passende Übung gefunden.</T>
          <T muted>
            Ändere den Suchbegriff, die Kategorie oder den Equipment-Filter.
          </T>
        </Card>
      )}
      {shown.map((e) => {
        const added = workout.exercises.some((x) => x.exerciseId === e.id);
        return (
          <Card key={e.id}>
            <Label>{categoryLabels[categoryOf(e)].toUpperCase()}</Label>
            <T style={s.h2}>{e.name}</T>
            <T muted>
              {e.muscles.join(" · ")} · {equipmentLabels[e.equipment]} ·{" "}
              {e.difficulty === "advanced" ? "Fortgeschritten" : "Einsteiger"}
            </T>
            <T>{e.instruction}</T>
            {!ids.has(e.id) && (
              <T style={{ color: C.red }}>
                Dieses Equipment oder diese Übungsart ist in deinem Profil nicht
                freigegeben. Passe dein Profil an, bevor du sie einplanst.
              </T>
            )}
            <Button
              label={added ? "Bereits im Training" : `Hinzufügen: ${e.name}`}
              secondary
              disabled={added || !ids.has(e.id)}
              onPress={() => add(e.id)}
            />
          </Card>
        );
      })}
      <T muted style={{ fontSize: 12 }}>
        Functional / CrossFit bezeichnet hier funktionelle Übungsauswahl, kein
        vorgegebenes Wettkampfprogramm. Die Bibliothek ersetzt keine
        Technikbeurteilung.
      </T>
    </>
  );
}
