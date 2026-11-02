import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useStore } from "../storage/store";
import {
  availableExercises,
  plannedExercise,
  startSession,
  targetRange,
  exerciseSummary,
} from "../domain/training";
import { equipmentLabels } from "../domain/catalog";
import { effortHint } from "../domain/preferences";
import { exerciseById } from "../data/exercises";
import { goals } from "../components/Onboarding";
import { Button, Card, Chip, Icon, T, C, styles as s } from "../components/ui";
import { Heading } from "./Heading";
export function Training() {
  const { data, update } = useStore();
  const [selected, setSelected] = useState(0);
  const [swap, setSwap] = useState<string | null>(null);
  const p = data.profile!;
  const plan = data.plan!;
  const w = plan.workouts[selected] || plan.workouts[0];
  function edit(id: string, patch: Partial<(typeof w.exercises)[number]>) {
    update((d) => ({
      ...d,
      plan: {
        ...d.plan!,
        workouts: d.plan!.workouts.map((x) =>
          x.id !== w.id
            ? x
            : {
                ...x,
                exercises: x.exercises.map((e) =>
                  e.id === id
                    ? { ...e, ...patch, editedAt: new Date().toISOString() }
                    : e,
                ),
              },
        ),
      },
    }));
  }
  return (
    <>
      <Heading
        eyebrow="DEIN PLAN"
        title="Ein klarer Plan. Dein Spielraum."
        description={`${p.days} Einheiten pro Woche · ${goals[p.goal]}`}
      />
      <Button
        label="Übungsbibliothek"
        icon="search"
        secondary
        onPress={() => router.navigate("/exercises")}
      />
      <Button
        label="Kalender & Ruhetage"
        icon="calendar"
        secondary
        onPress={() => router.navigate("/calendar")}
      />
      <Card>
        <View style={s.row}>
          <Icon name="sliders" color={C.accent} />
          <T style={{ flex: 1, fontSize: 13, color: C.muted }}>
            {plan.rationale}
          </T>
        </View>
      </Card>
      <View style={s.wrap}>
        {plan.workouts.map((x, i) => (
          <Chip
            key={x.id}
            label={x.name}
            selected={selected === i}
            onPress={() => {
              setSelected(i);
              setSwap(null);
            }}
          />
        ))}
      </View>
      <View style={[s.row, { justifyContent: "space-between" }]}>
        <View>
          <T style={s.h2}>{w.name}</T>
          <T muted>
            {w.exercises.length} Übungen · ca. {p.minutes} Min.
          </T>
        </View>
        <Button
          label={data.draft ? "Fortsetzen" : "Starten"}
          icon="play"
          onPress={() => {
            if (!data.draft)
              update((d) => ({
                ...d,
                draft: startSession(d.plan!, w.id, d.sessions),
              }));
            router.push("/session");
          }}
        />
      </View>
      {!data.draft && (
        <Button
          label="Dieses Training nachtragen"
          secondary
          onPress={() => {
            update((d) => ({
              ...d,
              draft: startSession(d.plan!, w.id, d.sessions, { posthoc: true }),
            }));
            router.push("/session");
          }}
        />
      )}
      <T muted>{effortHint(p.trainingStyle)}</T>
      {w.exercises.map((pe, index) => {
        const e = exerciseById(pe.exerciseId);
        return (
          <Card key={pe.id}>
            <View style={s.row}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: C.raised,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <T style={{ color: C.accent, fontWeight: "700" }}>
                  {String(index + 1).padStart(2, "0")}
                </T>
              </View>
              <View style={{ flex: 1 }}>
                <T style={{ fontSize: 18, fontWeight: "700" }}>{e.name}</T>
                <T muted style={{ fontSize: 12 }}>
                  {e.muscles.join(" · ")} · {equipmentLabels[e.equipment]}
                </T>
              </View>
              <Button
                label={swap === pe.id ? "Schließen" : "Tauschen"}
                secondary
                small
                onPress={() => setSwap(swap === pe.id ? null : pe.id)}
              />
            </View>
            <T muted style={{ fontSize: 13 }}>
              {e.instruction}
            </T>
            <View style={s.wrap}>
              <View style={[s.row, { gap: 7 }]}>
                <Button
                  label="−"
                  accessibilityLabel={`Weniger Sätze ${index + 1}`}
                  small
                  secondary
                  disabled={pe.sets.length <= 1}
                  onPress={() => edit(pe.id, { sets: pe.sets.slice(0, -1) })}
                />
                <T>{pe.sets.length} Sätze</T>
                <Button
                  label="+"
                  accessibilityLabel={`Mehr Sätze ${index + 1}`}
                  small
                  secondary
                  disabled={pe.sets.length >= 6}
                  onPress={() =>
                    edit(pe.id, {
                      sets: [
                        ...pe.sets,
                        { ...pe.sets[0], id: `${pe.id}-${Date.now()}` },
                      ],
                    })
                  }
                />
              </View>
            </View>
            <View style={s.wrap}>
              <T muted style={{ fontSize: 13 }}>
                Ziel: {targetRange(pe.sets[0].reps, e.unit)}
              </T>
              <Button
                label={`${pe.restSeconds} s Pause`}
                small
                secondary
                onPress={() =>
                  edit(pe.id, {
                    restSeconds:
                      pe.restSeconds >= 120 ? 30 : pe.restSeconds + 15,
                  })
                }
              />
              <Button
                label="Ziel ändern"
                small
                secondary
                onPress={() =>
                  edit(pe.id, {
                    sets: pe.sets.map((x) => ({
                      ...x,
                      reps:
                        e.unit === "seconds"
                          ? x.reps >= 120
                            ? 20
                            : x.reps + 10
                          : x.reps >= 15
                            ? 6
                            : x.reps + 1,
                    })),
                  })
                }
              />
            </View>
            {pe.source === "assessment" && (
              <T style={{ color: C.accent, fontSize: 12 }}>
                Vorschlag aus deiner Selbsteinschätzung
                {pe.sets[0].weight !== undefined
                  ? ` · ${pe.sets[0].weight} kg`
                  : ""}
              </T>
            )}
            {e.weighted && (
              <T muted style={{ fontSize: 12 }}>
                Last beim Training frei wählen. Bestätigte letzte Werte werden
                vorgeschlagen.
              </T>
            )}
            {swap === pe.id && (
              <View
                style={{
                  gap: 10,
                  borderTopWidth: 1,
                  borderColor: C.line,
                  paddingTop: 16,
                }}
              >
                <T muted>
                  Alternativen für{" "}
                  {e.movement === "core" ? "Core" : e.muscles[0]}
                </T>
                {availableExercises(p)
                  .filter(
                    (x) =>
                      x.movement === e.movement &&
                      x.id !== e.id &&
                      !w.exercises.some((y) => y.exerciseId === x.id),
                  )
                  .map((x) => (
                    <Button
                      key={x.id}
                      label={x.name}
                      secondary
                      onPress={() => {
                        edit(pe.id, { ...plannedExercise(x.id, p), id: pe.id });
                        setSwap(null);
                      }}
                    />
                  ))}
                {!availableExercises(p).some(
                  (x) =>
                    x.movement === e.movement &&
                    x.id !== e.id &&
                    !w.exercises.some((y) => y.exerciseId === x.id),
                ) && (
                  <T muted>
                    Für dieses Equipment gibt es keine weitere passende
                    Alternative.
                  </T>
                )}
              </View>
            )}
          </Card>
        );
      })}
      <T muted style={{ fontSize: 12 }}>
        Änderungen gelten für künftige Trainings. Eine laufende Einheit behält
        ihren eigenen Planstand.
      </T>
    </>
  );
}
